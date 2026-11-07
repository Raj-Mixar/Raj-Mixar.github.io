(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var LINKS = {
    github: 'https://github.com/Raj-Mixar',
    mixar: 'https://mixar.app',
    mixarApp: 'https://github.com/Mixar-AI/mixar-app',
    hermes: 'https://github.com/Mixar-AI/hermes-mixar',
    linkedin: 'https://www.linkedin.com/in/raj-sahani-461b13165/',
    x: 'https://x.com/Raj_Sahani_',
    email: 'raj@mixar.app'
  };

  $('#year').textContent = new Date().getFullYear();

  /* ───────── theme ───────── */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f7f7f4' : '#0b0e14');
  }
  function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
  $('#theme-toggle').addEventListener('click', toggleTheme);

  /* ───────── hero typing ───────── */
  var heroScript = [
    { cmd: 'whoami' },
    { out: '<span class="hl">raj sahani</span> · founding engineer @ <span class="acc">mixar</span>' },
    { cmd: 'cat mission.txt' },
    { out: 'Turn AI from a demo into a coworker.' },
    { cmd: 'cat impact.txt' },
    { out: '<span class="acc">0 → 10k+</span> users · app · backend · AWS\nAI agent · <span class="acc">13+</span> models · evals · automation' },
    { cmd: '' }
  ];
  var heroEl = $('#hero-term');
  var PS1 = '<span class="ps1">~ $</span> ';

  function renderHeroStatic() {
    heroEl.innerHTML = heroScript.map(function (s) {
      if ('cmd' in s) return PS1 + esc(s.cmd);
      return '<span class="out">' + s.out + '</span>';
    }).join('\n') + '<span class="cursor"></span>';
  }

  function typeHero() {
    var html = '';
    var i = 0;
    function step() {
      if (i >= heroScript.length) { heroEl.innerHTML = html + '<span class="cursor"></span>'; return; }
      var s = heroScript[i++];
      if ('cmd' in s) {
        var prefix = html + (html ? '\n' : '') + PS1;
        var j = 0;
        (function typeChar() {
          heroEl.innerHTML = prefix + esc(s.cmd.slice(0, j)) + '<span class="cursor"></span>';
          if (j < s.cmd.length) { j++; setTimeout(typeChar, 45 + Math.random() * 55); }
          else { html = prefix + esc(s.cmd); setTimeout(step, s.cmd ? 320 : 0); }
        })();
      } else {
        html += '\n<span class="out">' + s.out + '</span>';
        heroEl.innerHTML = html;
        setTimeout(step, 520);
      }
    }
    setTimeout(step, 350);
  }
  if (reduceMotion) renderHeroStatic(); else typeHero();

  /* ───────── stat counters ───────── */
  function countUp(el) {
    var target = +el.dataset.count, start = null, dur = 1100;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ───────── reveal on scroll ───────── */
  var revealTargets = $$('.section, .stats, .card, .principle, .commit');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.classList.contains('stats')) $$('[data-count]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ───────── scroll spy ───────── */
  var tabs = $$('.tabs a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.spy === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'work', 'experience', 'stack', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ───────── heatmap ───────── */
  (function heatmap() {
    var data = window.ACTIVITY || {};
    var el = $('#heatmap');
    if (!el) return;
    var keys = Object.keys(data).sort();
    var last = keys.length ? new Date(keys[keys.length - 1] + 'T00:00:00') : new Date();
    var end = new Date(last); end.setDate(end.getDate() + (6 - end.getDay())); // pad to Saturday
    var start = new Date(end); start.setDate(start.getDate() - 7 * 53 + 1);     // 53 weeks, starting Sunday
    var fmt = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    var level = function (n) { return n === 0 ? 0 : n < 6 ? 1 : n < 16 ? 2 : n < 40 ? 3 : 4; };
    var frag = document.createDocumentFragment();
    var total = 0, active = 0, streak = 0, best = 0;
    for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      var key = fmt(d), n = data[key] || 0, cell = document.createElement('i');
      if (d > last) { cell.className = 'empty'; }
      else {
        cell.className = 'l' + level(n);
        cell.title = (n ? n + ' commit' + (n === 1 ? '' : 's') : 'No commits') + ' on ' + d.toDateString().slice(4);
        total += n;
        if (n) { active++; streak++; best = Math.max(best, streak); } else { streak = 0; }
      }
      frag.appendChild(cell);
    }
    el.appendChild(frag);
    $('#activity-total').innerHTML = '<b>' + total.toLocaleString('en-US') + '</b> commits · <b>' + active + '</b> active days · longest streak <b>' + best + '</b> days';
    var wrap = $('.heatmap-wrap'); if (wrap) wrap.scrollLeft = wrap.scrollWidth;
  })();

  /* ───────── shared actions ───────── */
  function goTo(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  function open(url) { window.open(url, '_blank', 'noopener'); }

  /* ───────── interactive shell ───────── */
  var out = $('#shell-out'), input = $('#shell-in'), form = $('#shell-form');
  var history = [], hIdx = 0;
  function print(html) { out.insertAdjacentHTML('beforeend', html + '\n'); out.scrollTop = out.scrollHeight; }

  var FILES = {
    'about.md': 'I build products where AI does the real work.\nFounding engineer at Mixar (0 → 10k+ users). AI-first, early adopter.',
    'mission.txt': 'Turn AI from a demo into a coworker.',
    'stack.json': '{ "languages": ["Python","Java","TypeScript","C++"],\n  "ai": ["LangGraph","MCP","Anthropic","OpenAI","Gemini"],\n  "daily_drivers": ["Claude Code","Codex"] }'
  };

  var COMMANDS = {
    help: { desc: 'list commands', run: function () {
      return Object.keys(COMMANDS).filter(function (k) { return !COMMANDS[k].hidden; }).map(function (k) {
        return '  <span class="acc">' + (k + '            ').slice(0, 12) + '</span><span class="out">' + COMMANDS[k].desc + '</span>';
      }).join('\n');
    } },
    whoami: { desc: 'who is raj?', run: function () { return '<span class="hl">raj sahani</span> · founding engineer @ mixar · AI-first builder'; } },
    about: { desc: 'jump to about.md', run: function () { goTo('about'); return '<span class="out">' + FILES['about.md'] + '</span>'; } },
    projects: { desc: 'what I have built', run: function () {
      goTo('work');
      return [
        ['growth', 'took Mixar from first commit to 10k+ users'],
        ['full-stack', 'desktop app, backend, web and admin tools'],
        ['ai', 'in-app AI agent + 13+ model families + MCP'],
        ['cloud', 'production on AWS with CI/CD and monitoring'],
        ['automation', 'AI agents that test, fix and ship'],
        ['evals', 'every model change measured before release']
      ].map(function (p) { return '  <span class="acc">' + (p[0] + '/              ').slice(0, 14) + '</span><span class="out">' + p[1] + '</span>'; }).join('\n');
    } },
    experience: { desc: 'career as git log', run: function () {
      goTo('experience');
      return [
        ['a1f3c0d', '(HEAD → main) Founding Engineer @ Mixar', 'May 2025 — present'],
        ['7c2e9b4', 'Senior Software Engineer @ CarDekho', 'Jul 2021 — Apr 2025'],
        ['3d81f0a', 'Research Intern @ KPIT Technologies', '2020'],
        ['0e4b2c1', '(init) B.Tech @ IIT Delhi', '2017 — 2021']
      ].map(function (c) { return '<span class="hl">*</span> <span style="color:var(--yellow)">' + c[0] + '</span> ' + c[1] + ' <span class="out">' + c[2] + '</span>'; }).join('\n');
    } },
    stack: { desc: 'tools I use', run: function () { goTo('stack'); return '<span class="out">' + FILES['stack.json'] + '</span>'; } },
    contact: { desc: 'how to reach me', run: function () { goTo('contact'); var a = function (h, t) { return '<a href="' + h + '" target="_blank" rel="noopener">' + t + '</a>'; };
      return [
        '  email     ' + a('mailto:' + LINKS.email, LINKS.email),
        '  linkedin  ' + a(LINKS.linkedin, 'linkedin.com/in/raj-sahani-461b13165'),
        '  x         ' + a(LINKS.x, 'x.com/Raj_Sahani_'),
        '  github    ' + a(LINKS.github, 'github.com/Raj-Mixar')
      ].join('\n'); } },
    github: { desc: 'open my GitHub', run: function () { open(LINKS.github); return '<span class="out">opening github…</span>'; } },
    linkedin: { desc: 'open my LinkedIn', run: function () { open(LINKS.linkedin); return '<span class="out">opening linkedin…</span>'; } },
    email: { desc: 'write to me', run: function () { location.href = 'mailto:' + LINKS.email; return '<span class="out">opening mail → ' + LINKS.email + '</span>'; } },
    ls: { desc: 'list files', run: function () { return '<span class="acc">work/</span>  ' + Object.keys(FILES).join('  ') + '  contact.sh'; } },
    cat: { desc: 'cat &lt;file&gt;', run: function (args) {
      var f = args[0];
      if (!f) return '<span class="err">cat: missing file operand</span>';
      if (FILES[f]) return '<span class="out">' + FILES[f] + '</span>';
      if (f === 'contact.sh') return COMMANDS.contact.run();
      return '<span class="err">cat: ' + esc(f) + ': No such file</span>';
    } },
    theme: { desc: 'toggle light / dark', run: function () { toggleTheme(); return '<span class="out">theme → ' + document.documentElement.dataset.theme + '</span>'; } },
    clear: { desc: 'clear the screen', run: function () { out.innerHTML = ''; return null; } },
    sudo: { hidden: true, desc: '', run: function (args) {
      if (args.join(' ') === 'hire raj') { goTo('contact'); return '<span class="hl">[sudo] permission granted.</span> <span class="out">Scroll down to contact.sh — let\'s build something.</span>'; }
      return '<span class="err">raj is not in the sudoers file. This incident will be reported.</span>\n<span class="out">hint: try `sudo hire raj`</span>';
    } },
    rm: { hidden: true, desc: '', run: function () { return '<span class="err">nice try.</span>'; } },
    exit: { hidden: true, desc: '', run: function () { return '<span class="out">there is no escape. try `projects`.</span>'; } },
    echo: { hidden: true, desc: '', run: function (args) { return esc(args.join(' ')); } },
    pwd: { hidden: true, desc: '', run: function () { return '/home/raj'; } },
    date: { hidden: true, desc: '', run: function () { return new Date().toString(); } }
  };

  function exec(line) {
    var raw = line.trim();
    print('<span class="ps1">guest@raj:~$</span> ' + esc(raw));
    if (!raw) return;
    history.push(raw); hIdx = history.length;
    var parts = raw.split(/\s+/), name = parts[0].toLowerCase(), cmd = COMMANDS[name];
    if (!cmd) { print('<span class="err">command not found: ' + esc(name) + '</span> <span class="out">— try `help`</span>'); return; }
    var res = cmd.run(parts.slice(1));
    if (res != null) print(res);
  }

  print('<span class="out">Welcome to raj\'s shell. Type <span class="hl">help</span> to see commands. (↑ / ↓ for history, tab to complete)</span>');
  form.addEventListener('submit', function (e) { e.preventDefault(); exec(input.value); input.value = ''; });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } else { hIdx = history.length; input.value = ''; } e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      var v = input.value.toLowerCase();
      var m = Object.keys(COMMANDS).filter(function (k) { return !COMMANDS[k].hidden && k.indexOf(v) === 0; });
      if (m.length === 1) input.value = m[0] + ' ';
      else if (m.length > 1) print('<span class="out">' + m.join('  ') + '</span>');
    }
  });
  $('#shell-term').addEventListener('click', function (e) { if (!e.target.closest('a')) input.focus({ preventScroll: true }); });

  /* ───────── command palette ───────── */
  var palette = $('#palette'), pIn = $('#palette-in'), pList = $('#palette-list'), sel = 0, items = [];
  var ACTIONS = [
    { label: 'Go to about.md', hint: 'section', run: function () { goTo('about'); } },
    { label: 'Go to work/', hint: 'section', run: function () { goTo('work'); } },
    { label: 'Go to experience.log', hint: 'section', run: function () { goTo('experience'); } },
    { label: 'Go to stack.json', hint: 'section', run: function () { goTo('stack'); } },
    { label: 'Open the shell', hint: 'section', run: function () { goTo('shell'); setTimeout(function () { input.focus({ preventScroll: true }); }, 400); } },
    { label: 'Go to contact.sh', hint: 'section', run: function () { goTo('contact'); } },
    { label: 'Toggle theme', hint: 'light / dark', run: toggleTheme },
    { label: 'Email Raj', hint: LINKS.email, run: function () { location.href = 'mailto:' + LINKS.email; } },
    { label: 'Open LinkedIn', hint: 'linkedin', run: function () { open(LINKS.linkedin); } },
    { label: 'Open X', hint: '@Raj_Sahani_', run: function () { open(LINKS.x); } },
    { label: 'Open GitHub', hint: 'github.com/Raj-Mixar', run: function () { open(LINKS.github); } },
    { label: 'Open Mixar', hint: 'mixar.app', run: function () { open(LINKS.mixar); } },
    { label: 'View mixar-app source', hint: 'open source', run: function () { open(LINKS.mixarApp); } },
    { label: 'Back to top', hint: '', run: function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); } }
  ];

  function renderPalette() {
    var q = pIn.value.toLowerCase().trim();
    items = ACTIONS.filter(function (a) { return !q || (a.label + ' ' + a.hint).toLowerCase().indexOf(q) !== -1; });
    sel = Math.min(sel, Math.max(0, items.length - 1));
    pList.innerHTML = items.length ? items.map(function (a, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span>' + esc(a.label) + '</span><span class="hint">' + esc(a.hint) + '</span></li>';
    }).join('') : '<li aria-disabled="true"><span class="hint">no matches</span></li>';
  }
  function openPalette() { palette.hidden = false; pIn.value = ''; sel = 0; renderPalette(); pIn.focus(); }
  function closePalette() { palette.hidden = true; }
  function runSel() { var a = items[sel]; if (!a) return; closePalette(); a.run(); }

  $('#palette-open').addEventListener('click', openPalette);
  pIn.addEventListener('input', function () { sel = 0; renderPalette(); });
  pIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { sel = (sel + 1) % Math.max(1, items.length); renderPalette(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = (sel - 1 + items.length) % Math.max(1, items.length); renderPalette(); e.preventDefault(); }
    else if (e.key === 'Enter') { runSel(); e.preventDefault(); }
  });
  pList.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) { sel = +li.dataset.i; runSel(); } });
  palette.addEventListener('click', function (e) { if (e.target === palette) closePalette(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); }
    else if (e.key === 'Escape' && !palette.hidden) closePalette();
    else if (e.key === '/' && palette.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openPalette(); }
  });
})();
