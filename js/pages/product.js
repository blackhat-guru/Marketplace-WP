/* Single product (WooCommerce single-product template). */
(function (M) {
  'use strict';
  M.pages.product = function () {
    const { $, $$, url, esc, money, fmtDate, num, qs } = M.util;
    const R = M.render;
    const p = M.catalog.bySlug(qs('slug') || 'nova');
    const host = $('[data-product-body]');

    if (!p || p.status !== 'published') {
      document.title = 'Template not found | Templora';
      $('[data-breadcrumbs]').innerHTML = R.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label: 'Template not found' }]);
      host.innerHTML = '<div class="section">' + R.emptyState({ icon: 'package', level: 1, title: 'This template isn’t available', desc: 'It may have been unpublished by the seller or the link is incorrect.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Browse templates</a><a class="btn" href="' + url('pages/search.html') + '">Search</a>' }) + '</div>';
      return;
    }

    const seller = M.catalog.seller(p.seller);
    const d = M.data.details(p);
    const sub = M.catalog.subName(p.subcategory);
    let license = p.licenses[0].id;
    M.catalog.recent.push(p.id);

    // SEO: title, description, breadcrumbs, structured data integration point
    document.title = p.name + ' | Templora';
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = p.summary;
    const og = (prop, v) => { const m = document.querySelector('meta[property="' + prop + '"]'); if (m) m.content = v; };
    og('og:title', p.name); og('og:description', p.summary); og('og:image', url(p.images.main));
    const crumbs = [{ label: 'Home', href: url('index.html') }, { label: 'HTML Templates', href: url('pages/html-templates.html') }, { label: sub, href: url('pages/html-templates.html?sub=' + p.subcategory) }, { label: p.shortName }];
    $('[data-breadcrumbs]').innerHTML = R.breadcrumbs(crumbs);
    R.breadcrumbLd(crumbs);
    // Product schema without ratings: sample ratings must not be published as structured data.
    R.jsonLd({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary, sku: p.id, image: new URL(url(p.images.main), location.href).href, brand: { '@type': 'Brand', name: seller.name },
      offers: { '@type': 'Offer', priceCurrency: 'USD', price: String(p.price), availability: 'https://schema.org/InStock' } });

    const reviews = M.data.reviews.filter((r) => r.productId === p.id);
    const tabs = [
      ['overview', 'Overview', '<div class="prose"><p>' + esc(p.description) + '</p></div><dl class="kv" style="margin-top:20px;max-width:420px"><dt>Pages</dt><dd>' + d.includedPages.length + (p.pagesCount > d.includedPages.length ? '+' : '') + '</dd><dt>Version</dt><dd>' + esc(p.version) + '</dd><dt>Last updated</dt><dd>' + fmtDate(p.updated) + '</dd><dt>Published</dt><dd>' + fmtDate(p.published) + '</dd><dt>Category</dt><dd>' + esc(sub) + '</dd></dl>'],
      ['features', 'Key Features', '<ul class="feature-list">' + p.features.map((f) => '<li>' + M.icon('check') + esc(M.data.features[f]) + '</li>').join('') + '</ul>'],
      ['pages', 'Included Pages', '<ul class="pages-list">' + d.includedPages.map((x) => '<li>' + M.icon('file') + esc(x) + '</li>').join('') + '</ul>'],
      ['components', 'Components', '<ul class="feature-list">' + d.components.map((x) => '<li>' + M.icon('layers') + esc(x) + '</li>').join('') + '</ul>'],
      ['tech', 'Technologies', R.techBadges(p, 10)],
      ['compat', 'Compatibility', '<p class="text-secondary" style="font-size:var(--text-sm);margin-bottom:12px">Tested by the seller in:</p><ul class="feature-list">' + d.compatibility.map((x) => '<li>' + M.icon('check') + esc(x) + '</li>').join('') + '</ul>'],
      ['install', 'Installation', '<ol class="prose" style="list-style:decimal;padding-left:1.25rem">' + d.installation.map((x) => '<li>' + esc(x).replace(/`([^`]+)`/g, '<code>$1</code>') + '</li>').join('') + '</ol>'],
      ['docs', 'Documentation', '<p class="text-secondary">' + esc(d.documentation) + '</p>'],
      ['deps', 'Dependencies', '<ul class="feature-list">' + d.dependencies.map((x) => '<li>' + M.icon('package') + esc(x) + '</li>').join('') + '</ul>'],
      ['reqs', 'Requirements', '<ul class="feature-list">' + d.requirements.map((x) => '<li>' + M.icon('check') + esc(x) + '</li>').join('') + '</ul>'],
      ['license', 'License', '<div style="display:grid;gap:12px">' + p.licenses.map((l) => '<div class="card card--pad"><p style="font-weight:600">' + esc(M.catalog.licenseName(l.id)) + ' · ' + money(l.price) + '</p><p class="text-secondary" style="font-size:var(--text-sm);margin-top:4px">' + esc(M.data.licenses[l.id].desc) + '</p></div>').join('') + '<a class="link" href="' + url('pages/legal.html?doc=license') + '">Read the full License Agreement</a></div>'],
      ['support', 'Support', '<p class="text-secondary">' + esc(d.support) + '</p><a class="btn btn--sm" style="margin-top:12px" href="' + M.catalog.sellerUrl(seller.slug) + '#contact">Contact ' + esc(seller.name) + '</a>'],
      ['updates', 'Updates', '<p class="text-secondary">' + esc(d.updates) + '</p>'],
    ];

    host.innerHTML =
      '<div class="pd-layout" style="padding-top:12px">' +
        '<div style="min-width:0">' +
          '<header class="pd-header">' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (p.price === 0 ? '<span class="badge badge--free">Free</span>' : '') + (M.catalog.discount(p) ? '<span class="badge badge--sale">' + M.catalog.discount(p) + '% off</span>' : '') + (p.flags.new ? '<span class="badge badge--new">New</span>' : '') + '<span class="badge badge--outline">' + esc(sub) + '</span></div>' +
            '<h1 class="pd-title">' + esc(p.name) + '</h1>' +
            '<p class="text-lead">' + esc(p.summary) + '</p>' +
            '<div class="pd-meta"><span>' + M.icon('store') + 'by <a href="' + M.catalog.sellerUrl(seller.slug) + '">' + esc(seller.name) + '</a></span>' +
              '<a href="#reviews" style="font-weight:400">' + R.rating(p) + '</a>' +
              '<span>' + M.icon('git-branch') + 'v' + esc(p.version) + '</span><span>' + M.icon('clock') + 'Updated ' + fmtDate(p.updated) + '</span>' +
              '<span>' + M.icon('download') + num(p.sales) + ' sales <span class="badge badge--demo" style="height:18px">sample</span></span></div>' +
            R.techBadges(p, 8) +
          '</header>' +
          '<div style="margin-top:24px" data-gallery></div>' +
          '<div class="card card--pad" style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap" id="demo"><div><p style="font-weight:600">See it running</p><p class="text-muted" style="font-size:var(--text-meta)">Open the seller’s live demo in a device-preview frame.</p></div><a class="btn btn--dark" href="' + M.catalog.demoUrl(p) + '">' + M.icon('external') + 'Live demo</a></div>' +
          '<div class="pd-section" data-tabs><h2 class="sr-only">Product information</h2><div class="tabs__list" role="tablist" aria-label="Product information">' +
            tabs.map(([k, l], i) => '<button type="button" class="tabs__tab" role="tab" id="tab-' + k + '" aria-controls="panel-' + k + '" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' + l + '</button>').join('') + '</div>' +
            tabs.map(([k, , body], i) => '<div class="tabs__panel" role="tabpanel" id="panel-' + k + '" aria-labelledby="tab-' + k + '" tabindex="0"' + (i ? ' hidden' : '') + '>' + body + '</div>').join('') +
          '</div>' +
          '<section class="pd-section" aria-labelledby="changelog-h"><h2 class="pd-section__title" id="changelog-h">Version history</h2><ol class="changelog" reversed>' +
            d.changelog.map((c) => '<li class="changelog__item"><div><p style="font-weight:600">v' + esc(c.version) + '</p><p class="text-muted" style="font-size:var(--text-meta)"><time datetime="' + c.date + '">' + fmtDate(c.date) + '</time></p></div><ul>' + c.notes.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul></li>').join('') + '</ol></section>' +
          '<section class="pd-section" aria-labelledby="faq-h"><h2 class="pd-section__title" id="faq-h">Product FAQs</h2>' + R.accordion(d.faqs.map((f) => ({ q: f.q, a: esc(f.a) }))) + '</section>' +
          '<section class="pd-section" aria-labelledby="seller-h"><h2 class="pd-section__title" id="seller-h">About the seller</h2><div class="seller-summary"><img src="' + url(seller.logo) + '" alt="" width="56" height="56" style="border-radius:14px;flex:none"><div style="flex:1;min-width:0"><p style="font-weight:600">' + esc(seller.name) + '</p><p class="text-muted" style="font-size:var(--text-meta)">Member since ' + fmtDate(seller.memberSince, { year: 'numeric', month: 'long' }) + ' · ' + M.catalog.sellerStats(seller.slug).count + ' products</p><p class="text-secondary" style="font-size:var(--text-sm);margin-top:8px">' + esc(seller.bio) + '</p><div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><a class="btn btn--sm" href="' + M.catalog.sellerUrl(seller.slug) + '">View store</a><a class="btn btn--sm btn--ghost" href="' + M.catalog.sellerUrl(seller.slug) + '#contact">' + M.icon('message', 'icon--sm') + 'Message seller</a></div></div></div></section>' +
          '<section class="pd-section" id="reviews" aria-labelledby="reviews-h"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px"><h2 class="pd-section__title" id="reviews-h" style="margin:0">Buyer reviews</h2><button type="button" class="btn btn--sm" data-write-review>' + M.icon('edit', 'icon--sm') + 'Write a review</button></div>' + reviewsHTML() + '</section>' +
        '</div>' +
        '<aside class="buy-panel-wrap" aria-label="Purchase options"><div class="card buy-panel" id="buy-panel">' +
          '<div class="buy-panel__price"><div data-price>' + priceHTML() + '</div>' + (p.originalPrice ? '<span class="badge badge--sale">Save ' + money(p.originalPrice - p.price) + '</span>' : '') + '</div>' +
          (p.price > 0 ? '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:8px"><legend class="label" style="margin-bottom:8px">License</legend>' +
            p.licenses.map((l, i) => '<label class="option-card"><input type="radio" name="license" value="' + l.id + '"' + (i === 0 ? ' checked' : '') + '><span class="option-card__body"><span class="option-card__title"><span>' + esc(M.catalog.licenseName(l.id)) + '</span><span>' + money(l.price) + '</span></span><span class="option-card__desc">' + esc(M.data.licenses[l.id].desc) + '</span></span></label>').join('') +
            '<a class="link" style="font-size:var(--text-meta)" href="' + url('pages/legal.html?doc=license') + '">Compare licenses</a></fieldset>' : '<p class="text-secondary" style="font-size:var(--text-sm)">Free for personal and commercial projects under the standard license.</p>') +
          '<div style="display:grid;gap:8px"><button type="button" class="btn btn--primary btn--lg btn--block" data-buy-now>' + (p.price === 0 ? 'Get it free' : 'Buy now') + '</button>' +
            '<button type="button" class="btn btn--lg btn--block" data-add>' + M.icon('cart') + 'Add to cart</button>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button type="button" class="btn btn--block" data-wishlist-toggle="' + p.id + '" aria-pressed="' + M.wishlist.has(p.id) + '">' + M.icon('heart') + '<span data-wishlist-label>' + (M.wishlist.has(p.id) ? 'Saved to wishlist' : 'Add to wishlist') + '</span></button>' +
            '<a class="btn btn--block" href="' + M.catalog.demoUrl(p) + '">' + M.icon('eye') + 'Live demo</a></div></div>' +
          '<ul class="buy-panel__policies list-plain">' +
            '<li>' + M.icon('download') + '<span><strong>Download:</strong> available from your account after payment is confirmed.</span></li>' +
            '<li>' + M.icon('refresh') + '<span><strong>Updates:</strong> ' + esc(d.updates) + '</span></li>' +
            '<li>' + M.icon('help') + '<span><strong>Support:</strong> ' + esc(d.support) + '</span></li>' +
            '<li>' + M.icon('receipt') + '<span>See the <a class="link" href="' + url('pages/legal.html?doc=refund') + '">Refund Policy</a> before purchasing.</span></li>' +
          '</ul>' +
          '<p class="note-strip">' + M.icon('lock') + 'Checkout runs through a secure payment provider in production. This prototype takes no payment.</p>' +
        '</div></aside>' +
      '</div>' +
      '<section class="section" aria-labelledby="related-h"><div class="section-head"><h2 class="section-head__title" id="related-h">Related templates</h2><a class="section-head__link" href="' + url('pages/html-templates.html?sub=' + p.subcategory) + '">More ' + esc(sub) + M.icon('arrow-right') + '</a></div><div class="product-grid" data-related></div></section>' +
      '<section class="section" style="padding-top:0" aria-labelledby="recent-h" data-recent-wrap hidden><div class="section-head"><h2 class="section-head__title" id="recent-h">Recently viewed</h2></div><div class="product-grid" data-recent></div></section>' +
      '<div class="sticky-buy" data-sticky-buy aria-hidden="true"><div style="flex:1;min-width:0"><p style="font-weight:600;font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.shortName) + '</p><div data-price-mini>' + money(p.price) + '</div></div><button type="button" class="btn" data-add tabindex="-1" aria-label="Add to cart">' + M.icon('cart') + '</button><button type="button" class="btn btn--primary" data-buy-now tabindex="-1">' + (p.price === 0 ? 'Get it free' : 'Buy now') + '</button></div>';

    function priceHTML() {
      const price = M.catalog.priceFor(p, license);
      const isBase = license === p.licenses[0].id;
      return '<span class="price price--lg"><span class="price__current' + (price === 0 ? ' price__current--free' : '') + '">' + money(price) + '</span>' + (isBase && p.originalPrice ? '<span class="price__old"><span class="sr-only">Original price </span>' + money(p.originalPrice) + '</span>' : '') + '</span><p class="text-muted" style="font-size:var(--text-xs)">' + esc(M.catalog.licenseName(license)) + ' license · USD · taxes calculated at checkout</p>';
    }
    function reviewsHTML() {
      if (!p.reviewCount) return R.emptyState({ icon: 'star', level: 3, title: 'No reviews yet', desc: 'Buyers can review a template after purchasing it.' });
      const dist = [5, 4, 3, 2, 1].map((s) => [s, Math.max(0, Math.round(p.reviewCount * ({ 5: (p.rating - 3.6) / 1.5, 4: 0.22, 3: 0.06, 2: 0.02, 1: 0.01 }[s])))]);
      const totalD = dist.reduce((a, x) => a + x[1], 0) || 1;
      return '<div class="rating-summary card card--pad"><div><p class="rating-summary__score">' + p.rating.toFixed(1) + '</p>' + R.stars(p.rating).replace('rating__stars', 'rating__stars') + '<p class="text-muted" style="font-size:var(--text-meta);margin-top:6px">' + p.reviewCount + ' reviews · <span class="badge badge--demo" style="height:18px">sample data</span></p></div>' +
        '<div style="display:grid;gap:6px">' + dist.map(([s, n]) => '<div class="bar-meter"><span>' + s + ' stars</span><div class="meter" role="img" aria-label="' + Math.round((n / totalD) * 100) + '% ' + s + '-star"><span style="width:' + (n / totalD) * 100 + '%;background:var(--color-rating)"></span></div><span>' + n + '</span></div>').join('') + '</div></div>' +
        (reviews.length ? '<div>' + reviews.map((r) => '<article class="review"><div class="review__head"><p class="review__author"><span class="avatar" style="width:28px;height:28px;font-size:11px">' + esc(r.author.slice(-4, -1).replace('.', '')) + '</span>' + esc(r.author) + '</p><span class="text-muted" style="font-size:var(--text-meta)">' + fmtDate(r.date) + '</span></div><div class="rating" style="margin-top:8px">' + R.stars(r.rating) + '<span class="sr-only">' + r.rating + ' out of 5</span></div><h3 style="font-size:var(--text-sm);margin-top:8px">' + esc(r.title) + '</h3><p class="review__body">' + esc(r.body) + '</p></article>').join('') + '<p class="hint" style="margin-top:12px">Showing ' + reviews.length + ' sample reviews. Review text is illustrative demo content.</p></div>'
          : '<p class="hint" style="margin-top:16px">Individual review text isn’t included in the sample data for this product.</p>');
    }

    M.gallery($('[data-gallery]'), p);

    // License selection updates price + buttons
    host.addEventListener('change', (e) => {
      if (e.target.name !== 'license') return;
      license = e.target.value;
      $('[data-price]').innerHTML = priceHTML();
      $('[data-price-mini]').textContent = money(M.catalog.priceFor(p, license)) + ' · ' + M.catalog.licenseName(license);
    });
    host.addEventListener('click', (e) => {
      if (e.target.closest('[data-add]')) {
        M.cart.add(p.id, license);
        if (M.motion) M.motion.pop(e.target.closest('[data-add]'));
        M.toast({ title: 'Added to cart', desc: p.shortName + ' · ' + M.catalog.licenseName(license) + ' license', action: { label: 'View cart', href: url('pages/cart.html') } });
      }
      if (e.target.closest('[data-buy-now]')) {
        if (!M.cart.items().some((x) => x.id === p.id && x.license === license)) M.cart.add(p.id, license);
        location.href = url('pages/checkout.html');
      }
      if (e.target.closest('[data-write-review]')) {
        const owned = M.data.customerOrders.some((o) => o.status === 'completed' && o.items.some((i) => i.id === p.id)) || (M.store.get('orders', []).some((o) => o.items.some((i) => i.id === p.id)));
        if (owned) location.href = url('pages/account.html#reviews');
        else M.demoNotice('Reviews are for buyers', 'Only customers who have purchased ' + esc(p.shortName) + ' can leave a review. Once you buy it, you can review it from <strong>Account › Reviews</strong>.');
      }
    });

    // Related (same subcategory, then shared technology) and recently viewed
    const others = M.catalog.all().filter((x) => x.id !== p.id);
    const related = others.filter((x) => x.subcategory === p.subcategory).concat(others.filter((x) => x.subcategory !== p.subcategory && x.tech.some((t) => p.tech.includes(t)))).slice(0, 4);
    $('[data-related]').innerHTML = related.map((x) => R.productCard(x)).join('');
    const recent = M.catalog.recent.list(p.id).slice(0, 4);
    if (recent.length) { $('[data-recent-wrap]').hidden = false; $('[data-recent]').innerHTML = recent.map((x) => R.productCard(x)).join(''); }

    // Mobile sticky purchase bar appears once the main buy panel scrolls away.
    const sticky = $('[data-sticky-buy]');
    const panel = $('#buy-panel');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
        $$('button', sticky).forEach((b) => (b.tabIndex = show ? 0 : -1));
      }).observe(panel);
    }
    M.initTabs(host);
  };
})((window.Market = window.Market || {}));
