# Eric Hurchey Portfolio

Static portfolio site with two views:

- `terminal` mode for the command-line portfolio experience
- `gui` mode for the visual portfolio experience

## Structure

- `index.html`
  App shell and shared containers for terminal mode, GUI mode, hack mode, and quick commands.

- `content.js`
  Central source of truth for portfolio copy, projects, experience, contact info, and quick-command data.

- `main.js`
  Rendering logic, terminal behavior, virtual filesystem content, and interaction wiring.

- `quant.html`
  Quant-themed portfolio subsite entry point.

- `quant.js`
  Rendering logic for the quant subsite, using shared content from `content.js`.

- `quant-style.css`
  Visual system for the quant subsite.

- `style.css`
  Shared visual system for terminal, GUI, quick commands, and hack mode.

- `scripts/check-js-syntax.sh`
  Repo-local syntax check script for `content.js`, `main.js`, and `quant.js`. It uses `node` from `PATH` when available and falls back to `~/.nvm`.

- `hacking-game.html`
  Standalone legacy hack-mode page kept alongside the in-app overlay version.

## Updating Content

Edit `content.js` when you want to change:

- current role or life updates
- project inventory
- experience timeline
- contact links
- quick command labels and targets

Edit `main.js` only when you want to change behavior or layout generation.

## Verification

Run:

```sh
./scripts/check-js-syntax.sh
```
