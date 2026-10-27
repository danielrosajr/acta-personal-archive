# ACTA v0.3.0-alpha — Connections & Time

## Highlights

ACTA now connects personal narrative records with a chronological relationship view. Track your **own subjective estimates**, compare two dates, and browse direct connections between people without assigning objective scores or diagnoses to anyone.

## What's new

- **Individual history charts:** Two independent series for self-reported closeness and perceived reciprocity. Recorded dates only, SVG tooltips, accessible data tables, and optional date filters.
- **All-people comparison chart:** Overlay everyone with dated entries, switch which estimate is displayed, and filter the chart's time interval.
- **Time comparison:** Compare a person's or the archive's most recent known readings on or before two selected dates. Unknown values remain unknown.
- **Person-to-person connections:** Add mutual links with optional kind, period, and notes, visible from both dossiers.
- **Narrative groups:** Store collections of people and their shared context, including an edit history for group changes.
- **Auditable corrections:** Correct an older percentage entry with a required reason. Earlier values remain in a readable history.
- **Additional Codex filters:** No-contact status, birthdays this month, historical entries, connected people, acts, and combined perception tags.
- **Updated guided tour:** Expanded to explain charts, comparisons, person links, groups, and correction history.
- **Schema 3 migration:** Reads and upgrades schema 1/2 archives and backup files, retaining record IDs and established links.

## Privacy & limitations

All records remain in the user's browser. IndexedDB is **not encrypted at rest**. Password-protected backups use AES-256-GCM and PBKDF2, but anyone who can access the browsing profile may access live content. GitHub Pages repositories on a shared `username.github.io` origin are not isolated from one another. Use a dedicated domain for sensitive archives.

No sign-in, server backend, cloud sync, automatic character assessment, remote AI analysis, or push notifications. A chart sample is shown only if an evaluation has a valid complete date; no missing or intermediate numeric values are inferred. Groups and links reflect the author's account, not verified social relationships.

## Upgrade instructions

1. In your current ACTA installation, go to Settings and export a **password-protected backup**. Keep this file and its password outside GitHub.
2. Extract the ZIP and replace project files in the **same repository** using the GitHub browser upload interface. Include `.github/workflows/deploy.yml` and all `src/`, `public/`, `docs/` files.
3. Confirm that GitHub Actions runs tests and builds successfully, then open the same existing GitHub Pages URL.
4. Confirm your existing dossiers, codes, memories, percentage history, and Settings. Enter a person to check the individual chart and open the ranking for the combined chart.
5. Never clear browser site data or IndexedDB to troubleshoot. If the old app shell remains, perform a hard refresh or remove only its service worker (not storage).

## Verification status

- Node test suite: **28 passing tests** in the authoring environment.
- Chromium isolated frontend smoke testing: **passed** for dossier history chart, cross-person chart, dates, creating a connection, creating a group, auditable correction, and mobile viewport.
- Vite build: **not verified locally** because npm package installation was not available offline; GitHub Actions will attempt the real build.
- IndexedDB persistence on a served HTTPS site and deployed service worker: **must be verified after publication**.

## Release metadata

- Version and tag: `v0.3.0-alpha`
- Release title: `ACTA v0.3.0-alpha — Connections & Time`
- Suggested commit: `feat: add temporal relationship charts and codex connections`

## Next milestone — v0.4.0 Memory Archive

Fast capture inbox, structured approximate dates, deferred bulk categorization, deeper memory search, and carefully quota-limited local attachments.
