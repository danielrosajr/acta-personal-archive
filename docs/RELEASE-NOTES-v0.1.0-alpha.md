# ACTA v0.1.0-alpha — The Personal Codex

**Initial alpha release · 2026-10-26**

ACTA is a private-first, local-first narrative life archive. It allows people to organize their personal history into acts, chapters, memories, events, missions, and a personal codex of meaningful characters.

## Highlights

- **Personal Codex:** Create detailed dossiers with permanent internal IDs, configurable display codes, optional real names, primary codenames, historical aliases, multiple relationship categories, personal descriptions, and dated reflections.
- **Code continuity:** Renaming a code preserves its former value as a searchable historical alias, without breaking links.
- **Narrative timeline:** Create and organize acts and chapters, link people to multiple chapters, and navigate bidirectionally between dossiers and chapters.
- **Memories:** Capture uncertain dates, belief/certainty levels, tags, and optional people/chapter associations.
- **Events and missions:** Track meaningful events and personal objectives without gamified productivity scores.
- **Global search:** Search across codes, old identifiers, codenames, text, and narrative records.
- **Local-first experience:** IndexedDB persistence, encrypted password-protected backup export, validated restore, clear/dark theme, responsive interface, optional fictional demo data, contextual guided tour.
- **Deployment:** Vite build configuration and a GitHub Actions workflow to publish to GitHub Pages.

## Privacy & limitations

- No backend, login, analytics, remote database, mandatory AI, or automatic personal-data uploads.
- **Local IndexedDB data is not encrypted at rest.** Other pages on the same website origin may technically access the same storage. GitHub Pages repositories under the same `username.github.io` origin share this risk. Use a dedicated origin for sensitive content.
- No cross-device sync, attachments beyond compacted person avatars, PDF export, or advanced relational graph yet.
- Backups can be encrypted locally using AES-256-GCM and PBKDF2-SHA256. If the password is lost, encrypted backups cannot be recovered.
- Alpha validation: nine Node.js unit tests passed, and a Chromium isolated-UI smoke flow passed. npm/Vite build and actual GitHub Pages deployment were not exercised in the packaging environment because npm network access was unavailable.

## Requirements

- Modern browser with JavaScript, IndexedDB and Web Crypto API.
- Node.js 20+ to build locally with Vite 6, or deploy using the included GitHub Actions workflow.
- Static hosting with HTTPS is recommended; install no external services to run the core application.

## Roadmap

- **v0.2 — Connections:** richer relationships and historical identity chronology.
- **v0.3 — Memory Archive:** unclassified memories, temporal uncertainty, local attachments.
- **v0.4 — Personal Mythology:** flexible schemas, icons and collections.
- **v0.5 — Retrospective:** deterministic summaries and printable exports.
- **v0.6 — Visual Atlas:** graph visualization and enhanced timelines.
- **v0.7 — Narrative Studio:** visual storytelling; AI remains optional and consent-based.
- **v0.8+ — Personal Archive:** stronger at-rest encryption and optional secure sync.

## Commit and repository

- Suggested repository: `acta-personal-archive`
- Initial commit: `feat: initialize ACTA personal narrative archive and codex`
- Tag: `v0.1.0-alpha`
- Release title: `ACTA v0.1.0-alpha — The Personal Codex`

See the README and docs for setup, backup guidelines, privacy warnings, and GitHub Pages deployment.
