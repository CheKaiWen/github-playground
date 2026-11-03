// Inline SVG diagrams (static, trusted markup). Usage: <div data-diagram="areas"></div>
(function () {
  const defs = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="sv-head"/></marker></defs>`;
  const svg = (w, h, label, id, body) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${body}</svg>`;
  const box = (x, y, w, h, cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" class="sv-box ${cls || ''}"/>`;
  const t = (x, y, s, cls) => `<text x="${x}" y="${y}" text-anchor="middle" class="${cls || 'sv-t'}">${s}</text>`;
  const arrow = (x1, y1, x2, y2, id, extra) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="sv-line ${extra || ''}" marker-end="url(#${id})"/>`;

  const ic = (name, cx, cy, s) => `<svg x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" viewBox="0 0 24 24" class="sv-ic">${(window.ICONS || {})[name] || ''}</svg>`;

  const D = {};

  D['git-vs-github'] = svg(680, 270, 'Git is a tool on your computer. GitHub is a website that stores Git projects online.', 'a1',
    box(10, 20, 270, 190, 'sv-b1') + ic('wrench', 145, 66, 44) + t(145, 112, 'Git', 'sv-h') +
    t(145, 140, 'A tool on your computer', 'sv-t') + t(145, 162, 'Remembers every change', 'sv-s') + t(145, 182, 'Works offline', 'sv-s') +
    box(400, 20, 270, 190, 'sv-b2') + ic('cloud', 535, 66, 44) + t(535, 112, 'GitHub', 'sv-h') +
    t(535, 140, 'A website', 'sv-t') + t(535, 162, 'Stores your projects online', 'sv-s') + t(535, 182, 'Share &amp; collaborate', 'sv-s') +
    arrow(290, 95, 390, 95, 'a1') + arrow(390, 135, 290, 135, 'a1') +
    t(340, 83, 'push', 'sv-s') + t(340, 160, 'pull', 'sv-s') +
    t(340, 250, 'Git is the camera. GitHub is the shared photo album.', 'sv-note'));

  D['local-remote'] = svg(680, 330, 'Your laptop holds the local repository. GitHub holds your fork, called origin, and the original workshop repository, called upstream.', 'a2',
    box(10, 100, 200, 130, 'sv-b3') + ic('laptop', 110, 134, 44) + t(110, 178, 'Your laptop', 'sv-h2') + t(110, 200, 'LOCAL repository', 'sv-s') +
    box(240, 20, 200, 110, 'sv-b2') + ic('git-fork', 340, 52, 44) + t(340, 92, 'Your fork', 'sv-h2') + t(340, 112, '"origin" · REMOTE', 'sv-s') +
    box(470, 100, 200, 130, 'sv-b4') + ic('home', 570, 134, 44) + t(570, 178, 'Workshop repo', 'sv-h2') + t(570, 200, '"upstream" · the original', 'sv-s') +
    arrow(200, 120, 250, 90, 'a2') + t(150, 88, 'git clone', 'sv-code') +
    arrow(190, 205, 230, 140, 'a2', 'sv-dash') +
    arrow(430, 105, 480, 135, 'a2') + t(500, 88, 'Pull Request', 'sv-code') +
    arrow(480, 190, 230, 270, 'a2', 'sv-dash') +
    t(110, 275, 'git push →', 'sv-code') +
    t(340, 300, 'Fork = copy on GitHub · Clone = copy onto your laptop', 'sv-note'));

  D['areas'] = svg(680, 250, 'Your changes move from the working folder, to the staging area, to local history with git commit, and then to GitHub with git push.', 'a3',
    `<rect x="4" y="20" width="520" height="30" rx="15" class="sv-pill"/>` + t(264, 41, 'On your computer', 'sv-s') +
    `<rect x="534" y="20" width="142" height="30" rx="15" class="sv-pill2"/>` + t(605, 41, 'On the internet', 'sv-s') +
    box(4, 70, 118, 120, 'sv-b1') + ic('file', 63, 102, 34) + t(63, 138, 'Working', 'sv-h3') + t(63, 156, 'folder', 'sv-h3') + t(63, 178, 'you edit here', 'sv-xs') +
    box(166, 70, 118, 120, 'sv-b5') + ic('layers', 225, 102, 34) + t(225, 138, 'Staging', 'sv-h3') + t(225, 156, 'area', 'sv-h3') + t(225, 178, 'ready to save', 'sv-xs') +
    box(328, 70, 118, 120, 'sv-b3') + ic('camera', 387, 102, 34) + t(387, 138, 'Local', 'sv-h3') + t(387, 156, 'history', 'sv-h3') + t(387, 178, 'saved snapshots', 'sv-xs') +
    box(558, 70, 118, 120, 'sv-b2') + ic('cloud', 617, 102, 34) + t(617, 138, 'GitHub', 'sv-h3') + t(617, 156, 'your fork', 'sv-h3') + t(617, 178, 'online copy', 'sv-xs') +
    arrow(124, 130, 164, 130, 'a3') + arrow(286, 130, 326, 130, 'a3') + arrow(448, 130, 556, 130, 'a3') +
    t(144, 222, 'git add', 'sv-code') + t(306, 222, 'git commit', 'sv-code') + t(502, 222, 'git push', 'sv-code'));

  D['branches'] = svg(680, 260, 'The main branch is a line of commits. You create a side branch, make commits on it, and later merge it back into main.', 'a4',
    `<line x1="30" y1="190" x2="650" y2="190" class="sv-trunk"/>` +
    `<path d="M170 190 C 200 190, 200 90, 250 90 L 430 90 C 480 90, 480 190, 510 190" class="sv-branch" fill="none"/>` +
    [60, 170, 340, 510, 620].map((x) => `<circle cx="${x}" cy="190" r="14" class="sv-c1"/>`).join('') +
    [250, 340, 430].map((x) => `<circle cx="${x}" cy="90" r="14" class="sv-c2"/>`).join('') +
    t(30, 232, 'main', 'sv-code') + t(340, 62, 'add-my-profile (your branch)', 'sv-code') +
    t(340, 232, 'main keeps working safely', 'sv-s') + t(510, 232, 'merge', 'sv-code') +
    t(340, 124, 'your new commits', 'sv-s') + t(560, 100, 'Pull Request merged', 'sv-s'));

  const steps = [
    ['git-fork', 'Fork', 'copy on GitHub'], ['laptop', 'Clone', 'copy to laptop'], ['pencil', 'Commit', 'on a branch'],
    ['upload', 'Push', 'send to fork'], ['git-pull-request', 'Pull Request', 'ask to merge'], ['git-merge', 'Merge', 'goes live!']
  ];
  D['flow'] = svg(680, 210, 'The full journey: fork, clone, branch and commit, push, open a pull request, then merge and go live.', 'a5',
    steps.map((s, i) => {
      const x = 4 + i * 115;
      return box(x, 20, 96, 150, i === 5 ? 'sv-b2' : 'sv-b' + ((i % 4) + 1)) + ic(s[0], x + 48, 62, 34) +
        `<text x="${x + 48}" y="106" text-anchor="middle" class="sv-h3">${s[1]}</text>` + t(x + 48, 128, s[2], 'sv-xs') + t(x + 48, 154, i + 1, 'sv-num') +
        (i < 5 ? arrow(x + 98, 95, x + 113, 95, 'a5') : '');
    }).join('') + t(340, 200, 'Steps 1–2 happen once. Steps 3–5 are the loop you will repeat for every contribution.', 'sv-note'));

  // Marker ids must be unique per instance (a hidden copy of an SVG would otherwise break arrowheads elsewhere).
  let n = 0;
  document.querySelectorAll('[data-diagram]').forEach((el) => {
    const s = D[el.dataset.diagram];
    if (s) { n++; el.innerHTML = s.replace(/id="(a\d)"/g, 'id="$1-' + n + '"').replace(/url\(#(a\d)\)/g, 'url(#$1-' + n + ')'); }
  });
})();
