# herdr-layouts

Layouts, mods and themes for the [Herdr](https://herdr.dev) desktop app
(herdr-app): `dylan`, `discord`, `imessage`, `teams` and `vs` under `layouts/`,
their mods under `mods/`, themes under `themes/`.

## Discord

![The Discord layout: servers in the rail, a channel's chat, and the split view
with the agent's terminal](layouts/discord.png)

<sub>Avatars are blurred in the preview: they're third-party anime art, which
isn't published here.</sub>

Every space is a server and every tab a channel; the agents are kittens.

- **Chat** (`discord-chat`): the channel's agent as a conversation. Claude Code
  and pi channels read the agent's own session file, so the whole history is
  there with real times, and only final replies show (no thinking or tool
  output). Drag to select lines, Ctrl+C to copy, Ctrl+F to search; images and
  files can be pasted, dropped or picked and are shown as thumbnails.
- **Watch Stream**: the agent's live terminal, with "Show Chat" docking the
  conversation beside it. **Split** opens the terminal beside the chat instead,
  and **Shell** adds a shell of your own for the channel under it.
- **Servers and members**: each server's picture is a fitting logo (Simple
  Icons) or icon (Lucide); the member list has Discord's status shapes, APP
  and server tags, and what each agent is doing. A small model names every
  agent after its session ("Git Kitten") and writes its bio.
- **Profiles**: hover a member for a Nitro-style card with an animated
  portrait, avatar decoration, profile effect and theme.
- **Look**: a dusk gradient theme with translucent panels; sub-agents as
  threads, every run as a post in the `#agents` forum.

## Deployment

Deployed by a NixOS/Home Manager config
([DMGDy/nixos-configuration](https://github.com/DMGDy/nixos-configuration),
`programs.herdr-app`), which takes this repo as a flake input and copies
`layouts/`, `mods/` and `themes/` into `~/.config/herdr-app` on switch.

Third-party art isn't kept here: the Discord layout's catgirl avatars and
portraits, and its icon sets (Lucide, Simple Icons), are fetched and prepared
at build time by that config (`herdr-app/avatars.nix`, `herdr-app/icons.nix`).
Without them the layout still works, with initials and no icons.

## Working on them

Change things live in the app, then run `herdr-app-save` (it copies your own
layouts, mods and themes back into this checkout), review, commit and push.
The NixOS config picks the new version up with
`nix flake update herdr-layouts`.
