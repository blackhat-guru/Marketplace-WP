/* Live demo frame. When a seller supplies demoUrl it is linked directly; until
   then this placeholder shows the preview screenshots inside device frames. */
(function (M) {
  'use strict';
  M.pages.demo = function () {
    const { $, url, esc, money, qs } = M.util;
    const p = M.catalog.bySlug(qs('slug') || '');
    const bar = $('[data-demo-bar]');
    if (!p) {
      bar.innerHTML = '<a class="logo logo--inverse" href="' + url('index.html') + '">' + M.LOGO + '<span>Templora</span></a>';
      $('[data-viewport]').innerHTML = '<div style="padding:48px">' + M.render.emptyState({ icon: 'monitor', level: 1, title: 'Demo not found', desc: 'This template doesn’t exist or has no demo.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Browse templates</a>' }) + '</div>';
      return;
    }
    document.title = p.shortName + ' live demo (placeholder) | Templora';
    bar.innerHTML = '<a class="logo logo--inverse" href="' + url('index.html') + '" aria-label="Templora home">' + M.LOGO.replace('#0e1116', '#2a303b') + '</a>' +
      '<div style="min-width:0;flex:1"><p style="font-weight:600;font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + '</p><p style="font-size:var(--text-xs);color:#f6c177">Demo placeholder — the seller’s live URL will load here</p></div>' +
      '<div class="device-toggle hide-mobile" role="group" aria-label="Preview device">' + [['desktop', 'monitor'], ['tablet', 'tablet'], ['mobile', 'smartphone']].map(([d, ic]) => '<button type="button" data-device="' + d + '" aria-pressed="' + (d === 'desktop') + '">' + M.icon(ic) + '<span class="sr-only">' + d + '</span></button>').join('') + '</div>' +
      '<a class="btn btn--sm btn--outline-inverse" href="' + M.catalog.productUrl(p) + '">' + M.icon('arrow-left', 'icon--sm') + 'Details</a>' +
      '<button type="button" class="btn btn--sm btn--primary" data-add-to-cart="' + p.id + '">' + M.icon('cart', 'icon--sm') + (p.price ? 'Add to cart · ' + money(p.price) : 'Get it free') + '</button>';
    const vp = $('[data-viewport]');
    const stage = $('#demo-stage');
    const imgs = { desktop: p.images.gallery, tablet: [p.images.tablet], mobile: [p.images.mobile] };
    function show(d) {
      stage.dataset.device = d;
      vp.innerHTML = imgs[d].filter(Boolean).map((src, i) => '<img src="' + url(src) + '" alt="' + esc(p.shortName) + ' ' + d + ' preview ' + (i + 1) + '" width="1440" height="900"' + (i ? ' loading="lazy"' : '') + '>').join('');
      bar.querySelectorAll('[data-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === d)));
    }
    bar.addEventListener('click', (e) => { const b = e.target.closest('[data-device]'); if (b) show(b.dataset.device); });
    show(window.innerWidth < 768 ? 'mobile' : 'desktop');
  };
})((window.Market = window.Market || {}));
