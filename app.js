/* ============================================================
   Interactive cut diagram: language switch, hover names,
   click detail, and search with autocomplete + highlight.
   Expects window.ANIMAL to be set by the page before this runs.
   ============================================================ */

(function () {
  'use strict';

  var A = window.ANIMAL;
  if (!A) return;

  var CODES = LANGS.map(function (l) { return l.code; });
  var lang = 'en';
  try {
    var saved = localStorage.getItem('cutlang');
    if (saved && CODES.indexOf(saved) !== -1) lang = saved;
  } catch (e) {}

  var byId = {};
  A.primals.forEach(function (p) { byId[p.id] = p; });
  var cutsOf = {};
  A.cuts.forEach(function (c) {
    (cutsOf[c.primal] = cutsOf[c.primal] || []).push(c);
  });

  var svg      = document.getElementById('diagram');
  var tooltip  = document.getElementById('tip');
  var panel    = document.getElementById('detail');
  var input    = document.getElementById('cut-search');
  var listBox  = document.getElementById('suggest');
  var noteEl   = document.getElementById('animal-note');
  var hintEl   = document.getElementById('diagram-hint');
  var langWrap = document.getElementById('langs');

  var selected = null;
  var activeIdx = -1;
  var matches = [];

  function t(dict) { return dict[lang] || dict.en; }

  /* ---------------- language switcher ---------------- */

  function buildLangs() {
    if (!langWrap) return;
    langWrap.innerHTML = '';
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-btn' + (l.code === lang ? ' is-on' : '');
      b.textContent = l.label;
      b.setAttribute('lang', l.code);
      b.setAttribute('aria-pressed', l.code === lang ? 'true' : 'false');
      b.title = l.name;
      b.addEventListener('click', function () { setLang(l.code); });
      langWrap.appendChild(b);
    });
  }

  function setLang(code) {
    lang = code;
    try { localStorage.setItem('cutlang', code); } catch (e) {}
    buildLangs();
    paintLabels();
    if (noteEl) noteEl.textContent = t(A.note);
    if (hintEl) hintEl.textContent = t(UI.tapHint);
    if (input) {
      input.placeholder = t(UI.searchPh);
      input.setAttribute('aria-label', t(UI.searchLabel));
    }
    if (selected) showDetail(selected);
    if (input && input.value) runSearch(input.value);
  }

  /* ---------------- diagram ---------------- */

  /* Diagram labels stay English: the artwork is sized for them, and other
     scripts run long enough to overflow the regions. The translated name is
     one hover or one click away, which is where it is actually needed. */
  function paintLabels() {}

  function regions() {
    return svg ? Array.prototype.slice.call(svg.querySelectorAll('.primal')) : [];
  }

  function highlight(id) {
    regions().forEach(function (r) {
      r.classList.toggle('is-on', r.getAttribute('data-primal') === id);
    });
  }

  function showTip(p, evt) {
    if (!tooltip) return;
    var rows = LANGS.map(function (l) {
      return '<div class="tip-row"><span class="tip-code">' + l.label +
             '</span><span class="tip-name" lang="' + l.code + '">' +
             esc(p.names[l.code]) + '</span></div>';
    }).join('');
    tooltip.innerHTML = '<div class="tip-head">' + esc(p.names.en) + '</div>' + rows;
    tooltip.hidden = false;
    moveTip(evt);
  }

  function moveTip(evt) {
    if (!tooltip || tooltip.hidden) return;
    var pad = 14;
    var w = tooltip.offsetWidth, h = tooltip.offsetHeight;
    var x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = evt.clientY - h - pad;
    tooltip.style.left = Math.max(8, x) + 'px';
    tooltip.style.top = Math.max(8, y) + 'px';
  }

  function hideTip() { if (tooltip) tooltip.hidden = true; }

  /* Some cuts are drawn as several shapes (sirloin, belly, picnic); light
     them all so the whole cut reads as one region. */
  function groupHover(id, on) {
    regions().forEach(function (r) {
      if (r.getAttribute('data-primal') === id) r.classList.toggle('is-hover', on);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- detail panel ---------------- */

  function showDetail(id, cutId) {
    var p = byId[id];
    if (!p || !panel) return;
    selected = id;
    highlight(id);

    var names = LANGS.map(function (l) {
      return '<li><span class="nm-code">' + l.label + '</span>' +
             '<span class="nm-val" lang="' + l.code + '">' + esc(p.names[l.code]) + '</span></li>';
    }).join('');

    var list = (cutsOf[id] || []).map(function (c) {
      var ms = c.methods.map(function (m) { return esc(t(METHODS[m])); }).join(' · ');
      return '<li class="cut' + (c.id === cutId ? ' is-on' : '') + '" id="cut-' + c.id + '">' +
             '<div class="cut-top">' +
               '<span class="cut-name" lang="' + lang + '">' + esc(t(c.names)) + '</span>' +
               '<span class="cut-price" aria-label="relative price">' +
                 '<b>' + '$'.repeat(c.price) + '</b>' + '$'.repeat(3 - c.price) +
               '</span>' +
             '</div>' +
             '<p class="cut-desc" lang="' + lang + '">' + esc(t(c.desc)) + '</p>' +
             '<p class="cut-meta">' + esc(t(UI.bestFor)) + ': ' + ms + '</p>' +
             '</li>';
    }).join('');

    panel.innerHTML =
      '<div class="detail-head">' +
        '<h3 lang="' + lang + '">' + esc(t(p.names)) + '</h3>' +
        '<button type="button" class="detail-x" id="detail-x" aria-label="' + esc(t(UI.clear)) + '">×</button>' +
      '</div>' +
      '<ul class="names">' + names + '</ul>' +
      '<p class="detail-desc" lang="' + lang + '">' + esc(t(p.desc)) + '</p>' +
      '<h4>' + esc(t(UI.cutsIn)) + ' ' + esc(p.names.en) + '</h4>' +
      '<ul class="cuts">' + list + '</ul>';

    panel.hidden = false;
    var x = document.getElementById('detail-x');
    if (x) x.addEventListener('click', clearSelection);

    if (cutId) {
      var el = document.getElementById('cut-' + cutId);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function clearSelection() {
    selected = null;
    highlight(null);
    if (panel) { panel.hidden = true; panel.innerHTML = ''; }
    if (input) input.value = '';
    closeSuggest();
  }

  /* ---------------- search ---------------- */

  function haystack(o) {
    return CODES.map(function (c) { return o.names[c]; }).join(' ').toLowerCase();
  }

  function runSearch(q) {
    q = q.trim().toLowerCase();
    matches = [];
    if (!q) { closeSuggest(); return; }

    A.cuts.forEach(function (c) {
      var h = haystack(c);
      var i = h.indexOf(q);
      if (i !== -1) matches.push({ kind: 'cut', o: c, rank: i === 0 ? 0 : 1 });
    });
    A.primals.forEach(function (p) {
      var h = haystack(p);
      var i = h.indexOf(q);
      if (i !== -1) matches.push({ kind: 'primal', o: p, rank: i === 0 ? 0 : 1 });
    });

    matches.sort(function (a, b) { return a.rank - b.rank; });
    matches = matches.slice(0, 8);
    activeIdx = -1;
    renderSuggest(q);
  }

  function renderSuggest(q) {
    if (!listBox) return;
    if (!matches.length) {
      listBox.innerHTML = '<li class="sg-none">' + esc(t(UI.noResults)) + '</li>';
      openSuggest();
      return;
    }
    listBox.innerHTML = matches.map(function (m, i) {
      var primalName = m.kind === 'cut' ? byId[m.o.primal].names.en : m.o.names.en;
      /* Show the language whose name actually matched, so a Korean query
         surfaces the Korean name rather than the English one. */
      var hit = CODES.filter(function (c) {
        return m.o.names[c].toLowerCase().indexOf(q) !== -1;
      });
      var shown = hit.indexOf(lang) !== -1 ? lang : (hit[0] || lang);
      var alt = shown !== lang ? ' <span class="sg-alt" lang="' + lang + '">' + esc(t(m.o.names)) + '</span>' : '';
      return '<li class="sg' + (i === activeIdx ? ' is-active' : '') + '" role="option" data-i="' + i + '"' +
             (i === activeIdx ? ' aria-selected="true"' : '') + '>' +
             '<span class="sg-name" lang="' + shown + '">' + esc(m.o.names[shown]) + '</span>' + alt +
             '<span class="sg-where">' + esc(primalName) + '</span></li>';
    }).join('');
    openSuggest();
  }

  function openSuggest() {
    if (!listBox) return;
    listBox.hidden = false;
    if (input) input.setAttribute('aria-expanded', 'true');
  }

  function closeSuggest() {
    if (!listBox) return;
    listBox.hidden = true;
    listBox.innerHTML = '';
    activeIdx = -1;
    if (input) input.setAttribute('aria-expanded', 'false');
  }

  function choose(i) {
    var m = matches[i];
    if (!m) return;
    if (m.kind === 'cut') {
      input.value = t(m.o.names);
      showDetail(m.o.primal, m.o.id);
    } else {
      input.value = t(m.o.names);
      showDetail(m.o.id);
    }
    closeSuggest();
    if (svg) svg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------------- wiring ---------------- */

  regions().forEach(function (r) {
    var id = r.getAttribute('data-primal');
    r.setAttribute('tabindex', '0');
    r.setAttribute('role', 'button');
    r.setAttribute('aria-label', byId[id] ? byId[id].names.en : id);

    r.addEventListener('mouseenter', function (e) {
      groupHover(id, true);
      if (byId[id]) showTip(byId[id], e);
    });
    r.addEventListener('mousemove', moveTip);
    r.addEventListener('mouseleave', function () { groupHover(id, false); hideTip(); });
    r.addEventListener('click', function () { hideTip(); showDetail(id); });
    r.addEventListener('focus', function () {
      var b = r.getBoundingClientRect();
      showTip(byId[id], { clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 });
    });
    r.addEventListener('blur', hideTip);
    r.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(id); }
    });
  });

  if (input) {
    input.addEventListener('input', function () { runSearch(input.value); });
    input.addEventListener('focus', function () { if (input.value) runSearch(input.value); });
    input.addEventListener('keydown', function (e) {
      if (listBox.hidden || !matches.length) {
        if (e.key === 'Escape') clearSelection();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault(); activeIdx = (activeIdx + 1) % matches.length; renderSuggest(input.value.trim().toLowerCase());
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); activeIdx = (activeIdx - 1 + matches.length) % matches.length; renderSuggest(input.value.trim().toLowerCase());
      } else if (e.key === 'Enter') {
        e.preventDefault(); choose(activeIdx === -1 ? 0 : activeIdx);
      } else if (e.key === 'Escape') {
        closeSuggest();
      }
    });
  }

  if (listBox) {
    listBox.addEventListener('mousedown', function (e) {
      var li = e.target.closest('li.sg');
      if (!li) return;
      e.preventDefault();
      choose(Number(li.getAttribute('data-i')));
    });
  }

  document.addEventListener('click', function (e) {
    if (input && !input.contains(e.target) && listBox && !listBox.contains(e.target)) closeSuggest();
  });

  buildLangs();
  setLang(lang);
})();
