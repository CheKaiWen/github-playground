// Learn page: mission routing, progress tracking, OS switcher, username box. All state stays in this browser.
(function () {
  'use strict';
  const GP = window.GP;
  const missions = Array.from(document.querySelectorAll('.mission'));
  const ids = missions.map((m) => m.id);
  const real = ids.filter((id) => id !== 'done'); // m0..m5
  const stepper = document.getElementById('stepper');

  // ───────── State ─────────
  function load() {
    try { return JSON.parse(GP.store.get('gp.progress') || '{}'); } catch (e) { return {}; }
  }
  let state = Object.assign({ checks: {}, done: {} }, load());
  const save = () => GP.store.set('gp.progress', JSON.stringify(state));

  // ───────── Username box ─────────
  const input = document.getElementById('username-input');
  input.value = GP.getUsername();
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^A-Za-z0-9-]/g, '');
    GP.setUsername(input.value);
  });

  // ───────── Method switch: Terminal / GitHub Desktop ─────────
  function setMethod(m) {
    GP.store.set('gp.method', m);
    document.body.dataset.method = m;
    document.querySelectorAll('[data-method]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.method === m)));
    document.querySelectorAll('details.desktop').forEach((d) => { d.open = m === 'desktop'; });
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-method]'); if (b) setMethod(b.dataset.method); });
  setMethod(GP.store.get('gp.method') === 'desktop' ? 'desktop' : 'terminal');

  // ───────── Stepper ─────────
  real.forEach((id, i) => {
    const m = document.getElementById(id);
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'step-btn'; b.dataset.go = id;
    b.innerHTML = '<span class="n"><span>' + i + '</span></span><span class="lbl"></span>';
    b.querySelector('.lbl').innerHTML = window.icon(m.dataset.icon) + ' ' + m.dataset.title;
    li.appendChild(b); stepper.appendChild(li);
  });
  stepper.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  // ───────── Checkpoints ─────────
  missions.forEach((m) => {
    const boxes = m.querySelectorAll('.checkpoint input[type=checkbox]');
    const saved = state.checks[m.id] || [];
    boxes.forEach((cb, i) => {
      cb.checked = Boolean(saved[i]);
      cb.addEventListener('change', () => {
        state.checks[m.id] = Array.from(boxes).map((x) => x.checked);
        refresh(); save();
        if (Array.from(boxes).every((x) => x.checked)) celebrateSmall(m);
      });
    });
  });

  function isDone(id) {
    const boxes = document.querySelectorAll('#' + id + ' .checkpoint input[type=checkbox]');
    return boxes.length > 0 && Array.from(boxes).every((x) => x.checked);
  }

  function refresh() {
    let n = 0;
    real.forEach((id) => {
      const done = isDone(id) || Boolean(state.done[id]);
      if (isDone(id)) state.done[id] = true; else delete state.done[id];
      if (state.done[id]) n++;
      const btn = stepper.querySelector('[data-go="' + id + '"]');
      btn.classList.toggle('done', Boolean(state.done[id]));
      const m = document.getElementById(id);
      const next = m.querySelector('.next-btn');
      next.disabled = !isDone(id);
      m.querySelector('.next-hint').style.visibility = isDone(id) ? 'hidden' : 'visible';
    });
    document.getElementById('progress-label').textContent = n + ' of ' + real.length + ' missions done';
    document.getElementById('progress-fill').style.width = (n / real.length * 100) + '%';
    document.querySelector('.bar').setAttribute('aria-valuenow', String(n));
  }

  // ───────── Routing ─────────
  function go(id, opts) {
    if (!ids.includes(id)) id = firstUnfinished();
    missions.forEach((m) => m.classList.toggle('active', m.id === id));
    stepper.querySelectorAll('.step-btn').forEach((b) => b.classList.toggle('active', b.dataset.go === id));
    GP.store.set('gp.current', id);
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    if (!(opts && opts.quiet)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h = document.querySelector('#' + id + ' h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    if (id === 'done') confetti();
  }
  function firstUnfinished() {
    return real.find((id) => !state.done[id]) || 'm0';
  }
  document.addEventListener('click', (e) => {
    const n = e.target.closest('.next-btn'); if (n && !n.disabled) go(n.dataset.next);
    const p = e.target.closest('.prev-btn'); if (p) { const i = ids.indexOf(p.dataset.prev); go(ids[Math.max(0, i - 1)]); }
  });
  window.addEventListener('popstate', () => go(location.hash.slice(1), { quiet: true }));

  // ───────── Confetti (lightweight, respects reduced motion) ─────────
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    const colors = ['#6c5ce7', '#ff6b9d', '#ffd24a', '#2ed8a3', '#4cc9f0', '#ff9f43'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%'; c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.8 + 's'; c.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
      box.appendChild(c);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 5000);
  }
  function celebrateSmall(m) {
    const hint = m.querySelector('.checkpoint');
    if (hint.animate) hint.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 400 });
  }

  // ───────── Reset / restart ─────────
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!window.confirm('Reset all your progress on this page? (Your GitHub files are not affected.)')) return;
    state = { checks: {}, done: {} };
    document.querySelectorAll('.checkpoint input').forEach((c) => { c.checked = false; });
    save(); refresh(); go('m0');
  });
  document.getElementById('restart-btn').addEventListener('click', () => go('m0'));

  // Start
  refresh();
  const start = location.hash.slice(1) || GP.store.get('gp.current') || firstUnfinished();
  go(start, { quiet: true });
})();
