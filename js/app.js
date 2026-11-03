// Shared behaviour for every page: nav, placeholders, command highlighting, copy buttons, Community Wall.
(function () {
  'use strict';

  // ───────── Settings & repo detection ─────────
  const cfg = Object.assign({ owner: '', repo: '', branch: 'main', wallRefreshSeconds: 45 }, window.WORKSHOP || {});
  const host = location.hostname;
  let detected = false;
  if (!cfg.owner && host.endsWith('.github.io')) { cfg.owner = host.split('.')[0]; detected = true; }
  if (!cfg.repo && host.endsWith('.github.io')) { cfg.repo = location.pathname.split('/').filter(Boolean)[0] || ''; }
  const configured = Boolean(cfg.owner && cfg.repo);
  const OWNER = cfg.owner || 'OWNER';
  const REPO = cfg.repo || 'github-playground';
  const siteUrl = location.origin + location.pathname.replace(/[^/]*$/, '');

  // ───────── Safe storage (private mode / blocked storage must never break the page) ─────────
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  const listeners = [];
  const GP = {
    cfg, store,
    getUsername() { return (store.get('gp.username') || '').trim(); },
    setUsername(u) { store.set('gp.username', u.trim()); renderTemplates(); listeners.forEach((f) => f()); },
    onChange(f) { listeners.push(f); }
  };
  window.GP = GP;

  // ───────── Placeholders: {{USERNAME}} {{REPO}} {{OWNER}} {{UPSTREAM_URL}} {{FORK_URL}} {{SITE_URL}} ─────────
  function vars() {
    const user = GP.getUsername() || 'YOUR-USERNAME';
    return {
      USERNAME: user,
      REPO,
      OWNER,
      UPSTREAM_URL: `https://github.com/${OWNER}/${REPO}`,
      FORK_URL: `https://github.com/${user}/${REPO}.git`,
      FORK_PAGE: `https://github.com/${user}/${REPO}`,
      SITE_URL: siteUrl,
      BRANCH: cfg.branch
    };
  }
  function fill(str) {
    const v = vars();
    return str.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in v ? v[k] : m));
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function highlightLine(line) {
    let comment = '';
    const ci = line.search(/(^|\s)#(\s|$)/);
    if (ci !== -1) { comment = line.slice(ci); line = line.slice(0, ci); }
    const parts = line.match(/"[^"]*"|'[^']*'|\s+|[^\s"']+/g) || [];
    let wordNo = 0, isGit = false, subDone = false;
    const html = parts.map((p) => {
      if (/^\s+$/.test(p)) return p;
      if (/^["']/.test(p)) { wordNo++; return `<span class="tok-str">${esc(p)}</span>`; }
      wordNo++;
      if (wordNo === 1) { isGit = p === 'git' || p === 'gh'; return `<span class="tok-cmd">${esc(p)}</span>`; }
      if (/^--?[A-Za-z]/.test(p)) return `<span class="tok-flag">${esc(p)}</span>`;
      if (isGit && !subDone) { subDone = true; return `<span class="tok-sub">${esc(p)}</span>`; }
      return `<span class="tok-arg">${esc(p)}</span>`;
    }).join('');
    return html + (comment ? `<span class="tok-com">${esc(comment)}</span>` : '');
  }

  function renderTemplates() {
    document.querySelectorAll('code.cmd, .tpl').forEach((el) => {
      if (!el.dataset.tpl) el.dataset.tpl = el.textContent.replace(/^\n/, '').replace(/\s+$/, '');
      const text = fill(el.dataset.tpl);
      if (el.matches('code.cmd')) {
        el.dataset.raw = text;
        if (el.classList.contains('plain')) { el.textContent = text; return; }
        el.innerHTML = text.split('\n').map(highlightLine).join('\n');
      } else {
        el.textContent = text;
      }
    });
    document.querySelectorAll('[data-link]').forEach((a) => {
      const v = vars();
      const map = {
        upstream: v.UPSTREAM_URL,
        fork: `${v.UPSTREAM_URL}/fork`,
        myfork: v.FORK_PAGE,
        mybranches: `${v.FORK_PAGE}/branches`,
        compare: `${v.UPSTREAM_URL}/compare/${cfg.branch}...${v.USERNAME}:add-my-profile?expand=1`,
        prs: `${v.UPSTREAM_URL}/pulls`,
        actions: `${v.UPSTREAM_URL}/actions`,
        pages: `${v.UPSTREAM_URL}/settings/pages`,
        site: siteUrl
      };
      if (map[a.dataset.link]) a.href = map[a.dataset.link];
    });
  }

  // ───────── Copy buttons ─────────
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); } finally { ta.remove(); }
    });
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const code = btn.closest('.term').querySelector('code.cmd');
    if (!code) return;
    copyText(code.dataset.raw || code.textContent).then(() => {
      btn.textContent = 'Copied'; btn.classList.add('done');
    }, () => { btn.textContent = 'Press Ctrl/Cmd+C'; });
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
  });

  // ───────── Nav ─────────
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) nav.classList.remove('open'); });
  }
  const page = document.body.dataset.page;
  document.querySelectorAll('#site-nav a[data-nav]').forEach((a) => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });

  // ───────── OS picker ─────────
  function detectOS() {
    const ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    if (/win/i.test(ua)) return 'win';
    if (/mac|iphone|ipad/i.test(ua)) return 'mac';
    return 'linux';
  }
  function setOS(os) {
    document.body.dataset.os = os;
    store.set('gp.os', os);
    document.querySelectorAll('[data-set-os]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setOs === os)));
  }
  setOS(store.get('gp.os') || detectOS());
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-set-os]'); if (b) setOS(b.dataset.setOs); });

  // ───────── Facilitator warning if the repo owner is unknown ─────────
  if (!configured) {
    const bar = document.createElement('div');
    bar.className = 'cfg-banner';
    bar.textContent = 'Preview mode: repository owner not detected, so links use "OWNER". On GitHub Pages this is automatic (or set owner/repo in js/config.js).';
    document.body.prepend(bar);
  }

  // ───────── Community Wall ─────────
  const grid = document.getElementById('wall-grid');
  if (grid) {
    const countEl = document.getElementById('wall-count');
    const updEl = document.getElementById('wall-updated');
    const statusEl = document.getElementById('wall-status');
    const btn = document.getElementById('wall-refresh');
    const tints = ['t1', 't2', 't3', 't4', 't5', 't6'];

    function card(p, i) {
      const el = document.createElement('article');
      el.className = 'wall-card ' + tints[i % tints.length];
      const me = GP.getUsername().toLowerCase();
      if (me && p.id.toLowerCase() === me) { el.classList.add('is-me'); }
      const em = document.createElement('div'); em.className = 'wall-emoji'; em.textContent = p.emoji; em.setAttribute('aria-hidden', 'true');
      const nm = document.createElement('h3'); nm.textContent = p.name;
      const ft = document.createElement('p'); ft.textContent = p.fact;
      const id = document.createElement('a'); id.className = 'wall-id'; id.textContent = '@' + p.id;
      id.href = 'https://github.com/' + encodeURIComponent(p.id); id.target = '_blank'; id.rel = 'noopener noreferrer';
      el.append(em, nm, ft, id);
      if (el.classList.contains('is-me')) { const b = document.createElement('span'); b.className = 'wall-me'; b.textContent = "That's you"; el.append(b); }
      return el;
    }

    async function loadWall(manual) {
      if (manual) statusEl.textContent = 'Refreshing…';
      try {
        const res = await fetch('data/participants.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const list = Array.isArray(data.participants) ? data.participants : [];
        grid.replaceChildren(...list.map(card));
        countEl.textContent = list.length;
        document.getElementById('wall-empty').hidden = list.length > 0;
        const when = data.generatedAt ? new Date(data.generatedAt) : null;
        updEl.textContent = when && !isNaN(when) ? 'Wall rebuilt at ' + when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        statusEl.textContent = manual ? 'Up to date' : '';
      } catch (err) {
        statusEl.textContent = 'Could not load the wall right now. Try again in a moment.';
      }
    }
    btn && btn.addEventListener('click', () => loadWall(true));
    GP.onChange(() => loadWall(false));
    loadWall(false);
    if (cfg.wallRefreshSeconds > 0) setInterval(() => { if (!document.hidden) loadWall(false); }, cfg.wallRefreshSeconds * 1000);
  }

  renderTemplates();
})();
