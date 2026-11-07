# herdr-layouts

Layouts, mods and themes for the [Herdr](https://herdr.dev) desktop app
(herdr-app): `dylan`, `discord`, `imessage`, `teams` and `vs` under `layouts/`,
their mods under `mods/`, themes under `themes/`.

Deployed by a NixOS/Home Manager config
([DMGDy/nixos-configuration](https://github.com/DMGDy/nixos-configuration),
`programs.herdr-app`), which takes this repo as a flake input and copies
`layouts/`, `mods/` and `themes/` into `~/.config/herdr-app` on switch.

Third-party art isn't kept here: the Discord layout's catgirl avatars and
portraits, and its icon sets (Lucide, Simple Icons), are fetched and prepared
at build time by that config (`herdr-app/avatars.nix`, `herdr-app/icons.nix`).

## Working on them

Change things live in the app, then run `herdr-app-save` (it copies your own
layouts, mods and themes back into this checkout), review, commit and push.
The NixOS config picks the new version up with
`nix flake update herdr-layouts`.
