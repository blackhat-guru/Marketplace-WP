/* ==========================================================================
   Search — a small local relevance search over the SAMPLE dataset plus an
   accessible combobox for suggestions. This is not a production search
   engine; in WordPress it would call a REST endpoint (e.g. WooCommerce
   product search or a dedicated index such as ElasticPress).
   ========================================================================== */
(function (M) {
  'use strict';
  const { esc, url, uid, money } = M.util;

  const POPULAR = ['SaaS landing page', 'Tailwind', 'Portfolio', 'Admin dashboard', 'Bootstrap', 'Free'];
  const SYNONYMS = { ecommerce: ['shop', 'store'], 'e-commerce': ['ecommerce'], dashboard: ['admin'], tailwindcss: ['tailwind'], js: ['vanilla'], free: ['free'] };

  const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

  function haystack(p) {
    const D = M.data;
    return {
      name: norm(p.name),
      short: norm(p.shortName),
      sub: norm(M.catalog.subName(p.subcategory) + ' ' + p.subcategory),
      tech: norm(p.tech.map((t) => D.technologies[t] + ' ' + t).concat(p.tools.map((t) => D.tools[t] + ' ' + t)).concat(p.features.map((f) => D.features[f])).join(' ')),
      tags: norm(p.tags.join(' ') + (p.price === 0 ? ' free' : '')),
      text: norm(p.summary + ' ' + p.description),
      seller: norm((M.catalog.seller(p.seller) || {}).name),
    };
  }

  /** Returns [{ product, score }] for every product matching ALL query tokens. */
  function query(q, list) {
    list = list || M.catalog.all();
    const tokens = norm(q).split(/[^a-z0-9.]+/).filter((t) => t.length > 0 && !['template', 'templates', 'website', 'websites', 'html', 'the', 'and', 'for', 'a', 'page'].includes(t));
    if (!tokens.length) return list.map((p) => ({ product: p, score: 0 }));
    return list.map((p) => {
      const h = haystack(p);
      let score = 0;
      for (const t of tokens) {
        const variants = [t].concat(SYNONYMS[t] || []);
        let best = 0;
        for (const v of variants) {
          if (h.short === v) best = Math.max(best, 60);
          else if (h.short.startsWith(v)) best = Math.max(best, 40);
          if (h.name.includes(v)) best = Math.max(best, 25);
          if (h.tags.includes(v)) best = Math.max(best, 18);
          if (h.sub.includes(v)) best = Math.max(best, 16);
          if (h.tech.includes(v)) best = Math.max(best, 14);
          if (h.seller.includes(v)) best = Math.max(best, 8);
          if (h.text.includes(v)) best = Math.max(best, 4);
        }
        if (!best) return null; // all tokens must match
        score += best;
      }
      return { product: p, score: score + p.rating }; // small quality tie-breaker
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function highlight(text, q) {
    const t = norm(q).trim();
    if (!t) return esc(text);
    const i = norm(text).indexOf(t);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + t.length)) + '</mark>' + esc(text.slice(i + t.length));
  }

  /** Attach suggestions to a search <form>. */
  function attach(form, opts) {
    opts = opts || {};
    if (form.dataset.searchReady) return;
    form.dataset.searchReady = '1';
    const input = form.querySelector('input[type="search"]');
    const list = document.createElement('div');
    const id = uid('suggest');
    list.className = 'suggest';
    list.id = id;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Search suggestions');
    list.hidden = true;
    (opts.host || form).appendChild(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', id);
    let active = -1;
    let options = [];

    const go = (href) => { location.href = href; };
    const searchHref = (q) => url('pages/search.html?q=' + encodeURIComponent(q));

    function render() {
      const q = input.value.trim();
      let html = '';
      options = [];
      const opt = (inner, href, cls) => {
        const oid = id + '-o' + options.length;
        options.push({ id: oid, href });
        return '<div class="suggest__item' + (cls ? ' ' + cls : '') + '" role="option" id="' + oid + '" aria-selected="false" data-href="' + esc(href) + '">' + inner + '</div>';
      };
      if (!q) {
        html += '<p class="suggest__label" aria-hidden="true">Popular searches</p>' + POPULAR.map((p) => opt(M.icon('trending', 'icon--sm') + '<span>' + esc(p) + '</span>', searchHref(p))).join('');
        html += '<p class="suggest__label" aria-hidden="true">Categories</p>' + M.data.categories.filter((c) => c.live).slice(0, 4).map((c) => opt(M.icon(c.icon, 'icon--sm') + '<span>' + esc(c.name) + '</span>', url(c.route))).join('');
      } else {
        const results = query(q).slice(0, 5);
        if (results.length) {
          html += '<p class="suggest__label" aria-hidden="true">Templates</p>' + results.map(({ product: p }) =>
            opt('<img class="suggest__thumb" src="' + url(p.images.main) + '" alt="" width="56" height="35"><span style="min-width:0"><span style="display:block">' + highlight(p.name, q) + '</span><span class="suggest__meta">' + esc(M.catalog.subName(p.subcategory)) + ' · ' + money(p.price) + '</span></span>', M.catalog.productUrl(p))).join('');
        } else {
          html += '<p class="suggest__empty">No templates match “' + esc(q) + '”. Try a technology (e.g. Tailwind) or a use case (e.g. portfolio).</p>';
        }
        html += opt(M.icon('search', 'icon--sm') + '<span>See all results for “<strong>' + esc(q) + '</strong>”</span>', searchHref(q));
      }
      list.innerHTML = html;
      active = -1;
      input.removeAttribute('aria-activedescendant');
    }
    function open() { render(); list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
    function close() { if (opts.alwaysOpen) return; list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
    function move(d) {
      if (list.hidden) open();
      if (!options.length) return;
      active = (active + d + options.length) % options.length;
      options.forEach((o, i) => document.getElementById(o.id).setAttribute('aria-selected', i === active ? 'true' : 'false'));
      const el = document.getElementById(options[active].id);
      input.setAttribute('aria-activedescendant', options[active].id);
      el.scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('focus', open);
    input.addEventListener('input', M.util.debounce(open, 80));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape' && !list.hidden && !opts.alwaysOpen) { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Enter' && active > -1) { e.preventDefault(); go(options[active].href); }
    });
    list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in input
    list.addEventListener('click', (e) => { const o = e.target.closest('[data-href]'); if (o) go(o.dataset.href); });
    document.addEventListener('click', (e) => { if (!form.contains(e.target) && !list.contains(e.target)) close(); });
    form.addEventListener('focusout', (e) => { if (e.relatedTarget && !form.contains(e.relatedTarget) && !list.contains(e.relatedTarget)) close(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      go(q ? searchHref(q) : url('pages/search.html'));
    });
    if (opts.alwaysOpen) open();
  }

  M.search = { query, attach, POPULAR, highlight };
})((window.Market = window.Market || {}));
