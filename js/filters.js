/* ==========================================================================
   Listing engine — filters, sorting, active chips, pagination / load more,
   loading + empty states. Shared by the HTML category page, search results
   and seller storefronts. Facet options are derived from the products being
   listed, so only relevant filters are shown.

   Usage: M.listing({ root, products: () => [...], facets: [...], ... })
   Expected markup inside root (all optional except [data-results]):
     [data-filters] [data-results] [data-count] [data-active-filters]
     [data-sort] [data-pagination] [data-local-search] [data-results-status]
     .filters-panel  [data-open-filters]  [data-filters-apply]  [data-filters-clear]
   ========================================================================== */
(function (M) {
  'use strict';
  const { $, $$, esc, num } = M.util;

  const SORTS = [
    ['relevance', 'Relevance'],
    ['newest', 'Newest'],
    ['bestselling', 'Best selling'],
    ['rating', 'Top rated'],
    ['price-asc', 'Price: Low to High'],
    ['price-desc', 'Price: High to Low'],
  ];

  const FACETS = {
    sub: { label: 'Category', key: 'sub', values: (p) => [p.subcategory], name: (v) => M.catalog.subName(v) },
    tech: { label: 'Framework / Technology', key: 'tech', values: (p) => p.tech, name: (v) => M.data.technologies[v] },
    tools: { label: 'Compatible Tools', key: 'tools', values: (p) => p.tools, name: (v) => M.data.tools[v] },
    features: { label: 'Features', key: 'feat', values: (p) => p.features, name: (v) => M.data.features[v], all: true },
    license: { label: 'License', key: 'lic', values: (p) => p.licenses.map((l) => l.id), name: (v) => M.catalog.licenseName(v) },
    seller: { label: 'Seller', key: 'seller', values: (p) => [p.seller], name: (v) => (M.catalog.seller(v) || {}).name || v },
  };

  M.listing = function (cfg) {
    const root = cfg.root;
    const facets = cfg.facets || ['sub', 'price', 'tech', 'tools', 'features', 'license', 'rating', 'seller'];
    const pageSize = cfg.pageSize || 9;
    const el = {
      filters: $('[data-filters]', root),
      results: $('[data-results]', root),
      count: $$('[data-count]', root),
      chips: $('[data-active-filters]', root),
      sort: $('[data-sort]', root),
      pagination: $('[data-pagination]', root),
      search: cfg.searchInput || $('[data-local-search]', root),
      status: $('[data-results-status]', root),
      panel: $('.filters-panel', root),
      apply: $('[data-filters-apply]', root),
    };

    const P = new URLSearchParams(location.search);
    const set = (k) => new Set((P.get(k) || '').split(',').filter(Boolean));
    const state = {
      q: cfg.query != null ? cfg.query : P.get('q') || '',
      sub: set('sub'), tech: set('tech'), tools: set('tools'), feat: set('feat'), lic: set('lic'), seller: set('seller'),
      price: P.get('price') || 'all',
      min: P.get('min') || '', max: P.get('max') || '',
      rating: parseFloat(P.get('rating')) || 0,
      sort: P.get('sort') || cfg.defaultSort || 'relevance',
      page: Math.max(1, parseInt(P.get('page'), 10) || 1),
      shown: pageSize,
    };
    if (cfg.lock) Object.keys(cfg.lock).forEach((k) => (state[k] = cfg.lock[k]));

    const base = () => cfg.products();

    /* ---------- filtering ---------- */
    function matches(p, skip) {
      const inSet = (setV, vals, all) => !setV.size || (all ? [...setV].every((v) => vals.includes(v)) : vals.some((v) => setV.has(v)));
      if (skip !== 'sub' && !inSet(state.sub, [p.subcategory])) return false;
      if (skip !== 'tech' && !inSet(state.tech, p.tech)) return false;
      if (skip !== 'tools' && !inSet(state.tools, p.tools)) return false;
      if (skip !== 'feat' && !inSet(state.feat, p.features, true)) return false;
      if (skip !== 'lic' && !inSet(state.lic, p.licenses.map((l) => l.id))) return false;
      if (skip !== 'seller' && !inSet(state.seller, [p.seller])) return false;
      if (skip !== 'price') {
        if (state.price === 'free' && p.price !== 0) return false;
        if (state.price === 'paid' && p.price === 0) return false;
        if (state.min !== '' && p.price < +state.min) return false;
        if (state.max !== '' && p.price > +state.max) return false;
      }
      if (skip !== 'rating' && state.rating && p.rating < state.rating) return false;
      return true;
    }

    function compute() {
      let list = base();
      let scored;
      if (state.q) scored = M.search.query(state.q, list);
      else scored = list.map((p) => ({ product: p, score: 0 }));
      const scoreOf = new Map(scored.map((s) => [s.product.id, s.score]));
      list = scored.map((s) => s.product).filter((p) => matches(p));
      const by = {
        relevance: (a, b) => (scoreOf.get(b.id) - scoreOf.get(a.id)) || ((b.flags.featured ? 1 : 0) - (a.flags.featured ? 1 : 0)) || (b.rating * Math.log(b.reviewCount + 1) - a.rating * Math.log(a.reviewCount + 1)),
        newest: (a, b) => String(b.published).localeCompare(String(a.published)),
        bestselling: (a, b) => b.sales - a.sales,
        rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
      }[state.sort] || (() => 0);
      return list.slice().sort(by);
    }

    /* ---------- facet UI ---------- */
    function facetCounts(f) {
      const counts = new Map();
      const pool = state.q ? M.search.query(state.q, base()).map((s) => s.product) : base();
      pool.filter((p) => matches(p, f.key)).forEach((p) => f.values(p).forEach((v) => counts.set(v, (counts.get(v) || 0) + 1)));
      return counts;
    }

    function groupHTML(id, label, body, open) {
      return '<div class="filter-group"><h3 style="margin:0;font-size:inherit"><button type="button" class="filter-group__trigger" data-disclosure aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="fg-' + id + '">' + label + M.icon('chevron-down') + '</button></h3>' +
        '<div class="filter-group__body" id="fg-' + id + '"' + (open ? '' : ' hidden') + '>' + body + '</div></div>';
    }

    function renderFilters() {
      if (!el.filters) return;
      const openState = {};
      $$('.filter-group__trigger', el.filters).forEach((b) => (openState[b.getAttribute('aria-controls')] = b.getAttribute('aria-expanded') === 'true'));
      const isOpen = (id, d) => (openState['fg-' + id] !== undefined ? openState['fg-' + id] : d);
      let html = '';
      facets.forEach((name, gi) => {
        if (name === 'price') {
          const pool = base();
          const hasFree = pool.some((p) => p.price === 0);
          const hasPaid = pool.some((p) => p.price > 0);
          let body = '';
          if (hasFree && hasPaid) {
            body += [['all', 'All prices'], ['free', 'Free'], ['paid', 'Paid']].map(([v, l]) =>
              '<label class="check"><input type="radio" name="' + cfg.id + '-price" value="' + v + '" data-f="price"' + (state.price === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('');
          }
          body += '<div class="price-range"><label class="sr-only" for="' + cfg.id + '-min">Minimum price in dollars</label><input class="input" id="' + cfg.id + '-min" type="number" inputmode="numeric" min="0" step="1" placeholder="Min $" value="' + esc(state.min) + '" data-f="min">' +
            '<span class="text-muted" aria-hidden="true">–</span><label class="sr-only" for="' + cfg.id + '-max">Maximum price in dollars</label><input class="input" id="' + cfg.id + '-max" type="number" inputmode="numeric" min="0" step="1" placeholder="Max $" value="' + esc(state.max) + '" data-f="max"></div>';
          html += groupHTML(cfg.id + '-price', 'Price', body, isOpen(cfg.id + '-price', true));
          return;
        }
        if (name === 'rating') {
          const pool = base();
          const opts = [4.5, 4, 3].filter((t) => pool.some((p) => p.rating >= t));
          if (!opts.length) return;
          const body = [[0, 'Any rating']].concat(opts.map((t) => [t, t + ' stars & up'])).map(([v, l]) =>
            '<label class="check"><input type="radio" name="' + cfg.id + '-rating" value="' + v + '" data-f="rating"' + (state.rating === v ? ' checked' : '') + '><span>' + (v ? M.render.stars(v).replace('rating__stars', 'rating__stars') + ' ' : '') + l + '</span></label>').join('') +
            '<p class="hint" style="margin-top:4px">Ratings shown are sample data.</p>';
          html += groupHTML(cfg.id + '-rating', 'Rating', body, isOpen(cfg.id + '-rating', gi < 4));
          return;
        }
        const f = FACETS[name];
        if (!f) return;
        if (cfg.lock && cfg.lock[f.key]) return;
        const counts = facetCounts(f);
        const all = new Set();
        base().forEach((p) => f.values(p).forEach((v) => all.add(v)));
        if (all.size < 2 && !state[f.key].size) return; // nothing to choose between
        const values = [...all].sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || String(f.name(a)).localeCompare(f.name(b)));
        const LIMIT = 6;
        const id = cfg.id + '-' + f.key;
        let body = values.map((v, i) => {
          const c = counts.get(v) || 0;
          const checked = state[f.key].has(v);
          return '<label class="check"' + (i >= LIMIT && !checked ? ' data-more-item hidden' : '') + '><input type="checkbox" value="' + esc(v) + '" data-f="' + f.key + '"' + (checked ? ' checked' : '') + (c === 0 && !checked ? ' disabled' : '') + '><span>' + esc(f.name(v)) + '</span><span class="check__count">' + c + '</span></label>';
        }).join('');
        if (values.length > LIMIT) body += '<button type="button" class="filter-group__more" data-show-more aria-expanded="false">Show ' + (values.length - LIMIT) + ' more</button>';
        if (f.key === 'feat') body += '<p class="hint" style="margin-top:4px">Shows templates with all selected features.</p>';
        html += groupHTML(id, f.label, body, isOpen(id, gi < 4));
      });
      el.filters.innerHTML = html;
    }

    /* ---------- chips ---------- */
    function renderChips() {
      if (!el.chips) return;
      const chips = [];
      const chip = (label, k, v) => chips.push('<button type="button" class="chip chip--removable" data-remove="' + k + '" data-value="' + esc(v) + '"><span>' + esc(label) + '</span><span class="chip__x">' + M.icon('x', 'icon--sm') + '</span><span class="sr-only">Remove filter</span></button>');
      if (state.q && !cfg.query) chip('“' + state.q + '”', 'q', '');
      ['sub', 'tech', 'tools', 'feat', 'lic', 'seller'].forEach((k) => {
        if (cfg.lock && cfg.lock[k]) return;
        const f = Object.values(FACETS).find((x) => x.key === k);
        state[k].forEach((v) => chip(f.name(v), k, v));
      });
      if (state.price !== 'all') chip(state.price === 'free' ? 'Free' : 'Paid', 'price', '');
      if (state.min !== '') chip('Min $' + state.min, 'min', '');
      if (state.max !== '') chip('Max $' + state.max, 'max', '');
      if (state.rating) chip(state.rating + '★ & up', 'rating', '');
      el.chips.innerHTML = chips.length ? chips.join('') + '<button type="button" class="btn btn--ghost btn--sm" data-filters-clear>Clear all filters</button>' : '';
      return chips.length;
    }
    const activeCount = () => {
      let n = 0;
      ['sub', 'tech', 'tools', 'feat', 'lic', 'seller'].forEach((k) => { if (!(cfg.lock && cfg.lock[k])) n += state[k].size; });
      return n + (state.price !== 'all') + (state.min !== '') + (state.max !== '') + (state.rating ? 1 : 0);
    };

    /* ---------- results ---------- */
    let current = [];
    function renderResults(opts) {
      opts = opts || {};
      current = compute();
      const total = current.length;
      el.count.forEach((c) => (c.textContent = num(total)));
      if (el.status) el.status.textContent = total + (total === 1 ? ' template' : ' templates') + ' found';
      if (el.apply) el.apply.textContent = 'Show ' + total + (total === 1 ? ' result' : ' results');
      $$('[data-active-count]', document).forEach((b) => { const n = activeCount(); b.textContent = n ? n : ''; b.hidden = !n; });
      if (cfg.onUpdate) cfg.onUpdate({ total, state });

      if (!total) {
        el.results.innerHTML = '';
        el.results.setAttribute('aria-busy', 'false');
        el.results.insertAdjacentHTML('afterbegin', '<div style="grid-column:1/-1">' + (cfg.empty ? cfg.empty(state) : M.render.emptyState({
          icon: 'search', title: 'No templates match these filters',
          desc: 'Try removing a filter or two, or search for a technology like “Tailwind” or a use case like “portfolio”.',
          actions: '<button type="button" class="btn btn--primary" data-filters-clear>Clear all filters</button><a class="btn" href="' + M.util.url('pages/html-templates.html') + '">Browse all templates</a>',
        })) + '</div>');
        if (el.pagination) el.pagination.innerHTML = '';
        return;
      }

      let slice;
      if (cfg.mode === 'loadmore') slice = current.slice(0, state.shown);
      else {
        const pages = Math.ceil(total / pageSize);
        state.page = Math.min(state.page, pages);
        slice = current.slice((state.page - 1) * pageSize, state.page * pageSize);
      }
      const html = slice.map((p) => M.render.productCard(p, { headingLevel: cfg.headingLevel || 3, showSales: state.sort === 'bestselling' })).join('');
      if (opts.append) {
        const before = el.results.children.length;
        el.results.innerHTML = html;
        const firstNew = el.results.children[before];
        if (firstNew) { const a = firstNew.querySelector('.product-card__title a'); if (a) a.focus({ preventScroll: false }); }
      } else el.results.innerHTML = html;
      el.results.setAttribute('aria-busy', 'false');
      renderPagination(total);
      if (M.motion) M.motion.grid(el.results);
    }

    function renderPagination(total) {
      if (!el.pagination) return;
      if (cfg.mode === 'loadmore') {
        const shown = Math.min(state.shown, total);
        el.pagination.innerHTML = '<div class="pagination"><p class="pagination__status">Showing ' + shown + ' of ' + total + ' templates</p><div class="pagination__progress" aria-hidden="true"><span style="width:' + (shown / total) * 100 + '%"></span></div>' +
          (shown < total ? '<button type="button" class="btn" data-load-more>Load more templates</button>' : '<p class="text-muted" style="font-size:var(--text-meta)">You’ve reached the end of the results.</p>') + '</div>';
        return;
      }
      const pages = Math.ceil(total / pageSize);
      const from = (state.page - 1) * pageSize + 1;
      const to = Math.min(total, state.page * pageSize);
      let html = '<nav class="pagination" aria-label="Pagination"><p class="pagination__status">Showing ' + from + '–' + to + ' of ' + total + '</p>';
      if (pages > 1) {
        html += '<ul class="pager"><li><button type="button" data-goto-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + ' aria-label="Previous page">' + M.icon('chevron-left') + '</button></li>';
        for (let i = 1; i <= pages; i++) html += '<li><button type="button" data-goto-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + ' aria-label="Page ' + i + '">' + i + '</button></li>';
        html += '<li><button type="button" data-goto-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + ' aria-label="Next page">' + M.icon('chevron-right') + '</button></li></ul>';
      }
      el.pagination.innerHTML = html + '</nav>';
    }

    /* ---------- URL sync ---------- */
    function syncUrl() {
      if (cfg.syncUrl === false) return;
      const p = new URLSearchParams(location.search);
      const put = (k, v) => (v ? p.set(k, v) : p.delete(k));
      if (!cfg.query) put('q', state.q);
      ['sub', 'tech', 'tools', 'feat', 'lic', 'seller'].forEach((k) => { if (!(cfg.lock && cfg.lock[k])) put(k, [...state[k]].join(',')); });
      put('price', state.price !== 'all' ? state.price : '');
      put('min', state.min); put('max', state.max);
      put('rating', state.rating ? String(state.rating) : '');
      put('sort', state.sort !== (cfg.defaultSort || 'relevance') ? state.sort : '');
      put('page', cfg.mode !== 'loadmore' && state.page > 1 ? String(state.page) : '');
      const s = p.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    }

    function update(opts) {
      opts = opts || {};
      if (!opts.keepPage) { state.page = 1; state.shown = pageSize; }
      if (!opts.skipFilters) renderFilters();
      renderChips();
      if (opts.loading) {
        el.results.setAttribute('aria-busy', 'true');
        el.results.innerHTML = M.render.skeletonCards(Math.min(pageSize, 6));
        setTimeout(() => renderResults(opts), opts.loading);
      } else renderResults(opts);
      syncUrl();
      if (cfg.onSubnav) cfg.onSubnav(state);
    }

    function clearAll() {
      ['sub', 'tech', 'tools', 'feat', 'lic', 'seller'].forEach((k) => { if (!(cfg.lock && cfg.lock[k])) state[k].clear(); });
      state.price = 'all'; state.min = ''; state.max = ''; state.rating = 0;
      if (!cfg.query) { state.q = ''; if (el.search) el.search.value = ''; }
      update();
      M.toast({ title: 'Filters cleared', type: 'info', duration: 2500 });
    }

    /* ---------- events ---------- */
    root.addEventListener('change', (e) => {
      const t = e.target;
      const k = t.dataset && t.dataset.f;
      if (!k) return;
      if (['sub', 'tech', 'tools', 'feat', 'lic', 'seller'].includes(k)) { t.checked ? state[k].add(t.value) : state[k].delete(t.value); }
      else if (k === 'price') state.price = t.value;
      else if (k === 'rating') state.rating = parseFloat(t.value) || 0;
      else if (k === 'min' || k === 'max') {
        const v = t.value === '' ? '' : String(Math.max(0, Math.round(+t.value)));
        state[k] = v;
        if (state.min !== '' && state.max !== '' && +state.min > +state.max) {
          t.setCustomValidity('Min must be less than max'); t.setAttribute('aria-invalid', 'true');
          M.toast({ type: 'error', title: 'Minimum price is higher than maximum', desc: 'Adjust the price range to see results.' });
        } else { $$('[data-f="min"],[data-f="max"]', root).forEach((i) => { i.setCustomValidity(''); i.removeAttribute('aria-invalid'); }); }
      }
      update({ skipFilters: k === 'min' || k === 'max' });
      // keep keyboard focus on the same control after re-render
      if (k !== 'min' && k !== 'max') {
        const again = root.querySelector('[data-f="' + k + '"][value="' + CSS.escape(t.value) + '"]');
        if (again) again.focus();
      }
    });
    root.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        const k = rm.dataset.remove;
        if (k === 'q') { state.q = ''; if (el.search) el.search.value = ''; }
        else if (k === 'price') state.price = 'all';
        else if (k === 'min' || k === 'max') state[k] = '';
        else if (k === 'rating') state.rating = 0;
        else state[k].delete(rm.dataset.value);
        update();
        const next = el.chips && el.chips.querySelector('.chip');
        (next || el.results).focus && (next || $('[data-sort]', root) || el.results).focus();
        return;
      }
      if (e.target.closest('[data-filters-clear]')) return clearAll();
      const more = e.target.closest('[data-show-more]');
      if (more) {
        const items = $$('[data-more-item]', more.parentElement);
        const open = more.getAttribute('aria-expanded') !== 'true';
        items.forEach((i) => (i.hidden = !open));
        more.setAttribute('aria-expanded', open ? 'true' : 'false');
        more.textContent = open ? 'Show fewer' : 'Show ' + items.length + ' more';
        return;
      }
      const pg = e.target.closest('[data-goto-page]');
      if (pg && !pg.disabled) {
        state.page = +pg.dataset.gotoPage;
        update({ keepPage: true, skipFilters: true, loading: 300 });
        const top = el.results.getBoundingClientRect().top + window.scrollY - 160;
        window.scrollTo({ top, behavior: M.util.prefersReducedMotion() ? 'auto' : 'smooth' });
        setTimeout(() => { const a = el.results.querySelector('.product-card__title a'); if (a) a.focus({ preventScroll: true }); }, 360);
        return;
      }
      if (e.target.closest('[data-load-more]')) {
        const btn = e.target.closest('[data-load-more]');
        btn.classList.add('is-loading'); btn.disabled = true;
        setTimeout(() => { state.shown += pageSize; renderResults({ append: true }); }, 450);
        return;
      }
      if (e.target.closest('[data-open-filters]')) return openPanel(e.target.closest('[data-open-filters]'));
      if (e.target.closest('[data-close-filters]') || e.target.closest('[data-filters-apply]')) return closePanel();
    });
    if (el.sort) {
      el.sort.innerHTML = SORTS.filter(([v]) => v !== 'relevance' || cfg.relevance !== false).map(([v, l]) => '<option value="' + v + '"' + (state.sort === v ? ' selected' : '') + '>' + l + '</option>').join('');
      el.sort.addEventListener('change', () => { state.sort = el.sort.value; update({ skipFilters: true }); });
    }
    if (el.search) {
      el.search.value = state.q;
      el.search.addEventListener('input', M.util.debounce(() => { state.q = el.search.value.trim(); update(); }, 220));
      const form = el.search.closest('form');
      if (form) form.addEventListener('submit', (e) => { e.preventDefault(); state.q = el.search.value.trim(); update(); });
    }

    /* ---------- mobile filter drawer ---------- */
    let backdrop;
    let opener;
    function onKey(e) { if (e.key === 'Escape') closePanel(); M.trapFocus(el.panel, e); }
    function openPanel(btn) {
      if (!el.panel) return;
      opener = btn;
      backdrop = document.createElement('div');
      backdrop.className = 'drawer-backdrop';
      backdrop.addEventListener('click', closePanel);
      document.body.appendChild(backdrop);
      requestAnimationFrame(() => backdrop.classList.add('is-open'));
      el.panel.classList.add('is-open');
      el.panel.setAttribute('role', 'dialog');
      el.panel.setAttribute('aria-modal', 'true');
      btn.setAttribute('aria-expanded', 'true');
      M.lockScroll(true);
      document.addEventListener('keydown', onKey, true);
      setTimeout(() => { const f = el.panel.querySelector('button, input'); if (f) f.focus(); }, 60);
    }
    function closePanel() {
      if (!el.panel || !el.panel.classList.contains('is-open')) return;
      el.panel.classList.remove('is-open');
      el.panel.removeAttribute('role');
      el.panel.removeAttribute('aria-modal');
      if (backdrop) { const b = backdrop; b.classList.remove('is-open'); setTimeout(() => b.remove(), 250); }
      document.removeEventListener('keydown', onKey, true);
      M.lockScroll(false);
      if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus(); }
    }
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => { if (mq.matches) closePanel(); });

    update({ keepPage: true, loading: cfg.initialLoading === false ? 0 : 420 });

    return {
      state,
      update,
      setQuery(q) { state.q = q; update(); },
      toggle(k, v, only) {
        if (only) state[k].clear();
        if (v) state[k].has(v) && !only ? state[k].delete(v) : state[k].add(v);
        update();
      },
      results: () => current,
    };
  };

  M.listing.SORTS = SORTS;
})((window.Market = window.Market || {}));
