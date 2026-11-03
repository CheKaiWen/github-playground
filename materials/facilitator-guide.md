# Facilitator Guide: GitHub Playground

*For the person running the event. Participants never need this file.*

**Goal:** every participant opens a pull request that adds `participants/<their-username>.json`, you merge it, and their card appears on the live Community Wall. Everyone types the Git commands themselves in a terminal.

**Time:** 45–90 min. Mission 0 (setup) is the long one (15–25 min). Missions 1–5 take ~10 min each.

---

## 1. Pre-event setup checklist (do 1–2 days before; minimum 2 hours before)

- [ ] GitHub account that will own the repo (a personal account or a free **Organization** like `uni-coding-club`). Org is nicer: it isn't tied to your name.
- [ ] Create the repo (see §2), push this project, enable Pages (§3).
- [ ] Open the live site on your phone **and** a laptop. Check Home, Learn, Resources.
- [ ] Do the full **dry run** (§12) from a *second* GitHub account. Never skip this.
- [ ] Prepare the QR code (§4) and print it or put it on the projector.
- [ ] Have at least **1 other facilitator/helper per ~15 participants**.
- [ ] Wi-Fi: confirm `github.com`, `*.github.io`, `api.github.com`, and `githubusercontent.com` are reachable. Campus Wi-Fi sometimes blocks the browser device-login; have a phone hotspot as a backup.
- [ ] Tell participants beforehand (email/chat): **bring a laptop + charger**, create a GitHub account if they can, and install Git if they want to save time.
- [ ] Decide merge policy: merge each PR by hand (recommended, ~10 s each) or bulk-merge with the script in §6.

## 2. GitHub repository preparation

1. On GitHub create a **public** repository named `github-playground` (public is required so participants can fork it and so free Pages works). Don't add a README or licence (this project already has them).
2. From this project folder:

```bash
git init -b main
git add .
git commit -m "Initial workshop"
git remote add origin https://github.com/OWNER/github-playground.git
git push -u origin main
```
*(Or with GitHub CLI: `gh repo create OWNER/github-playground --public --source . --push`)*

3. **Settings → General:** make sure *Issues* may stay off; nothing else needed. Forking is on by default for public repos.
4. **Settings → Actions → General:**
   - *Workflow permissions:* **Read repository contents** (the deploy job asks for Pages permissions itself).
   - *Fork pull request workflows from outside collaborators:* choose **Require approval for first-time contributors who are new to GitHub**. Most workshop participants will therefore show *“Approve and run workflows”* on their PR. Click it (or ignore it: the check is helpful but you can also just look at *Files changed*).
5. Optional **Settings → Branches → Add rule** for `main`: require the `validate` check to pass. Skip this if you want zero friction; you review each PR by eye anyway.
6. PRs should only ever add files under `participants/`. The `validate` workflow fails any PR that touches anything else.

## 3. GitHub Pages deployment

1. **Settings → Pages → Build and deployment → Source: _GitHub Actions_.** (Not “Deploy from a branch”.)
2. Go to the **Actions** tab. The *Build & deploy Community Wall* workflow runs on every push to `main`. Run it manually once if needed: *Run workflow*.
3. When green, your site is at **`https://OWNER.github.io/github-playground/`** (for an org: `https://ORG.github.io/github-playground/`).
4. The site detects `OWNER` and the repo name from its own URL, so there is **nothing to configure**. Only edit `js/config.js` for a custom domain or non-standard setup.
5. The workflow validates nothing at deploy time on purpose; invalid files are *skipped* (with a warning in the log), so one bad file can never take the wall down.

> **Pages lag:** after each merge, the deploy takes ~1–3 minutes. Tell people to wait and press ↻ Refresh on the wall.

**If you must use “Deploy from a branch” instead:** the generated `data/participants.json` in the repo is only a seed. Run `npm run build` and commit the result before the event and again after merging. Not recommended.

## 4. QR code preparation

- Open `https://OWNER.github.io/github-playground/materials/qr.html`. It pre-fills the Learn page URL; tabs switch to the Wall or the site home.
- Press *Print / save as PDF* for a poster, or project it full-screen. (It loads the QR library from cdnjs, so the *preparing* device needs internet.)
- Fallback: Chrome → open the Learn page → address bar → *Share → Create QR code*.
- **Also write the short URL big on the board.** Some phones fail to scan projected codes.
- Two QRs are useful: **Learn guide** (everyone) and **Community Wall** (for the projector at the end).

## 5. During the event: flow suggestion

| Time | What |
|---|---|
| 0:00 | 5-min welcome: “We’ll make a real open-source contribution. You’ll type every command yourself.” Show QR. Explain the privacy rule (nicknames!). |
| 0:05 | Participants start Mission 0. Walk around. This is where most problems happen. |
| 0:25 | Most should be forking/cloning (M1–M2). Pair up anyone who’s ahead with someone stuck. |
| 0:45 | PRs start arriving. Merge continuously (§6). Project the Wall. |
| 1:00+ | Cheer as cards appear. Point finishers to the **Bonus missions** (Resources page). |

