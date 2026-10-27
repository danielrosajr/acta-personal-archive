# ACTA v0.2.0-alpha — Codex Evolved

ACTA is a private-first narrative life archive. This pre-release expands the personal Codex with relationship history and a configurable personal mythology. It remains entirely local-first, with no account, backend, or mandatory AI features.

## What's new

- **Relationship colors:** preset colors for family, friendships, romantic relationships, work, and other categories; select a primary category or customize a person's color.
- **Birthdays:** optional full birth date or just month/day, with dashboard reminders when the app is opened (7/14/30/60-day preference).
- **Symbol library:** click-to-select icons and symbols in person forms.
- **Subjective narrative archetypes:** editable Vlastnyys, Yotunt, Kantionyys, Chiteyavs and Tsuknyys definitions, plus custom perception tags and Codex filters.
- **Closeness percentage list:** two user-estimated metrics per person (felt closeness and assumed reciprocity), 0–100%, one decimal place, rankings, increases/decreases, and dated narrative entries.
- **Historical context:** entries can be labeled positive, negative, neutral, or reflection and linked to existing memories/events.
- **Expanded contextual tutorial:** 15 steps with highlighted navigation and form elements, including symbols, primary colors, tags and percentage history.
- **Backward-compatible migration:** supports schema 1 local archives and encrypted/plain backups, migrating them to schema 2 while preserving stable IDs and references.
- **18 automated Node tests** validating core entities, migration, dates, tags, percent history, search and backup.

## Upgrade instructions

1. Before changing repository files, open the **previous version on its original URL** and export an encrypted backup. Do not commit that backup to GitHub.
2. Upload the complete updated source, assets and docs from the ZIP to the existing `acta-personal-archive` repository. Include `.github/workflows/deploy.yml`.
3. Use GitHub Pages **Source: GitHub Actions**. The workflow installs dependencies, runs tests, builds Vite, and publishes the output.
4. Open the **same URL in the same browser profile**. Legacy IndexedDB records will be migrated automatically. Verify the original entries, a birthday and a closeness-history record; refresh to verify persistence.
5. If the repository URL, domain or browser profile changes, export/import a backup manually. Browser-local data does not move with a code deploy.

## Known limitations

- **Alpha software:** GitHub Pages deployment, full Vite build, and browser IndexedDB persistence were not verified locally in this environment due to build dependency/network restrictions and blocked browser navigation. Node tests and isolated Chromium UI interaction checks passed.
- Local IndexedDB is **not encrypted at rest**, and GitHub Pages projects under the same account domain share an origin. Prefer a dedicated origin for sensitive records.
- Birthday notices appear **only while opening/viewing the app**; no push notifications or background jobs.
- Percentages and labels express the author's subjective impressions, not verified judgments, predictions, diagnoses, or measurements of other people.
- Relationship-history editing is deliberately limited to deleting the latest entry with confirmation to preserve chronological consistency.
- No sync, account, server-side encryption, cloud uploads, or remote analysis.

## Next up — proposed v0.3.0, Connections & Time

- Visual chronological closeness trends and comparison across selected periods.
- Person-to-person networks and groups (without automatic personality classifications).
- Timeline filters and links between relationship entries, chapters and events.
- Auditable correction of historical entries, without silently overwriting records.
- A guided migration check after each update.

**Repository:** `acta-personal-archive`  
**Tag:** `v0.2.0-alpha`  
**Release title:** `ACTA v0.2.0-alpha — Codex Evolved`  
**Suggested commit:** `feat: expand ACTA Codex with relationship history and personal mythology`
