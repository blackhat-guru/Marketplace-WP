/* ==========================================================================
   Templora — application core
   - utilities, storage, session
   - shared shell: announcement, header (mega menu, search, drawer), footer
   - reusable renderers: product card, seller card, rating, price, states
   - UI primitives: toast, dialog/confirm, tabs, accordion, drawers
   - page bootstrapping via <body data-page="…"> → Market.pages[name]()
   ========================================================================== */
(function (M) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Utilities                                                           */
  /* ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ROOT = document.documentElement.getAttribute('data-root') || '';
  const url = (path) => ROOT + path;
  const money = (n) => (n === 0 ? 'Free' : '$' + (Number.isInteger(n) ? n : n.toFixed(2)).toLocaleString('en-US'));
  const moneyExact = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso, opts) => (iso ? new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', opts || { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
  const num = (n) => Number(n).toLocaleString('en-US');
  const qs = (name) => new URLSearchParams(location.search).get(name);
  const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const uid = (p) => (p || 'id') + '-' + Math.random().toString(36).slice(2, 9);
  const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  M.util = { $, $$, esc, url, money, moneyExact, fmtDate, num, qs, slugify, debounce, uid, prefersReducedMotion, wait };

  /* ------------------------------------------------------------------ */
  /* Storage — guarded localStorage (private mode / blocked storage safe) */
  /* ------------------------------------------------------------------ */
  const PREFIX = 'templora.';
  M.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage unavailable: state lives for this page only */ }
    },
    remove(key) { try { localStorage.removeItem(PREFIX + key); } catch (e) { /* noop */ } },
  };

  M.emit = (name, detail) => document.dispatchEvent(new CustomEvent('market:' + name, { detail }));
  M.on = (name, fn) => document.addEventListener('market:' + name, (e) => fn(e.detail));

  /* ------------------------------------------------------------------ */
  /* Simulated session (frontend only — no real authentication)           */
  /* ------------------------------------------------------------------ */
  M.session = {
    get() { return M.store.get('session', null); },
    login(user) { M.store.set('session', Object.assign({ seller: 'none' }, user)); M.emit('session', M.session.get()); },
    update(patch) { const s = M.session.get(); if (s) { M.store.set('session', Object.assign(s, patch)); M.emit('session', s); } },
    logout() { M.store.remove('session'); M.emit('session', null); },
    initials(name) { return String(name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase(); },
  };

  /* ------------------------------------------------------------------ */
  /* Product helpers (read-only view over Market.data)                   */
  /* ------------------------------------------------------------------ */
  const D = () => M.data;
  M.catalog = {
    all() { return D().products.filter((p) => p.status === 'published'); },
    byId(id) { return D().products.find((p) => p.id === id); },
    bySlug(slug) { return D().products.find((p) => p.slug === slug); },
    seller(slug) { return D().sellers.find((s) => s.slug === slug); },
    sellerProducts(slug, includeUnpublished) { return D().products.filter((p) => p.seller === slug && (includeUnpublished || p.status === 'published')); },
    subName(slug) { const s = D().subcategories.find((x) => x.slug === slug); return s ? s.name : slug; },
    techName(t) { return D().technologies[t] || D().tools[t] || t; },
    licenseName(id) { return (D().licenses[id] || {}).name || id; },
    priceFor(p, license) { const l = p.licenses.find((x) => x.id === license); return l ? l.price : p.price; },
    discount(p) { return p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0; },
    productUrl(p) { return url('pages/product-detail.html?slug=' + encodeURIComponent(p.slug)); },
    demoUrl(p) { return p.demoUrl || url('pages/demo.html?slug=' + encodeURIComponent(p.slug)); },
    sellerUrl(slug) { return url('pages/seller-storefront.html?seller=' + encodeURIComponent(slug)); },
    image(path) { return path ? url(path) : null; },
    sellerStats(slug) {
      const items = M.catalog.sellerProducts(slug);
      const rated = items.filter((p) => p.reviewCount > 0);
      const reviews = rated.reduce((a, p) => a + p.reviewCount, 0);
      const avg = reviews ? rated.reduce((a, p) => a + p.rating * p.reviewCount, 0) / reviews : 0;
      return { count: items.length, reviews, rating: Math.round(avg * 10) / 10 };
    },
    recent: {
      push(id) { const list = M.store.get('recent', []).filter((x) => x !== id); list.unshift(id); M.store.set('recent', list.slice(0, 8)); },
      list(exclude) { return M.store.get('recent', []).filter((x) => x !== exclude).map(M.catalog.byId).filter((p) => p && p.status === 'published'); },
    },
  };

  /* ------------------------------------------------------------------ */
  /* Renderers                                                           */
  /* ------------------------------------------------------------------ */
  const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f1f3f6"/><g fill="none" stroke="#a3abb8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(142 70)"><rect x="0" y="0" width="36" height="36" rx="4"/><circle cx="12" cy="12" r="4"/><path d="m36 26-10-10L4 36"/></g><text x="160" y="135" font-family="Arial,sans-serif" font-size="12" fill="#5f6878" text-anchor="middle">Preview not available</text></svg>');
  M.PLACEHOLDER_IMG = PLACEHOLDER_IMG;

  // Graceful fallback for any image that fails to load.
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && !img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.src = PLACEHOLDER_IMG;
      img.alt = img.alt ? img.alt + ' (preview unavailable)' : 'Preview unavailable';
    }
  }, true);

  const R = {};
  R.stars = (rating) => {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      const fill = rating >= i - 0.25 ? 'icon--fill' : '';
      out += M.icon('star', fill);
    }
    return '<span class="rating__stars" aria-hidden="true">' + out + '</span>';
  };
  R.rating = (p, opts) => {
    if (!p.reviewCount) return '<span class="rating"><span class="rating__count">No reviews yet</span></span>';
    const compact = opts && opts.compact;
    return '<span class="rating">' + (compact ? M.icon('star', 'icon--fill icon--sm icon--star') : R.stars(p.rating)) +
      '<span class="rating__value">' + p.rating.toFixed(1) + '</span><span class="sr-only"> out of 5 stars,</span>' +
      '<span class="rating__count">(' + num(p.reviewCount) + '<span class="sr-only"> demo reviews</span>)</span></span>';
  };
  R.price = (p, opts) => {
    const lg = opts && opts.large;
    if (p.price === 0) return '<span class="price' + (lg ? ' price--lg' : '') + '"><span class="price__current price__current--free">Free</span></span>';
    const off = M.catalog.discount(p);
    return '<span class="price' + (lg ? ' price--lg' : '') + '"><span class="price__current">' + money(p.price) + '</span>' +
      (off ? '<span class="price__old"><span class="sr-only">Original price </span>' + money(p.originalPrice) + '</span>' : '') + '</span>';
  };
  R.techBadges = (p, max) => {
    const all = p.tech.map((t) => M.catalog.techName(t)).concat(p.tools.map((t) => M.catalog.techName(t)));
    const shown = all.slice(0, max || 3);
    const more = all.length - shown.length;
    return '<ul class="tech-badges" aria-label="Technologies">' + shown.map((t) => '<li class="tech-badge">' + esc(t) + '</li>').join('') +
      (more > 0 ? '<li class="tech-badge" aria-label="' + more + ' more">+' + more + '</li>' : '') + '</ul>';
  };
  R.contextBadge = (p, ctx) => {
    if (ctx === 'trending' && p.flags.trending) return '<span class="badge badge--trending">' + M.icon('trending') + 'Trending</span>';
    if (ctx === 'bestseller' && p.flags.bestseller) return '<span class="badge badge--premium">' + M.icon('award') + 'Best seller</span>';
    if (ctx === 'new' && p.flags.new) return '<span class="badge badge--new">New</span>';
    return '';
  };

  /** Reusable product card. Accepts any product object with the data.js shape. */
  R.productCard = (p, opts) => {
    opts = opts || {};
    const h = opts.headingLevel || 3;
    const seller = M.catalog.seller(p.seller) || { name: 'Unknown seller', slug: '' };
    const off = M.catalog.discount(p);
    const wished = M.wishlist && M.wishlist.has(p.id);
    const img = M.catalog.image(p.images.main);
    const badges = [
      p.price === 0 ? '<span class="badge badge--free">Free</span>' : '',
      off ? '<span class="badge badge--sale">' + off + '% off</span>' : '',
      R.contextBadge(p, opts.context),
    ].join('');
    return '<article class="product-card" data-product-id="' + esc(p.id) + '"' + (opts.reveal ? ' data-reveal' : '') + '>' +
      '<div class="product-card__media">' +
        '<img src="' + esc(img || PLACEHOLDER_IMG) + '" alt="' + esc(p.shortName) + ' template homepage preview" width="1440" height="900" loading="' + (opts.eager ? 'eager' : 'lazy') + '" decoding="async">' +
        (badges ? '<div class="product-card__badges">' + badges + '</div>' : '') +
        '<button type="button" class="product-card__wish" data-wishlist-toggle="' + esc(p.id) + '" aria-pressed="' + (wished ? 'true' : 'false') + '" aria-label="' + (wished ? 'Remove ' : 'Save ') + esc(p.shortName) + (wished ? ' from' : ' to') + ' wishlist">' + M.icon('heart') + '</button>' +
      '</div>' +
      '<div class="product-card__body">' +
        '<p class="product-card__cat">' + esc(M.catalog.subName(p.subcategory)) + '</p>' +
        '<h' + h + ' class="product-card__title"><a href="' + M.catalog.productUrl(p) + '">' + esc(p.name) + '</a></h' + h + '>' +
        R.techBadges(p, 3) +
        '<div class="product-card__meta">' +
          '<p class="product-card__seller">by <a href="' + M.catalog.sellerUrl(seller.slug) + '">' + esc(seller.name) + '</a></p>' +
          R.rating(p, { compact: true }) +
        '</div>' +
        (opts.showSales ? '<p class="product-card__sales">' + num(p.sales) + ' sales <span class="badge badge--demo" style="height:18px">sample data</span></p>' : '') +
        '<div class="product-card__footer">' + R.price(p) +
          '<div class="product-card__actions"><a class="product-card__demo" href="' + M.catalog.demoUrl(p) + '" aria-label="Live demo of ' + esc(p.shortName) + '">' + M.icon('eye') + 'Live demo</a></div>' +
        '</div>' +
      '</div></article>';
  };

  R.skeletonCards = (n) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      out += '<div class="skeleton-card" aria-hidden="true"><div class="skeleton skeleton-card__media"></div><div class="skeleton-card__body">' +
        '<div class="skeleton skeleton-line" style="width:40%"></div><div class="skeleton skeleton-line" style="width:85%;height:14px"></div>' +
        '<div class="skeleton skeleton-line" style="width:60%"></div><div class="skeleton skeleton-line" style="width:30%;margin-top:10px"></div></div></div>';
    }
    return out;
  };

  R.emptyState = (o) =>
    '<div class="empty-state' + (o.error ? ' empty-state--error' : '') + '"' + (o.role ? ' role="' + o.role + '"' : '') + '>' +
      '<div class="empty-state__icon">' + M.icon(o.icon || 'search') + '</div>' +
      '<h' + (o.level || 2) + ' class="empty-state__title">' + esc(o.title) + '</h' + (o.level || 2) + '>' +
      (o.desc ? '<p class="empty-state__desc">' + o.desc + '</p>' : '') +
      (o.actions ? '<div class="empty-state__actions">' + o.actions + '</div>' : '') +
    '</div>';

  R.sellerCard = (s, opts) => {
    const st = M.catalog.sellerStats(s.slug);
    const h = (opts && opts.headingLevel) || 3;
    return '<article class="seller-card"' + (opts && opts.reveal ? ' data-reveal' : '') + '>' +
      '<div class="seller-card__head"><img class="seller-card__logo" src="' + url(s.logo) + '" alt="" width="52" height="52" loading="lazy">' +
      '<div><h' + h + ' class="seller-card__name">' + esc(s.name) + '</h' + h + '><p class="text-muted" style="font-size:var(--text-meta)">' + esc(s.location) + '</p></div></div>' +
      '<p class="seller-card__desc">' + esc(s.tagline) + '</p>' +
      '<div class="seller-card__stats"><span><strong>' + st.count + '</strong> products</span>' +
      (st.reviews ? '<span>' + M.icon('star', 'icon--fill icon--sm icon--star icon--inline') + ' <strong>' + st.rating.toFixed(1) + '</strong> avg (demo)</span>' : '') + '</div>' +
      '<a class="btn btn--sm" href="' + M.catalog.sellerUrl(s.slug) + '" style="align-self:flex-start">View store<span class="sr-only">: ' + esc(s.name) + '</span>' + M.icon('arrow-right', 'icon--sm') + '</a>' +
    '</article>';
  };

  R.breadcrumbs = (items) =>
    '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>' +
    items.map((it, i) => '<li>' + (i === items.length - 1 ? '<span aria-current="page">' + esc(it.label) + '</span>' : '<a href="' + it.href + '">' + esc(it.label) + '</a>') + '</li>').join('') +
    '</ol></nav>';

  /** JSON-LD structured-data integration point. */
  R.jsonLd = (obj) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  };
  R.breadcrumbLd = (items) => R.jsonLd({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: it.href ? new URL(it.href, location.href).href : undefined })),
  });

  M.render = R;

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  let toastRegion;
  M.toast = function (o) {
    if (typeof o === 'string') o = { title: o };
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('aria-live', 'polite');
      toastRegion.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(toastRegion);
    }
    const type = o.type || 'success';
    const el = document.createElement('div');
    el.className = 'toast toast--' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const ic = { success: 'check-circle', error: 'alert-circle', info: 'info' }[type];
    el.innerHTML = '<span class="toast__icon">' + M.icon(ic) + '</span><div class="toast__body"><p class="toast__title">' + esc(o.title) + '</p>' +
      (o.desc ? '<p class="toast__desc">' + esc(o.desc) + '</p>' : '') +
      (o.action ? '<a class="toast__action" href="' + o.action.href + '">' + esc(o.action.label) + '</a>' : '') +
      '</div><button type="button" class="toast__close" aria-label="Dismiss notification">' + M.icon('x', 'icon--sm') + '</button>';
    toastRegion.appendChild(el);
    const close = () => {
      if (!el.isConnected) return;
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), prefersReducedMotion() ? 0 : 200);
    };
    el.querySelector('.toast__close').addEventListener('click', close);
    let timer = setTimeout(close, o.duration || 5000);
    el.addEventListener('mouseenter', () => clearTimeout(timer));
    el.addEventListener('mouseleave', () => { timer = setTimeout(close, 2500); });
    while (toastRegion.children.length > 3) toastRegion.firstElementChild.remove();
    return close;
  };

  /* ------------------------------------------------------------------ */
  /* Focus management & dialogs                                          */
  /* ------------------------------------------------------------------ */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  M.trapFocus = trapFocus;
  let lockCount = 0;
  M.lockScroll = (on) => {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', lockCount > 0);
    if (M.motion) M.motion[lockCount > 0 ? 'pause' : 'resume']();
  };

  /**
   * Generic modal dialog. Returns { el, close, done } — `done` resolves with the
   * value of the action clicked (or null when dismissed).
   */
  M.dialog = function (o) {
    const id = uid('dlg');
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = '<div class="modal__backdrop" data-dismiss></div>' +
      '<div class="modal__dialog' + (o.size ? ' modal__dialog--' + o.size : '') + '" role="' + (o.alert ? 'alertdialog' : 'dialog') + '" aria-modal="true" aria-labelledby="' + id + '-t"' + (o.desc !== false ? ' aria-describedby="' + id + '-b"' : '') + ' tabindex="-1">' +
        '<div class="modal__head"><div>' + (o.icon ? '<div class="modal__icon modal__icon--' + (o.tone || 'info') + '">' + M.icon(o.icon) + '</div>' : '') +
        '<h2 class="modal__title" id="' + id + '-t">' + esc(o.title) + '</h2></div>' +
        '<button type="button" class="icon-btn" data-dismiss aria-label="Close dialog">' + M.icon('x') + '</button></div>' +
        '<div class="modal__body" id="' + id + '-b">' + (o.body || '') + '</div>' +
        (o.actions && o.actions.length ? '<div class="modal__foot">' + o.actions.map((a, i) => '<button type="' + (a.submit ? 'submit' : 'button') + '" class="btn ' + (a.variant ? 'btn--' + a.variant : '') + '" data-action="' + i + '"' + (a.form ? ' form="' + a.form + '"' : '') + '>' + esc(a.label) + '</button>').join('') + '</div>' : '') +
      '</div>';
    const opener = document.activeElement;
    document.body.appendChild(wrap);
    M.lockScroll(true);
    const dlg = wrap.querySelector('.modal__dialog');
    let resolve;
    const done = new Promise((r) => (resolve = r));
    const onKey = (e) => {
      if (e.key === 'Escape' && o.dismissible !== false) { e.preventDefault(); close(null); }
      trapFocus(dlg, e);
      if (o.onKey) o.onKey(e);
    };
    function close(value) {
      if (!wrap.isConnected) return;
      document.removeEventListener('keydown', onKey, true);
      wrap.remove();
      M.lockScroll(false);
      if (opener && opener.focus && document.contains(opener)) opener.focus();
      resolve(value);
      if (o.onClose) o.onClose(value);
    }
    wrap.addEventListener('click', (e) => {
      const d = e.target.closest('[data-dismiss]');
      if (d && o.dismissible !== false) return close(null);
      const a = e.target.closest('[data-action]');
      if (a) {
        const action = o.actions[+a.dataset.action];
        if (action.submit) return; // handled by the form's submit
        if (action.onClick) { const r = action.onClick(close, a); if (r === false) return; }
        close(action.value !== undefined ? action.value : action.label);
      }
    });
    document.addEventListener('keydown', onKey, true);
    M.hydrateIcons(wrap);
    if (M.motion) M.motion.dialogIn(dlg);
    const focusTarget = (o.initialFocus && dlg.querySelector(o.initialFocus)) || dlg.querySelector('input, select, textarea') || dlg.querySelector('[data-action]:last-child') || dlg;
    requestAnimationFrame(() => focusTarget.focus());
    if (o.onOpen) o.onOpen(wrap, close);
    return { el: wrap, dialog: dlg, close, done };
  };

  M.confirm = (o) => M.dialog({
    title: o.title, body: '<p>' + o.body + '</p>', icon: o.icon || (o.danger ? 'alert' : 'info'), tone: o.danger ? 'danger' : 'info', alert: true,
    actions: [{ label: o.cancelLabel || 'Cancel', value: false }, { label: o.confirmLabel || 'Confirm', variant: o.danger ? 'danger-solid' : 'primary', value: true }],
  }).done.then((v) => v === true);

  /** Demo-only notice for actions that need a backend. */
  M.demoNotice = (title, body) => M.dialog({
    title, icon: 'info', tone: 'info',
    body: '<p>' + body + '</p><p class="demo-note" style="margin-top:12px">' + M.icon('alert') + 'Frontend prototype — no data leaves your browser.</p>',
    actions: [{ label: 'Got it', variant: 'primary' }],
  });

  /* ------------------------------------------------------------------ */
  /* Tabs (WAI-ARIA tabs pattern, automatic activation)                  */
  /* ------------------------------------------------------------------ */
  M.initTabs = function (root) {
    $$('[data-tabs]', root).forEach((tabs) => {
      if (tabs.dataset.tabsReady) return;
      tabs.dataset.tabsReady = '1';
      const list = $('[role="tablist"]', tabs);
      const btns = $$('[role="tab"]', list);
      const select = (btn, focus) => {
        btns.forEach((b) => {
          const on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
        if (focus) btn.focus();
        tabs.dispatchEvent(new CustomEvent('tabchange', { detail: btn.id }));
      };
      btns.forEach((b, i) => {
        b.addEventListener('click', () => select(b));
        b.addEventListener('keydown', (e) => {
          let n = null;
          if (e.key === 'ArrowRight') n = btns[(i + 1) % btns.length];
          if (e.key === 'ArrowLeft') n = btns[(i - 1 + btns.length) % btns.length];
          if (e.key === 'Home') n = btns[0];
          if (e.key === 'End') n = btns[btns.length - 1];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
      tabs.selectTab = (id) => { const b = btns.find((x) => x.id === id); if (b) select(b); };
    });
  };

  /* ------------------------------------------------------------------ */
  /* Accordions / disclosure: [data-accordion] > button[aria-controls]   */
  /* ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-disclosure]');
    if (!t) return;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    const open = t.getAttribute('aria-expanded') !== 'true';
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.hidden = !open;
  });
  R.accordion = (items, opts) => {
    const id = uid('acc');
    const h = (opts && opts.headingLevel) || 3;
    return '<div class="accordion">' + items.map((it, i) =>
      '<div class="accordion__item"><h' + h + ' style="font-size:inherit;margin:0"><button type="button" class="accordion__trigger" data-disclosure aria-expanded="' + (it.open ? 'true' : 'false') + '" aria-controls="' + id + '-' + i + '" id="' + id + '-h' + i + '">' +
      '<span>' + esc(it.q) + '</span>' + M.icon('chevron-down') + '</button></h' + h + '>' +
      '<div class="accordion__panel" id="' + id + '-' + i + '" role="region" aria-labelledby="' + id + '-h' + i + '"' + (it.open ? '' : ' hidden') + '>' + it.a + '</div></div>').join('') + '</div>';
  };

  /* ------------------------------------------------------------------ */
  /* Shell: announcement, header, mega menu, drawer, footer              */
  /* ------------------------------------------------------------------ */
  const LOGO = '<svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0e1116"/><rect x="7" y="8" width="18" height="4.2" rx="2.1" fill="#fff"/><rect x="13.9" y="8" width="4.2" height="16" rx="2.1" fill="#fff"/><circle cx="23" cy="22" r="3" fill="#6b84ff"/></svg>';
  M.LOGO = LOGO;

  function headerHTML() {
    const cats = D().categories;
    const navKey = document.body.getAttribute('data-nav') || '';
    const session = M.session.get();
    const group = (g) => cats.filter((c) => c.group === g).map((c) =>
      '<li><a class="mega__link" href="' + url(c.route) + '"><span class="mega__name">' + esc(c.name) + (c.live ? '' : ' <span class="badge" style="height:18px;font-size:10px">Soon</span>') + '</span><span class="mega__desc">' + esc(c.desc) + '</span></a></li>').join('');
    const featured = M.catalog.bySlug('nova');
    const catLinks = [
      ['html', 'HTML Templates', 'pages/html-templates.html'],
      ['tailwind', 'Tailwind CSS', 'pages/html-templates.html?tech=tailwind'],
      ['bootstrap', 'Bootstrap', 'pages/html-templates.html?tech=bootstrap'],
      ['landing', 'Landing Pages', 'pages/html-templates.html?sub=landing'],
      ['saas', 'SaaS', 'pages/html-templates.html?sub=saas'],
      ['portfolio', 'Portfolio', 'pages/html-templates.html?sub=portfolio'],
      ['ecommerce', 'E-commerce', 'pages/html-templates.html?sub=ecommerce'],
      ['admin', 'Admin Dashboards', 'pages/html-templates.html?sub=admin'],
      ['free', 'Free Templates', 'pages/html-templates.html?price=free'],
    ];
    const auth = session
      ? '<div style="position:relative"><button type="button" class="btn btn--ghost" id="account-trigger" aria-expanded="false" aria-controls="account-menu" style="padding:0 8px 0 4px"><span class="avatar">' + esc(M.session.initials(session.name)) + '</span><span class="sr-only">Account menu for </span>' + esc(session.name.split(' ')[0]) + M.icon('chevron-down', 'icon--sm') + '</button>' +
        '<div class="menu" id="account-menu" hidden>' +
          '<a class="menu__item" href="' + url('pages/account.html#overview') + '">' + M.icon('user') + 'My account</a>' +
          '<a class="menu__item" href="' + url('pages/account.html#orders') + '">' + M.icon('receipt') + 'Orders</a>' +
          '<a class="menu__item" href="' + url('pages/account.html#downloads') + '">' + M.icon('download') + 'Downloads</a>' +
          (session.seller === 'approved'
            ? '<a class="menu__item" href="' + url('pages/seller-dashboard.html') + '">' + M.icon('store') + 'Seller dashboard</a>'
            : '<a class="menu__item" href="' + url('pages/seller-onboarding.html') + '">' + M.icon('store') + (session.seller === 'none' ? 'Become a seller' : 'Seller application') + '</a>') +
          '<div class="menu__sep"></div><button type="button" class="menu__item" data-logout>' + M.icon('log-out') + 'Log out</button>' +
        '</div></div>'
      : '<a class="btn btn--ghost" href="' + url('pages/login.html') + '">Log in</a><a class="btn btn--dark" href="' + url('pages/register.html') + '">Sign up</a>';

    return '<a class="skip-link" href="#main">Skip to main content</a>' + announcementHTML() +
      '<header class="site-header" id="site-header">' +
        '<div class="container site-header__bar">' +
          '<button type="button" class="icon-btn hide-desktop" data-open-drawer="nav-drawer" aria-label="Open menu" aria-expanded="false" aria-controls="nav-drawer" style="margin-left:-10px">' + M.icon('menu') + '</button>' +
          '<a class="logo" href="' + url('index.html') + '" aria-label="Templora home">' + LOGO + '<span>Templora</span></a>' +
          '<div class="site-header__browse"><button type="button" class="nav-trigger" id="mega-trigger" aria-expanded="false" aria-controls="mega-menu">' + M.icon('grid', 'icon--sm') + 'Browse templates' + M.icon('chevron-down', 'icon--chev') + '</button></div>' +
          '<form class="site-header__search search-field" role="search" action="' + url('pages/search.html') + '" data-search-form>' +
            '<label class="sr-only" for="header-search">Search templates</label>' +
            '<span class="search-field__icon">' + M.icon('search') + '</span>' +
            '<input class="search-field__input" id="header-search" type="search" name="q" placeholder="Search website templates..." autocomplete="off" value="' + esc(document.body.dataset.page === 'search' ? qs('q') || '' : '') + '">' +
            '<kbd class="search-field__kbd" aria-hidden="true">/</kbd>' +
          '</form>' +
          '<div class="site-header__actions">' +
            '<button type="button" class="icon-btn hide-desktop" data-open-search aria-label="Search templates">' + M.icon('search') + '</button>' +
            '<a class="icon-btn hide-mobile" href="' + url('pages/wishlist.html') + '" aria-label="Wishlist"' + (navKey === 'wishlist' ? ' aria-current="page"' : '') + '>' + M.icon('heart') + '<span class="count-badge" data-wishlist-count data-count="0" aria-hidden="true">0</span><span class="sr-only" data-wishlist-count-sr></span></a>' +
            '<a class="icon-btn" href="' + url('pages/cart.html') + '" aria-label="Cart"' + (navKey === 'cart' ? ' aria-current="page"' : '') + '>' + M.icon('cart') + '<span class="count-badge" data-cart-count data-count="0" aria-hidden="true">0</span><span class="sr-only" data-cart-count-sr></span></a>' +
            '<div class="site-header__auth">' + auth + '</div>' +
          '</div>' +
        '</div>' +
        '<nav class="catnav" aria-label="Template categories"><div class="container" style="display:flex;align-items:center;gap:16px">' +
          '<ul class="catnav__list" style="flex:1">' + catLinks.map(([k, label, href]) => '<li><a class="catnav__link" href="' + url(href) + '"' + (navKey === k ? ' aria-current="page"' : '') + '>' + label + '</a></li>').join('') + '</ul>' +
          '<a class="catnav__link" href="' + url('pages/seller-onboarding.html') + '" style="color:var(--color-primary);gap:6px"' + (navKey === 'sell' ? ' aria-current="page"' : '') + '>' + M.icon('store', 'icon--sm') + 'Become a Seller</a>' +
        '</div></nav>' +
        '<div class="mega" id="mega-menu" hidden><div class="container">' +
          '<div class="mega__inner">' +
            '<div><p class="mega__heading" id="mega-h1">Website Templates</p><ul class="mega__list" aria-labelledby="mega-h1">' + group('website') + '</ul></div>' +
            '<div><p class="mega__heading" id="mega-h2">Frameworks &amp; Platforms</p><ul class="mega__list" aria-labelledby="mega-h2">' + group('framework') + '</ul></div>' +
            '<div><p class="mega__heading" id="mega-h3">Other Assets</p><ul class="mega__list" aria-labelledby="mega-h3">' + group('other') + '</ul></div>' +
            (featured ? '<div class="mega__feature"><p class="mega__heading" style="padding:0;margin:0">Featured template</p><img src="' + url(featured.images.main) + '" alt="" width="1440" height="900" loading="lazy"><div><p style="font-weight:600;font-size:var(--text-sm)">' + esc(featured.name) + '</p><p class="text-muted" style="font-size:var(--text-xs)">' + esc(featured.summary) + '</p></div><a class="btn btn--sm" href="' + M.catalog.productUrl(featured) + '">View template</a></div>' : '') +
          '</div>' +
          '<div class="mega__footer"><span class="text-muted">' + M.catalog.all().length + ' sample templates in the HTML catalogue · other categories open soon</span><a class="link" href="' + url('pages/html-templates.html') + '">Browse all HTML templates →</a></div>' +
        '</div></div>' +
      '</header>' + drawerHTML(session);
  }

  function announcementHTML() {
    const a = D().announcement;
    if (!a || M.store.get('announce-dismissed') === a.id || document.body.hasAttribute('data-no-announcement')) return '';
    return '<div class="announcement" id="announcement" role="region" aria-label="Announcement"><div class="container announcement__inner"><p>' + esc(a.text) + (a.link ? ' <a href="' + url(a.link.href) + '">' + esc(a.link.label) + '</a>' : '') + '</p>' +
      '<button type="button" class="announcement__close" data-dismiss-announcement aria-label="Dismiss announcement">' + M.icon('x', 'icon--sm') + '</button></div></div>';
  }

  function drawerHTML(session) {
    const cats = D().categories.filter((c) => c.live);
    return '<div class="drawer-backdrop" data-drawer-backdrop="nav-drawer" hidden></div>' +
      '<div class="drawer drawer--left" id="nav-drawer" role="dialog" aria-modal="true" aria-label="Site menu" hidden>' +
        '<div class="drawer__head"><a class="logo" href="' + url('index.html') + '">' + LOGO + '<span>Templora</span></a><button type="button" class="icon-btn" data-close-drawer aria-label="Close menu">' + M.icon('x') + '</button></div>' +
        '<div class="drawer__body"><nav aria-label="Mobile">' +
          '<ul class="drawer-nav">' +
            '<li><a class="drawer-nav__link" href="' + url('pages/html-templates.html') + '">Browse HTML templates' + M.icon('chevron-right') + '</a></li>' +
            '<li><a class="drawer-nav__link" href="' + url('pages/wishlist.html') + '">Wishlist <span class="badge" data-wishlist-count-text>0</span></a></li>' +
            '<li><a class="drawer-nav__link" href="' + url('pages/cart.html') + '">Cart <span class="badge" data-cart-count-text>0</span></a></li>' +
            '<li><a class="drawer-nav__link" href="' + url('pages/seller-onboarding.html') + '" style="color:var(--color-primary)">Become a Seller' + M.icon('store') + '</a></li>' +
          '</ul>' +
          '<p class="drawer-nav__group">Categories</p><ul class="drawer-nav" style="list-style:none">' +
            cats.map((c) => '<li><a class="drawer-nav__sub" href="' + url(c.route) + '">' + esc(c.name) + '</a></li>').join('') +
          '</ul>' +
          '<p class="drawer-nav__group">Help</p><ul style="list-style:none;margin:0;padding:0">' +
            '<li><a class="drawer-nav__sub" href="' + url('pages/help.html') + '">Help Center</a></li>' +
            '<li><a class="drawer-nav__sub" href="' + url('pages/about.html') + '">About</a></li>' +
            '<li><a class="drawer-nav__sub" href="' + url('pages/contact.html') + '">Contact</a></li>' +
          '</ul>' +
        '</nav></div>' +
        '<div class="drawer__foot">' + (session
          ? '<a class="btn btn--block" href="' + url('pages/account.html') + '">' + M.icon('user') + 'My account</a><button type="button" class="btn btn--ghost btn--block" data-logout>Log out</button>'
          : '<a class="btn btn--dark btn--block" href="' + url('pages/register.html') + '">Sign up</a><a class="btn btn--block" href="' + url('pages/login.html') + '">Log in</a>') + '</div>' +
      '</div>';
  }

  function footerHTML() {
    const col = (title, links) => '<div><h2 class="site-footer__heading">' + title + '</h2><ul class="site-footer__list">' + links.map(([l, h]) => '<li><a href="' + url(h) + '">' + l + '</a></li>').join('') + '</ul></div>';
    return '<footer class="site-footer"><div class="container">' +
      '<div class="site-footer__top">' +
        '<div class="site-footer__brand"><a class="logo logo--inverse" href="' + url('index.html') + '">' + LOGO.replace('#0e1116', '#2a303b') + '<span>Templora</span></a>' +
          '<p>A curated marketplace for website templates from independent designers and developers. Preview every page, read the license, then build.</p></div>' +
        col('Browse', [['HTML Templates', 'pages/html-templates.html'], ['Tailwind CSS', 'pages/html-templates.html?tech=tailwind'], ['Bootstrap', 'pages/html-templates.html?tech=bootstrap'], ['Landing Pages', 'pages/html-templates.html?sub=landing'], ['Admin Dashboards', 'pages/html-templates.html?sub=admin'], ['Free Templates', 'pages/html-templates.html?price=free']]) +
        col('For buyers', [['Help Center', 'pages/help.html'], ['Licenses explained', 'pages/help.html#licenses'], ['My account', 'pages/account.html'], ['Wishlist', 'pages/wishlist.html'], ['Refund Policy', 'pages/legal.html?doc=refund']]) +
        col('For sellers', [['Become a Seller', 'pages/seller-onboarding.html'], ['Seller dashboard', 'pages/seller-dashboard.html'], ['Submit a product', 'pages/add-product.html'], ['Earnings & payouts', 'pages/help.html#earnings'], ['Seller Agreement', 'pages/legal.html?doc=seller']]) +
        col('Company', [['About', 'pages/about.html'], ['Contact', 'pages/contact.html'], ['Terms', 'pages/legal.html?doc=terms'], ['Privacy', 'pages/legal.html?doc=privacy'], ['License Agreement', 'pages/legal.html?doc=license'], ['Copyright & DMCA', 'pages/legal.html?doc=dmca']]) +
      '</div>' +
      '<div class="site-footer__news"><div><h2>Get new templates in your inbox</h2><p style="margin-top:6px">One short email when notable templates are published. No spam; unsubscribe anytime.</p></div>' +
        '<form class="form" data-newsletter novalidate style="gap:12px">' +
          '<div class="field"><label class="label" for="nl-email">Email address</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="input" style="flex:1;min-width:200px" id="nl-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required aria-describedby="nl-email-err"><button class="btn btn--inverse" type="submit">Subscribe</button></div>' +
          '<p class="field-error" id="nl-email-err">' + M.icon('alert-circle') + '<span></span></p></div>' +
          '<label class="check"><input type="checkbox" name="consent" required aria-describedby="nl-consent-err"><span>I agree to receive marketing emails and accept the <a href="' + url('pages/legal.html?doc=privacy') + '" style="color:#fff">Privacy Policy</a>.</span></label>' +
          '<p class="field-error" id="nl-consent-err">' + M.icon('alert-circle') + '<span></span></p>' +
        '</form></div>' +
      '<div class="site-footer__bottom"><p>© 2026 Templora. Frontend prototype — all products, sellers, prices and ratings are sample data.</p>' +
        '<ul class="social" aria-label="Social media (placeholder links)">' +
          [['twitter', 'X', 'https://x.com'], ['github', 'GitHub', 'https://github.com'], ['dribbble', 'Dribbble', 'https://dribbble.com'], ['linkedin', 'LinkedIn', 'https://www.linkedin.com']].map(([i, n, h]) => '<li><a href="' + h + '" target="_blank" rel="noopener" aria-label="Templora on ' + n + ' (placeholder, opens in new tab)">' + M.icon(i) + '</a></li>').join('') +
        '</ul></div>' +
    '</div></footer>';
  }

  /* ---------- Header behaviour ---------- */
  function initHeader() {
    const trigger = $('#mega-trigger');
    const mega = $('#mega-menu');
    if (trigger && mega) {
      const setOpen = (open, focusFirst) => {
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        mega.hidden = !open;
        if (open && M.motion) M.motion.dropdownIn(mega.firstElementChild);
        if (open && focusFirst) { const f = $('.mega__link', mega); if (f) f.focus(); }
      };
      trigger.addEventListener('click', () => setOpen(mega.hidden));
      trigger.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true, true); } });
      mega.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { setOpen(false); trigger.focus(); }
        const links = $$('.mega__link', mega);
        const i = links.indexOf(document.activeElement);
        if (i > -1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus(); }
      });
      document.addEventListener('click', (e) => { if (!mega.hidden && !mega.contains(e.target) && !trigger.contains(e.target)) setOpen(false); });
      mega.addEventListener('focusout', (e) => { if (e.relatedTarget && !mega.contains(e.relatedTarget) && e.relatedTarget !== trigger) setOpen(false); });
    }

    // Account dropdown (menu button)
    const at = $('#account-trigger');
    const am = $('#account-menu');
    if (at && am) {
      const setOpen = (open) => {
        at.setAttribute('aria-expanded', open ? 'true' : 'false'); am.hidden = !open;
        if (open) { const f = $('.menu__item', am); if (f) f.focus(); }
      };
      at.addEventListener('click', () => setOpen(am.hidden));
      am.addEventListener('keydown', (e) => {
        const items = $$('.menu__item', am);
        const i = items.indexOf(document.activeElement);
        if (e.key === 'Escape') { setOpen(false); at.focus(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus(); }
      });
      document.addEventListener('click', (e) => { if (!am.hidden && !am.contains(e.target) && !at.contains(e.target)) setOpen(false); });
    }

    // "/" focuses search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        const s = $('#header-search');
        if (s && s.offsetParent) { e.preventDefault(); s.focus(); }
      }
    });

    // Announcement dismiss
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-dismiss-announcement]')) {
        M.store.set('announce-dismissed', D().announcement.id);
        const el = $('#announcement'); if (el) el.remove();
        const s = $('#header-search') || $('.logo'); if (s) s.focus();
      }
      if (e.target.closest('[data-logout]')) {
        M.session.logout();
        M.toast({ title: 'You have been logged out', desc: 'Demo session cleared from this browser.', type: 'info' });
        setTimeout(() => (location.href = url('index.html')), 600);
      }
    });

    // Mobile search overlay
    const openSearch = $('[data-open-search]');
    if (openSearch) openSearch.addEventListener('click', () => openSearchOverlay(openSearch));

    if (M.search) $$('[data-search-form]').forEach((f) => M.search.attach(f));
  }

  function openSearchOverlay(opener) {
    const wrap = document.createElement('div');
    wrap.className = 'search-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Search templates');
    wrap.innerHTML = '<div class="search-overlay__bar"><form class="search-field" role="search" action="' + url('pages/search.html') + '" data-search-form data-suggest-inline>' +
      '<label class="sr-only" for="overlay-search">Search templates</label><span class="search-field__icon">' + M.icon('search') + '</span>' +
      '<input class="search-field__input" id="overlay-search" type="search" name="q" placeholder="Search website templates..." autocomplete="off" enterkeyhint="search"></form>' +
      '<button type="button" class="btn btn--ghost" data-close>Cancel</button></div><div class="search-overlay__body" data-suggest-host></div>';
    document.body.appendChild(wrap);
    M.lockScroll(true);
    const close = () => { wrap.remove(); M.lockScroll(false); document.removeEventListener('keydown', onKey, true); opener.focus(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); trapFocus(wrap, e); };
    document.addEventListener('keydown', onKey, true);
    wrap.querySelector('[data-close]').addEventListener('click', close);
    if (M.search) M.search.attach(wrap.querySelector('form'), { host: wrap.querySelector('[data-suggest-host]'), alwaysOpen: true });
    wrap.querySelector('input').focus();
  }

  /* ---------- Drawers (nav drawer + any [data-drawer]) ---------- */
  M.drawer = {
    open(id, opener) {
      const d = document.getElementById(id);
      const bd = document.querySelector('[data-drawer-backdrop="' + id + '"]');
      if (!d) return;
      d.hidden = false; if (bd) bd.hidden = false;
      d._opener = opener || document.activeElement;
      if (d._opener && d._opener.setAttribute) d._opener.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => { d.classList.add('is-open'); if (bd) bd.classList.add('is-open'); });
      M.lockScroll(true);
      d._onKey = (e) => { if (e.key === 'Escape') M.drawer.close(id); trapFocus(d, e); };
      document.addEventListener('keydown', d._onKey, true);
      setTimeout(() => { const f = $(FOCUSABLE, d); if (f) f.focus(); }, 50);
    },
    close(id) {
      const d = document.getElementById(id);
      const bd = document.querySelector('[data-drawer-backdrop="' + id + '"]');
      if (!d || d.hidden) return;
      d.classList.remove('is-open'); if (bd) bd.classList.remove('is-open');
      document.removeEventListener('keydown', d._onKey, true);
      M.lockScroll(false);
      setTimeout(() => { d.hidden = true; if (bd) bd.hidden = true; }, prefersReducedMotion() ? 0 : 300);
      if (d._opener && d._opener.setAttribute) { d._opener.setAttribute('aria-expanded', 'false'); d._opener.focus(); }
    },
  };
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open-drawer]');
    if (o) return M.drawer.open(o.getAttribute('data-open-drawer'), o);
    const c = e.target.closest('[data-close-drawer]');
    if (c) { const d = c.closest('.drawer'); if (d) M.drawer.close(d.id); }
    const bd = e.target.closest('[data-drawer-backdrop]');
    if (bd) M.drawer.close(bd.getAttribute('data-drawer-backdrop'));
  });

  /* ---------- Counts (wishlist + cart) ---------- */
  function updateCounts() {
    const w = M.wishlist ? M.wishlist.ids().length : 0;
    const c = M.cart ? M.cart.count() : 0;
    $$('[data-wishlist-count]').forEach((el) => { el.textContent = w; el.dataset.count = w; });
    $$('[data-cart-count]').forEach((el) => { el.textContent = c; el.dataset.count = c; });
    $$('[data-wishlist-count-text]').forEach((el) => { el.textContent = w; if (el.classList.contains('app-nav__badge')) el.hidden = !w; });
    $$('[data-cart-count-text]').forEach((el) => (el.textContent = c));
    $$('[data-wishlist-count-sr]').forEach((el) => (el.textContent = ', ' + w + ' saved'));
    $$('[data-cart-count-sr]').forEach((el) => (el.textContent = ', ' + c + (c === 1 ? ' item' : ' items')));
  }
  M.updateCounts = updateCounts;

  /* ---------- Newsletter (shared footer) ---------- */
  function initNewsletter() {
    $$('[data-newsletter]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!M.forms || !M.forms.validate(form)) return;
        const btn = form.querySelector('[type="submit"]');
        btn.classList.add('is-loading'); btn.disabled = true;
        await wait(700);
        btn.classList.remove('is-loading'); btn.disabled = false;
        form.reset();
        M.toast({ title: 'Subscription simulated', desc: 'Demo only — your email was not stored or sent anywhere.' });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  M.pages = M.pages || {};
  function boot() {
    const h = $('[data-include="header"]');
    if (h) h.outerHTML = headerHTML();
    const f = $('[data-include="footer"]');
    if (f) f.outerHTML = footerHTML();
    M.hydrateIcons();
    initHeader();
    initNewsletter();
    updateCounts();
    M.on('wishlist', updateCounts);
    M.on('cart', updateCounts);
    if (M.forms) M.forms.init(document);
    const page = document.body.getAttribute('data-page');
    try {
      if (page && M.pages[page]) M.pages[page]();
    } catch (err) {
      console.error('[Templora] page init failed:', err);
      M.toast({ type: 'error', title: 'Something went wrong loading this page', desc: 'Please refresh. (Prototype error — see console.)' });
    }
    M.hydrateIcons();
    M.initTabs(document);
    if (M.motion) M.motion.init();
    document.documentElement.classList.add('is-ready');
  }
  // Deferred scripts run while readyState is "interactive", before DOMContentLoaded,
  // so wait for the event unless the document has fully loaded already.
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})((window.Market = window.Market || {}));
