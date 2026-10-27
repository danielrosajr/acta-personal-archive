# ACTA v0.2.1-alpha — Settings & Tutorial Hotfix

**Release type:** Bug fix / patch. **Previous version:** v0.2.0-alpha.

## Fixed
- Restored Settings and Codex screens by explicitly importing the missing `CATEGORIES` constant into the main UI module.
- New empty archives now automatically launch the 15-step guided tutorial; previously only a welcome toast was displayed.
- Added an always-available guide button in the app header to restart the tutorial without needing Settings.
- Bumped the service-worker cache identifier to help browsers retrieve the updated bundle.
- Added import-contract and tutorial-launch regression tests.

## Compatibility
- Fully compatible with v0.2.0-alpha schema 2 data and existing v0.1.0 archives after automatic migration.
- No backend, account or online service required for core functions. Private archive data remains in local IndexedDB under the current browser origin.
- Updating the public repository **does not migrate or erase** browser-stored content. Backups are still strongly recommended.

## Upgrade
Replace the modified files using GitHub's **Add file → Upload files**, or upload the complete new project. Keep your repository name and Pages URL unchanged. See `docs/HOTFIX-v0.2.1.md`. If the previous JS remains in cache, unregister the service worker in browser developer tools and hard-refresh **without clearing site data**.

## Verification
- All 20 Node.js tests passed, including the two new regression checks.
- UI smoke test passed in an isolated Chromium DOM simulation for Settings, auto/restarted tour, Codex creation and relationship ranking without JS exceptions.
- Vite production build, actual IndexedDB persistence under HTTPS, service worker update, and GitHub Pages deployment could not be exercised locally due to runtime network restrictions; GitHub Actions will run installation/tests/build on commit.

## Next
- v0.3.0 — Connections & Time: chronological relationship charts, person-to-person links, comparisons between narrative periods, and audited corrections to historical entries.
