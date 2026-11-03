# GitHub Playground: Your First Open-Source Contribution

A self-paced, hands-on Git & GitHub workshop for beginners. Every participant learns Git **in the terminal**, then adds a profile (nickname, emoji, fun fact) to a live **Community Wall** through a real pull request.

- **Home**: event intro + live Community Wall (`index.html`)
- **Learn**: six interactive missions with copy-able commands, example output, checkpoints, troubleshooting (`learn.html`)
- **Resources**: cheat sheet, 5 visual guides, troubleshooting, 5 optional bonus missions (`resources.html`)
- **Facilitator materials**: `materials/facilitator-guide.md`, `materials/event-checklist.md`, `materials/git-cheatsheet.html` (printable), `materials/qr.html` (QR poster)

Plain HTML/CSS/vanilla JS. No frameworks, no backend, no dependencies (Node ≥ 18 only for the helper scripts).

## Run it locally

```bash
node scripts/serve.js        # or: npm start
# open http://localhost:8000
```

`npm run validate` checks every file in `participants/`; `npm run build` regenerates `data/participants.json`.

## Publish it (5 minutes)

```bash
git init -b main
git add .
git commit -m "Initial workshop"
gh repo create OWNER/github-playground --public --source . --push
#   …or create an empty public repo on github.com and:
#   git remote add origin https://github.com/OWNER/github-playground.git && git push -u origin main
```

Then **Settings → Pages → Source: GitHub Actions**. After the *Build & deploy* workflow finishes (Actions tab), the site is live at `https://OWNER.github.io/github-playground/`. Owner and repo name are detected from that URL automatically.

Full instructions, review/merge workflow and a dry-run checklist: [`materials/facilitator-guide.md`](materials/facilitator-guide.md).

## How contributions work

```
participants/<github-username>.json   ← one file per person, the only thing a PR may change
          │  (merged to main)
          ▼
GitHub Actions: node scripts/build-participants.js  →  data/participants.json (manifest)
          ▼
GitHub Pages serves the site; js/app.js fetches the manifest and renders cards with textContent (never innerHTML)
```

A participant file looks like:

```json
{ "name": "Alex", "emoji": "", "fact": "I love building robots!" }
```

Rules (enforced by `scripts/validate-participants.js`): file name = username + `.json`; exactly the fields `name` (≤30), `emoji` (≤16 chars, must contain an emoji), `fact` (≤140); no control characters or `<`/`>`; file ≤ 2000 chars.

## Repository layout

```
├── index.html · learn.html · resources.html
├── css/styles.css
├── js/  config.js (optional overrides) · app.js (shared + wall) · guide.js (missions) · diagrams.js (SVGs)
├── participants/sample.json         template that participants copy
├── data/participants.json           generated manifest (regenerated on every deploy)
├── scripts/  lib.js · validate-participants.js · build-participants.js · serve.js
├── .github/  workflows/validate.yml · workflows/deploy.yml · PULL_REQUEST_TEMPLATE.md
├── materials/  facilitator-guide.md · event-checklist.md · git-cheatsheet.html · qr.html
└── package.json
```

## Security & safety notes

- **Validation workflow** (`pull_request`): read-only token, no secrets, no `pull_request_target`. It fails PRs touching anything but `participants/*.json` and only *parses* contributor JSON; contributor code is never executed with privileges.
- **Deploy workflow** runs only on pushes to `main` (after a human merge) with the minimum Pages permissions.
- All contributor text is rendered via `textContent`, so there is no HTML injection.
- Participants are warned throughout that **everything is public**: nicknames, not personal info.
- Progress tracking and the username box use `localStorage` in the participant’s browser only. No accounts, no analytics.

## Customising

- Event name / text: edit the HTML pages (`index.html` etc. are plain files; `learn.html` is long but linear).
- Different repo name: participants are told `cd <repo>` from `js/app.js` placeholders, so it follows the Pages URL automatically. Locally or on a custom domain, set `owner`/`repo` in `js/config.js`.
- Wall refresh interval: `wallRefreshSeconds` in `js/config.js`.

## Known limits

- GitHub Pages takes ~1–3 min to update after a merge.
- `materials/qr.html` loads its QR library from cdnjs (needs internet when you generate it).
- Participants with fork-PR workflows may need a facilitator to click “Approve and run workflows”.