Tip: don’t lecture. Put the **Wall on the projector** and let it fill up. It’s motivating.

## 6. How to review and merge PRs

**What to check (10 seconds):** open the PR → **Files changed**:

1. Exactly **one** file, `participants/<something>.json`.
2. Content is friendly and doesn’t contain personal info (full name + phone, email, student ID, address…). If it does, comment and ask them to change it (they just edit & push again), or edit nothing and close the PR.
3. Check ✅ is green (if it says *waiting for approval*, click **Approve and run workflows**).

Then click **Squash and merge** (or *Merge*; either is fine) → Confirm. Say “merged!” out loud. 🎉

**Bulk merge** (many PRs at once). Requires the GitHub CLI logged in as a maintainer. This script merges only PRs whose changed files are all `participants/*.json`, and skips the rest for manual review:

```bash
R=OWNER/github-playground
for n in $(gh pr list -R $R --state open --json number --jq '.[].number'); do
  if gh pr diff $n -R $R --name-only | grep -Ev '^participants/[^/]+\.json$' >/dev/null; then
    echo "skip #$n (touches other files)"
  else
    gh pr merge $n -R $R --squash && echo "merged #$n"
  fi
done
```
(Contents are validated by CI; glance at *Checks* with `gh pr checks N -R $R` if you’re cautious.) Run it every few minutes during the event.

## 7. How to monitor participants’ progress

- **Repo → Pull requests:** the number of open + merged PRs is your progress bar. Sort by *Newest*.
- **Repo → Branches (not on upstream):** pushes land on *forks*, not your repo, so use PRs. Participants who’ve pushed but not opened a PR are the “almost there” group; walk the room asking “who has pushed but not opened a PR?”.
- **Insights → Forks:** the list of forks = people who finished Mission 1.
- **Actions tab:** green deploys after merges. Red = look at the log.
- Social progress: a sticker/whiteboard column per mission, or ask people to stand when they reach each checkpoint. The guide’s *checkpoint* boxes are for them; you can’t see them (progress is stored in each person’s browser only).
- Wall count on the home page = merged contributors.

## 8. Common Git errors & solutions

| Message | Cause → fix |
|---|---|
| `git: command not found` / not recognized | Not installed, or the terminal was open before installing → install, **close & reopen** terminal. |
| `Author identity unknown` | `git config --global user.name/email` missing → Mission 0 step 5. |
| `fatal: not a git repository` | Wrong folder → `pwd`, `cd ~/workshop/github-playground`. |
| `fatal: repository … not found` on clone | Typo in username, forgot to fork, or fork URL is of upstream → check the URL opens in a browser. |
| `Permission denied … 403` on push | Pushing to upstream instead of fork (`git remote -v`), or wrong account logged in (`gh auth status`). |
| Asks for Username/Password | HTTPS without a credential helper → `gh auth login`; fallback PAT as “password”. |
| `no upstream branch` | Forgot `-u origin <branch>`. |
| `src refspec … does not match any` | No commit yet or wrong branch name → `git branch`, `git log -1`. |
| Stuck in Vim | `Esc`, `:q!`, Enter. Redo with `-m`. |
| Invisible/empty commit | File saved outside the repo folder or never saved → `git status`. |
| JSON check red ❌ | Missing comma/quote, wrong filename, extra file. The PR *Checks → Details* shows the sentence-level message. |
| Cards missing after merge | Wait for deploy (§3). Actions tab, hard-refresh. |
| `rejected … fetch first` | They pushed from elsewhere → `git pull` then `git push`. |
| `LF will be replaced by CRLF` warning (Windows) | Harmless; ignore. |

## 9. Windows / macOS / Linux differences

| | macOS | Windows | Linux |
|---|---|---|---|
| Terminal | Terminal.app (⌘+Space → “Terminal”) | **PowerShell** (Win → “PowerShell”) or Git Bash | Ctrl+Alt+T |
| Git install | `git --version` triggers Xcode CLT install (5–10 min, needs internet; start it early!) | `winget install --id Git.Git -e` or git-scm.com installer; **reopen the terminal** | `apt/dnf/pacman install git` |
| Auth | `gh` via Homebrew/installer | `gh` via winget; Git Credential Manager comes with Git for Windows (browser popup on first push) | `gh` (apt/dnf/official page) |
| Text editor | VS Code or `nano` (avoid TextEdit: smart quotes break JSON) | VS Code or `notepad` | VS Code or `nano`/`gedit` |
| Gotchas | Old Macs may lack Homebrew → use the `gh` installer | Run PowerShell as normal user (not admin). Cloud-synced `Documents` (OneDrive) → guide uses `~/workshop`. `ls`, `cd`, `pwd`, `cp` work in PowerShell. Execution-policy warnings don’t matter here. | Distros differ; `sudo` password prompts show no characters. |

