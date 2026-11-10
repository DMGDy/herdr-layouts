// Codex keeps each conversation as JSONL in ~/.codex/sessions/<y>/<m>/<d>/rollout-*.jsonl
// and keeps that file open while it runs, so a Codex channel finds the file
// through its process (/proc/<pid>/fd) and reads it: your messages, its final
// answers (not its commentary or tool calls) and their times.
import { hc, exec } from "herdr";

const machineOf = (term) => term.includes("/") ? term.slice(0, term.lastIndexOf("/")) : null;

// The session file the process has open.
const OPEN = `ls -l /proc/$1/fd 2>/dev/null | sed -n 's#.* -> \\(.*/\\.codex/sessions/.*\\.jsonl\\)$#\\1#p' | head -n 1`;

// The session's messages after line k, numbered (the rest of the file is its
// instructions, tools and bookkeeping). Pasted images keep their place but not
// their data.
const READ = `awk -v k="$2" 'NR > k && /"type":"response_item"/ && /"role":"(user|assistant)"/ {
  gsub(/"image_url":"data:[^"]*"/, "\\"image_url\\":\\"\\"");
  print NR "\\t" $0
}' "$1"`;

const run = async (script, args, on) => {
  const r = await exec("sh", ["-c", script, "sh", ...args], { on });
  if (r.code !== 0) throw new Error(r.stderr || `exit ${r.code}`);
  return r.stdout;
};

// Adds numbered lines to the session's messages. The last line may be one
// Codex is still writing: stop there and read it again next time. An
// unreadable line with more after it is damage (a crash can leave a line of
// zero bytes) and is skipped.
function take(s, stdout) {
  let added = false;
  const rows = stdout.split("\n").filter((r) => r.includes("\t"));
  for (const [k, raw] of rows.entries()) {
    const tab = raw.indexOf("\t");
    let e;
    try { e = JSON.parse(raw.slice(tab + 1)); } catch (_e) { if (k === rows.length - 1) break; s.line = Number(raw.slice(0, tab)); continue; }
    s.line = Number(raw.slice(0, tab));
    s.entries.push(e);
    added = true;
  }
  return added;
}

const text = (p) => (p.content ?? []).filter((c) => c?.type === "input_text" || c?.type === "output_text").map((c) => c.text ?? "").join("\n").trim();
const pictures = (p) => (p.content ?? []).filter((c) => c?.type === "input_image").length;

// Your messages (not the context Codex adds for itself) and its final answers.
export function conversation(s) {
  const out = [];
  for (const e of s.entries) {
    const p = e.payload ?? {}, at = Date.parse(e.timestamp) || null;
    if (p.role === "user") {
      const meta = p.internal_chat_message_metadata_passthrough ?? {};
      const kinds = meta.content_item_kinds ?? [], from = (meta.content_item_metadata ?? []).map((m) => m?.provenance?.type);
      if (!kinds.includes("user.text") && !from.includes("user")) continue;
      const said = [text(p), "🖼".repeat(pictures(p))].filter(Boolean).join(" ");
      if (said) out.push({ who: "you", text: said, at });
    } else if (p.role === "assistant" && (p.phase ?? "final_answer") === "final_answer") {
      const said = text(p);
      if (said) out.push({ who: "agent", text: said, at });
    }
  }
  return out;
}

// The terminal's Codex and the session file it has open. Null when the
// terminal isn't running Codex, or it has no session yet.
export async function locate(term) {
  const fg = JSON.parse((await hc(["get", term])).stdout).foreground;
  if (!fg?.pid || !/codex/i.test(`${fg.name} ${fg.argv?.[0] ?? ""}`)) return null;
  const on = machineOf(term);
  const file = (await run(OPEN, [String(fg.pid)], on)).trim();
  return file ? { term, on, file, pid: fg.pid } : null;
}

export const open = (found) => ({ ...found, entries: [], line: 0 });

// Reads what Codex added since last time. True when the conversation changed.
export async function update(s) {
  return take(s, await run(READ, [s.file, String(s.line)], s.on));
}

// Still that process with that file? (/new and /resume open another.)
export async function stillThere(s) {
  const fg = JSON.parse((await hc(["get", s.term])).stdout).foreground;
  if (fg?.pid !== s.pid) return false;
  try { return (await run(OPEN, [String(s.pid)], s.on)).trim() === s.file; } catch (_e) { return false; }
}