Chromebooks: use the Linux (Crostini) terminal, or have them pair up. Tablets/phones can’t do this workshop → pair them.

## 10. Troubleshooting authentication (the #1 time sink)

Work through in order:

1. `gh auth status`. Is it logged in as the **same account that owns the fork**?
2. Not logged in → `gh auth login` → GitHub.com → HTTPS → **Yes** to “Authenticate Git” → *Login with a web browser*. Use the one-time code in the browser.
3. Browser step blocked/slow (Wi-Fi portals, school SSO): tether to a phone hotspot, or use the device code on a phone browser.
4. Still failing → **Personal access token**: GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate*: repository access = *Only select repositories* → their fork; permission *Contents: Read and write*. When `git push` asks for a password, paste the token. (Never ask people to paste a real password anywhere.)
5. Windows keeps failing with old credentials → *Credential Manager → Windows Credentials* → delete `git:https://github.com`.
6. macOS keeps using stale credentials → `git credential-osxkeychain erase` (type `host=github.com` and `protocol=https`, then blank line), or Keychain Access → delete “github.com”.
7. Last resort: the participant can pair with a neighbour and watch, then do it later. Don’t let one person block the room; move on.

## 11. Simultaneous contributions

- Everyone adds a **different file**, so Git never conflicts. 50 PRs at once are fine.
- The manifest `data/participants.json` is **generated in CI**, never edited by hand or in PRs. That’s why nobody can conflict on it.
- Many merges in a row each trigger a deploy; the workflow uses a `pages` concurrency group, so deploys queue and the latest one wins. It’s normal that the wall updates in batches.
- If two people choose the same username/filename (shouldn’t happen), the second PR will show a conflict → ask them to rename the file to their own username.
- GitHub rate-limits some actions for very new accounts (e.g. forking many repos). Rare; wait a minute.
- If someone’s PR is “behind” `main`, you do **not** need to update it, since no file overlaps.

## 12. Helping someone who has never used a terminal

- Sit beside them (not behind). **They** type; you point.
- Open the terminal with them and say: “this is just texting your computer”.
- Practise `pwd`, `ls`, `cd`, then Tab-completion, and ↑ for previous command, before any Git.
- Explain how to read output: “First line = what it did; red text = problem; read the *first* error”.
- Have them read error messages aloud. Ninety percent are “wrong folder” or “typo”.
- Show **copy/paste**: Mac `⌘V`; Windows PowerShell right-click or `Ctrl+V`; Linux terminals `Ctrl+Shift+V`.
- Remind: the terminal won’t show passwords while typing; and no text ≠ frozen. Wait for the prompt.
- If they fall far behind, pair them with a finisher as a “co-pilot” (they still type everything).
- Don’t say “just” or “simply”. Praise precision, not speed.

## 13. Complete dry-run checklist

Do this with a **second GitHub account** and a **fresh folder**, ideally on a machine that mimics participants (and once on Windows if possible):

- [ ] Site loads on Pages URL (Home, Learn, Resources, cheatsheet, `materials/qr.html`).
- [ ] Home page: Community Wall shows the sample card; ↻ Refresh works.
- [ ] Learn page: pick each OS tab; copy buttons work; progress saves after reload.
- [ ] Enter test username; commands show it; *Fork* link opens `…/OWNER/github-playground/fork`.
- [ ] Mission 0: `git --version`, config, `gh auth login`, `gh auth status`.
- [ ] Mission 1: fork succeeds.
- [ ] Mission 2: `git clone`, `git status`, `git remote -v` as written.
- [ ] Mission 3: `git switch -c add-my-profile`, `cp`, edit, `git status`, `git add`, `git commit -m`, `git log -1`.
- [ ] Mission 4: `git push -u origin add-my-profile`; branch visible on fork.
- [ ] Mission 5: PR via the compare link; template fills; **Check runs** (approve if needed) and goes green.
- [ ] Break it on purpose: invalid JSON → check goes red with a readable message; touch `README.md` → red *“Only participants/*.json may change”*.
- [ ] Merge as the maintainer. Deploy turns green in Actions. Card appears on the wall (note how long it took).
- [ ] Test a bonus (`git pull upstream main`) to confirm the upstream URL is correct.
- [ ] **Clean up:** delete the test profile file from `participants/` (commit to `main`) so the wall starts fresh; close the test PR; delete the test fork.
- [ ] Remove `participants/sample.json`? **No.** The guide copies it. Keep it. (It appears on the wall as “Sample Student”; fine.)

## 14. After the event

- Keep the site up; the Wall is a nice memento. Share the URL with participants.
- If you want a clean slate for the next run: delete everything in `participants/` except `sample.json`, commit.
- Consider asking participants to ⭐ the repo and follow you for the next workshop.
