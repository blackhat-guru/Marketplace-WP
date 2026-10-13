/* Seller workspace (multi-vendor vendor dashboard). Every figure is DEMO data
   for the fictional store "PixelForge Studio". Payout actions are frontend-only. */
(function (M) {
  'use strict';
  M.pages.sellerDashboard = function () {
    const { $, url, esc, money, moneyExact, fmtDate, num } = M.util;
    const D = M.data;
    const R = M.render;
    const seller = M.catalog.seller(D.demoSellerSlug);
    const err = M.forms.errorHTML;
    const session = M.session.get();
    const rate = D.demoCommissionRate;

    $('[data-access-note]').innerHTML = (session && session.seller === 'approved')
      ? ''
      : '<div class="alert alert--warning" style="margin-bottom:24px">' + M.icon('info') + '<div><p class="alert__title">Demo workspace</p><p class="alert__body">You’re viewing the sample store “' + esc(seller.name) + '”. In production this page requires an approved seller account. <a class="link" href="' + url('pages/seller-onboarding.html') + '">Apply to sell</a></p></div></div>';

    const localDrafts = () => M.store.get('seller-products', []);
    const products = () => localDrafts().concat(M.catalog.sellerProducts(seller.slug, true)).filter((p) => p.status !== 'deleted');
    const statusPill = (s) => ({ published: '<span class="status status--success">Published</span>', pending: '<span class="status status--warning">Pending review</span>', draft: '<span class="status status--neutral">Draft</span>', rejected: '<span class="status status--error">Rejected</span>' }[s]);
    const orderPill = (s) => ({ completed: '<span class="status status--success">Completed</span>', refunded: '<span class="status status--neutral">Refunded</span>', pending: '<span class="status status--warning">Pending</span>' }[s]);
    const head = (id, title, desc, action) => '<div class="app-main__head"><div><h1 class="app-main__title" id="h-' + id + '">' + title + '</h1>' + (desc ? '<p class="app-main__desc">' + desc + '</p>' : '') + '</div>' + (action || '') + '</div>';
    const thumb = (p) => p.images && p.images.main ? url(p.images.main) : M.PLACEHOLDER_IMG;

    const orders = D.sellerOrders.map((o) => Object.assign({}, o, { product: M.catalog.byId(o.productId), commission: o.status === 'refunded' ? 0 : o.gross * rate, net: o.status === 'refunded' ? 0 : o.gross * (1 - rate) }));
    const totals = {
      gross: orders.filter((o) => o.status !== 'refunded').reduce((a, o) => a + o.gross, 0),
      net: orders.reduce((a, o) => a + o.net, 0),
      pending: orders.filter((o) => o.status === 'pending').reduce((a, o) => a + o.net, 0),
      paid: D.payouts.reduce((a, p) => a + p.amount, 0),
    };
    let available = Math.round((totals.net - totals.pending) * 100) / 100;

    /* ---------- Overview ---------- */
    function overview() {
      const ps = products();
      const pub = ps.filter((p) => p.status === 'published');
      const views = pub.reduce((a, p) => a + p.views, 0);
      const sales = pub.reduce((a, p) => a + p.sales, 0);
      const stat = (icon, label, value, delta) => '<div class="stat"><p class="stat__label">' + M.icon(icon) + label + '</p><p class="stat__value">' + value + '</p>' + (delta ? '<p class="stat__delta stat__delta--' + (delta > 0 ? 'up' : 'down') + '">' + M.icon(delta > 0 ? 'trending' : 'trending', 'icon--sm') + (delta > 0 ? '+' : '') + delta + '% vs last month</p>' : '') + '</div>';
      $('[data-section="overview"]').innerHTML = head('overview', 'Welcome back, ' + esc(seller.name), 'Store performance for the last 12 months. <span class="badge badge--demo" style="height:18px">sample data</span>', '<a class="btn btn--primary" href="' + url('pages/add-product.html') + '">' + M.icon('plus') + 'Create new product</a>') +
        '<div class="stat-grid">' +
          stat('receipt', 'Total sales', num(sales), 8) +
          stat('wallet', 'Net earnings · 30 days', moneyExact(totals.net), 12) +
          stat('package', 'Published products', pub.length) +
          stat('clock', 'Pending review', ps.filter((p) => p.status === 'pending').length) +
          stat('eye', 'Product views', num(views), 6) +
          stat('percent', 'Conversion rate', D.analytics.conversion[11] + '%', 4) +
        '</div>' +
        '<div class="dash-grid dash-grid--2-1" style="margin-top:20px">' +
          '<div class="card"><div class="card__head"><div><h2 class="card__title">Sales over time</h2><p class="text-muted" style="font-size:var(--text-xs)">Gross sales, USD — demo figures</p></div><a class="link" style="font-size:var(--text-sm)" href="#analytics">Full analytics</a></div><div class="card__body" data-chart-overview></div></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Recent orders</h2><a class="link" style="font-size:var(--text-sm)" href="#orders">View all</a></div><ul class="list-plain" style="padding:0 20px">' +
            orders.slice(0, 5).map((o) => '<li class="list-row"><img class="thumb-sm" src="' + thumb(o.product) + '" alt="" width="56" height="35"><div class="list-row__main"><p class="list-row__title">' + esc(o.product.shortName) + '</p><p class="list-row__meta">' + esc(o.ref) + ' · ' + fmtDate(o.date, { month: 'short', day: 'numeric' }) + '</p></div><strong>' + money(o.gross) + '</strong></li>').join('') + '</ul></div>' +
        '</div>';
      M.charts.line($('[data-chart-overview]'), {
        title: 'Monthly gross sales', summary: 'Sales rose from $1,180 in November to $2,210 in October (demo data).',
        labels: D.analytics.months, format: (v, axis) => (axis ? '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) : '$' + num(Math.round(v))),
        series: [{ name: 'This year', values: D.analytics.sales }, { name: 'Previous year', values: D.analytics.salesPrev, secondary: true }],
      });
    }

    /* ---------- Products ---------- */
    let productFilter = 'all';
    let productQuery = '';
    function productsView() {
      const ps = products();
      const counts = { all: ps.length };
      ps.forEach((p) => (counts[p.status] = (counts[p.status] || 0) + 1));
      const list = ps.filter((p) => (productFilter === 'all' || p.status === productFilter) && (!productQuery || p.name.toLowerCase().includes(productQuery.toLowerCase())));
      const sec = $('[data-section="products"]');
      sec.innerHTML = head('products', 'Products', 'Manage listings, track review status and edit details.', '<a class="btn btn--primary" href="' + url('pages/add-product.html') + '">' + M.icon('plus') + 'Create new product</a>') +
        '<div class="toolbar"><div class="chip-row" role="group" aria-label="Filter by status">' + [['all', 'All'], ['published', 'Published'], ['pending', 'Pending review'], ['draft', 'Draft'], ['rejected', 'Rejected']].map(([k, l]) => '<button type="button" class="chip" data-pfilter="' + k + '" aria-pressed="' + (productFilter === k) + '">' + l + ' <span class="chip__count">' + (counts[k] || 0) + '</span></button>').join('') + '</div>' +
          '<div class="search-field" style="width:260px;max-width:100%"><label class="sr-only" for="p-search">Search products</label><span class="search-field__icon">' + M.icon('search') + '</span><input class="search-field__input" id="p-search" type="search" placeholder="Search products…" value="' + esc(productQuery) + '" style="background:#fff"></div></div>' +
        '<p class="sr-only" aria-live="polite">' + list.length + ' products shown</p>' +
        (list.length ? '<div class="table-wrap"><table class="data-table data-table--stack"><caption class="sr-only">Your products</caption><thead><tr><th scope="col">Product</th><th scope="col">Status</th><th scope="col" class="num">Price</th><th scope="col" class="num">Sales</th><th scope="col" class="num">Views</th><th scope="col">Updated</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
          list.map((p) => '<tr><td class="cell-primary"><div class="data-table__product"><img src="' + thumb(p) + '" alt="" width="64" height="40"><div style="min-width:0"><p class="data-table__title">' + esc(p.name) + '</p><p class="text-muted" style="font-size:var(--text-xs)">' + esc(M.catalog.subName(p.subcategory)) + ' · v' + esc(p.version) + (p.local ? ' · saved in this browser' : '') + '</p>' + (p.status === 'rejected' && p.rejectionReason ? '<p style="font-size:var(--text-xs);color:var(--color-error);margin-top:2px">' + esc(p.rejectionReason) + '</p>' : '') + '</div></div></td>' +
            '<td data-label="Status">' + statusPill(p.status) + '</td><td class="num" data-label="Price">' + money(p.price) + '</td><td class="num" data-label="Sales">' + num(p.sales) + '</td><td class="num" data-label="Views">' + num(p.views) + '</td><td data-label="Updated">' + fmtDate(p.updated) + '</td>' +
            '<td data-label="Actions"><div class="row-actions"><a class="btn btn--sm" href="' + url('pages/add-product.html?edit=' + encodeURIComponent(p.slug)) + '" aria-label="Edit ' + esc(p.shortName) + '">' + M.icon('edit', 'icon--sm') + 'Edit</a>' +
              '<button type="button" class="btn btn--sm btn--ghost btn--icon" data-preview="' + esc(p.slug) + '" aria-label="Preview ' + esc(p.shortName) + '">' + M.icon('eye', 'icon--sm') + '</button>' +
              '<button type="button" class="btn btn--sm btn--ghost btn--icon" data-sales="' + esc(p.id) + '" aria-label="View sales for ' + esc(p.shortName) + '"' + (p.sales ? '' : ' disabled') + '>' + M.icon('bar-chart', 'icon--sm') + '</button>' +
              (p.status === 'draft' ? '<button type="button" class="btn btn--sm btn--ghost btn--icon" data-delete="' + esc(p.slug) + '" aria-label="Delete draft ' + esc(p.shortName) + '">' + M.icon('trash', 'icon--sm') + '</button>' : '') +
            '</div></td></tr>').join('') + '</tbody></table></div>'
          : R.emptyState({ icon: 'package', title: productQuery ? 'No products match “' + productQuery + '”' : 'No products with this status', desc: 'Try another filter, or create a new product.', actions: '<a class="btn btn--primary" href="' + url('pages/add-product.html') + '">Create new product</a>' }));
      const ps2 = $('#p-search');
      ps2.addEventListener('input', M.util.debounce(() => { productQuery = ps2.value.trim(); productsView(); const n = $('#p-search'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250));
    }

    /* ---------- Orders ---------- */
    let orderFilter = null;
    function ordersView() {
      const list = orderFilter ? orders.filter((o) => o.productId === orderFilter) : orders;
      $('[data-section="orders"]').innerHTML = head('orders', 'Orders', 'Sales of your products. Buyer details are shared only as needed for support.') +
        (orderFilter ? '<div class="active-filters"><button type="button" class="chip chip--removable" data-clear-order-filter><span>Product: ' + esc(M.catalog.byId(orderFilter).shortName) + '</span><span class="chip__x">' + M.icon('x', 'icon--sm') + '</span><span class="sr-only">Remove filter</span></button></div>' : '') +
        '<p class="alert alert--neutral" style="margin-bottom:16px">' + M.icon('info') + '<span>Commission uses a <strong>placeholder ' + rate * 100 + '% rate</strong> purely to show the layout — the real rate is not yet defined.</span></p>' +
        '<div class="table-wrap"><table class="data-table data-table--stack"><caption class="sr-only">Seller orders</caption><thead><tr><th scope="col">Order</th><th scope="col">Product</th><th scope="col">Sale date</th><th scope="col" class="num">Gross</th><th scope="col" class="num">Commission</th><th scope="col" class="num">Net earnings</th><th scope="col">Status</th></tr></thead><tbody>' +
        list.map((o) => '<tr><td class="cell-primary"><span class="data-table__title">' + esc(o.ref) + '</span></td><td data-label="Product">' + esc(o.product.shortName) + ' <span class="text-muted">· ' + esc(M.catalog.licenseName(o.license)) + '</span></td><td data-label="Sale date">' + fmtDate(o.date) + '</td><td class="num" data-label="Gross">' + moneyExact(o.gross) + '</td><td class="num" data-label="Commission">−' + moneyExact(o.commission) + '</td><td class="num" data-label="Net" style="color:var(--color-text);font-weight:600">' + moneyExact(o.net) + '</td><td data-label="Status">' + orderPill(o.status) + '</td></tr>').join('') +
        '</tbody></table></div>';
    }

    /* ---------- Earnings ---------- */
    function earningsView() {
      const tx = orders.map((o) => ({ date: o.date, desc: 'Sale · ' + o.product.shortName + ' (' + o.ref + ')', amount: o.net, status: o.status })).concat(D.payouts.map((p) => ({ date: p.date, desc: 'Payout ' + p.id + ' · ' + p.method, amount: -p.amount, status: 'paid' }))).concat(M.store.get('payout-requests', []).map((p) => ({ date: p.date, desc: 'Payout request (demo)', amount: -p.amount, status: 'requested' }))).sort((a, b) => b.date.localeCompare(a.date));
      const requested = M.store.get('payout-requests', []).reduce((a, p) => a + p.amount, 0);
      const avail = Math.max(0, available - requested);
      $('[data-section="earnings"]').innerHTML = head('earnings', 'Earnings &amp; payouts', 'Balances update as orders clear. Payout schedules depend on the payment provider.', '<button type="button" class="btn btn--primary" data-request-payout' + (avail < 50 ? ' disabled' : '') + '>' + M.icon('wallet') + 'Request payout</button>') +
        '<div class="stat-grid"><div class="balance-card"><p>Available balance</p><strong>' + moneyExact(avail) + '</strong><p>Ready to withdraw · demo</p></div>' +
        '<div class="stat"><p class="stat__label">' + M.icon('clock') + 'Pending balance</p><p class="stat__value">' + moneyExact(totals.pending + requested) + '</p><p class="hint">Orders in refund window + requested payouts</p></div>' +
        '<div class="stat"><p class="stat__label">' + M.icon('check-circle') + 'Total paid out</p><p class="stat__value">' + moneyExact(totals.paid) + '</p><p class="hint">Since ' + fmtDate(D.payouts[D.payouts.length - 1].date) + '</p></div></div>' +
        '<div class="dash-grid dash-grid--2-1" style="margin-top:20px"><div class="card"><div class="card__head"><h2 class="card__title">Transaction history</h2></div><div class="table-wrap" style="border:0;border-radius:0 0 14px 14px"><table class="data-table data-table--stack"><caption class="sr-only">Transactions</caption><thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Status</th><th scope="col" class="num">Amount</th></tr></thead><tbody>' +
          tx.map((t) => '<tr><td data-label="Date">' + fmtDate(t.date) + '</td><td class="cell-primary" style="color:var(--color-text)">' + esc(t.desc) + '</td><td data-label="Status">' + (t.status === 'paid' ? '<span class="status status--success">Paid</span>' : t.status === 'requested' ? '<span class="status status--info">Requested</span>' : orderPill(t.status)) + '</td><td class="num" data-label="Amount" style="font-weight:600;color:' + (t.amount < 0 ? 'var(--color-text)' : 'var(--color-success)') + '">' + (t.amount < 0 ? '−' : '+') + moneyExact(Math.abs(t.amount)) + '</td></tr>').join('') +
        '</tbody></table></div></div>' +
        '<form class="card form-section" novalidate data-payout-method><h2 class="card__title">Payout method</h2><p class="text-muted" style="font-size:var(--text-sm)">Bank details are collected by the payment provider’s onboarding — never stored by Templora.</p>' +
          '<div class="field"><label class="label" for="pm-method">Method</label><select class="select" id="pm-method" required aria-describedby="pm-method-err"><option value="">Choose a method</option><option selected>Bank transfer (via provider)</option><option>PayPal</option></select>' + err('pm-method') + '</div>' +
          '<div class="field"><label class="label" for="pm-email">Payout notification email</label><input class="input" id="pm-email" type="email" required value="payouts@pixelforge.example" aria-describedby="pm-email-err">' + err('pm-email') + '</div>' +
          '<div class="pay-placeholder">' + M.icon('lock') + '<p>Connect account with payment provider — placeholder for the provider’s hosted onboarding.</p></div>' +
          '<button type="submit" class="btn" style="justify-self:start">Save payout settings</button><p class="demo-note">' + M.icon('info') + 'Frontend-only — no payout is configured.</p></form></div>';
    }

    /* ---------- Analytics ---------- */
    function analyticsView() {
      const pub = products().filter((p) => p.status === 'published').sort((a, b) => b.sales - a.sales);
      const maxSales = Math.max(...pub.map((p) => p.sales), 1);
      const a = D.analytics;
      $('[data-section="analytics"]').innerHTML = head('analytics', 'Analytics', 'Last 12 months. All analytics on this page are demo data.') +
        '<div class="dash-grid dash-grid--1-1">' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Sales over time</h2></div><div class="card__body" data-c-sales></div></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Product views</h2></div><div class="card__body" data-c-views></div></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Conversion rate</h2></div><div class="card__body" data-c-conv></div></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Wishlist adds</h2></div><div class="card__body" data-c-wish></div></div>' +
        '</div>' +
        '<div class="card" style="margin-top:20px"><div class="card__head"><h2 class="card__title">Top-performing products</h2></div><div class="table-wrap" style="border:0;border-radius:0 0 14px 14px"><table class="data-table data-table--stack"><caption class="sr-only">Top products by sales</caption><thead><tr><th scope="col">Product</th><th scope="col">Share of sales</th><th scope="col" class="num">Sales</th><th scope="col" class="num">Views</th><th scope="col" class="num">Conversion</th></tr></thead><tbody>' +
          pub.map((p) => '<tr><td class="cell-primary"><div class="data-table__product"><img src="' + thumb(p) + '" alt="" width="64" height="40"><span class="data-table__title">' + esc(p.shortName) + '</span></div></td><td data-label="Share" style="min-width:160px"><div class="meter" aria-hidden="true"><span style="width:' + (p.sales / maxSales) * 100 + '%"></span></div></td><td class="num" data-label="Sales">' + num(p.sales) + '</td><td class="num" data-label="Views">' + num(p.views) + '</td><td class="num" data-label="Conversion">' + ((p.sales / p.views) * 100).toFixed(1) + '%</td></tr>').join('') +
        '</tbody></table></div></div>';
      const usd = (v, axis) => (axis ? '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) : '$' + num(Math.round(v)));
      M.charts.line($('[data-c-sales]'), { title: 'Gross sales by month', summary: 'Up 38% on the previous year (demo).', labels: a.months, format: usd, series: [{ name: 'This year', values: a.sales }, { name: 'Previous year', values: a.salesPrev, secondary: true }] });
      M.charts.bars($('[data-c-views]'), { title: 'Product views by month', summary: 'Views peaked in October at 9,100 (demo).', labels: a.months, values: a.views, seriesName: 'Views', format: (v, axis) => (axis ? (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) : num(Math.round(v))) });
      M.charts.line($('[data-c-conv]'), { title: 'Conversion rate by month', summary: 'Conversion rose from 1.9% to 2.6% (demo).', labels: a.months, format: (v) => v.toFixed(1) + '%', series: [{ name: 'Conversion', values: a.conversion }] });
      M.charts.bars($('[data-c-wish]'), { title: 'Wishlist adds by month', summary: 'Wishlist adds grew steadily to 263 in October (demo).', labels: a.months, values: a.wishlistAdds, seriesName: 'Wishlist adds', format: (v) => num(Math.round(v)) });
    }

    /* ---------- Reviews & messages ---------- */
    function reviewsView() {
      const ids = products().map((p) => p.id);
      const revs = D.reviews.filter((r) => ids.includes(r.productId));
      const msgs = D.sellerMessages;
      $('[data-section="reviews"]').innerHTML = head('reviews', 'Reviews &amp; messages', 'Respond to buyer questions and keep an eye on feedback.') +
        '<div class="dash-grid dash-grid--1-1">' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Buyer enquiries</h2><span class="badge badge--new">' + msgs.filter((m) => m.unread).length + ' unread</span></div><ul class="list-plain">' +
            msgs.map((m, i) => '<li class="message-item' + (m.unread ? ' is-unread' : '') + '"><span class="avatar">' + esc(m.from.slice(-4, -1).replace('.', '')) + '</span><div style="min-width:0"><p class="list-row__title">' + esc(m.subject) + '</p><p class="list-row__meta">' + esc(m.from) + ' · ' + esc(M.catalog.byId(m.product).shortName) + ' · ' + fmtDate(m.date) + '</p><p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:6px">' + esc(m.body) + '</p><button type="button" class="btn btn--sm" style="margin-top:10px" data-reply="' + i + '">' + M.icon('send', 'icon--sm') + 'Reply</button></div></li>').join('') + '</ul></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Received reviews</h2><span class="badge badge--demo">sample</span></div><div class="card__body" style="padding-top:0">' +
            revs.map((r) => '<article class="review"><div class="review__head"><p class="review__author">' + esc(r.author) + '</p><span class="text-muted" style="font-size:var(--text-xs)">' + fmtDate(r.date) + '</span></div><p class="text-muted" style="font-size:var(--text-xs)">' + esc(M.catalog.byId(r.productId).shortName) + '</p><div class="rating" style="margin-top:6px" role="img" aria-label="' + r.rating + ' out of 5 stars">' + R.stars(r.rating) + '</div><h3 style="font-size:var(--text-sm);margin-top:6px">' + esc(r.title) + '</h3><p class="review__body">' + esc(r.body) + '</p></article>').join('') + '</div></div>' +
        '</div>';
    }

    /* ---------- Store settings ---------- */
    function settingsView() {
      const st = M.store.get('store-settings', { name: seller.name, tagline: seller.tagline, desc: seller.bio, email: 'support@pixelforge.example', website: seller.social.website, github: seller.social.github || '', dribbble: seller.social.dribbble || '', logo: null, banner: null });
      $('[data-section="settings"]').innerHTML = head('settings', 'Store settings', 'This information appears on your public storefront.', '<a class="btn" href="' + M.catalog.sellerUrl(seller.slug) + '">' + M.icon('external') + 'View public store</a>') +
        '<div class="editor-layout"><form class="card form-section" novalidate data-store-form>' +
          '<div class="form-row form-row--2"><div class="field"><span class="label" id="logo-l">Store logo</span><label class="dropzone" style="padding:18px"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-img="logo" aria-labelledby="logo-l" aria-describedby="logo-h logo-err"><span class="dropzone__icon">' + M.icon('image') + '</span><span class="dropzone__title"><span>Upload logo</span></span><span class="hint" id="logo-h">Square, PNG/JPG/WebP/SVG, max 1 MB</span></label>' + err('logo') + '</div>' +
          '<div class="field"><span class="label" id="banner-l">Banner</span><label class="dropzone" style="padding:18px"><input type="file" accept="image/png,image/jpeg,image/webp" data-img="banner" aria-labelledby="banner-l" aria-describedby="banner-h banner-err"><span class="dropzone__icon">' + M.icon('image') + '</span><span class="dropzone__title"><span>Upload banner</span></span><span class="hint" id="banner-h">1600×360, max 2 MB</span></label>' + err('banner') + '</div></div>' +
          '<div class="field"><label class="label" for="st-name">Store name</label><input class="input" id="st-name" name="name" required maxlength="40" value="' + esc(st.name) + '" data-live aria-describedby="st-name-err">' + err('st-name') + '</div>' +
          '<div class="field"><label class="label" for="st-tagline">Tagline</label><input class="input" id="st-tagline" name="tagline" maxlength="80" value="' + esc(st.tagline) + '" data-live></div>' +
          '<div class="field"><label class="label" for="st-desc">Store description</label><textarea class="textarea" id="st-desc" name="desc" required minlength="40" maxlength="600" data-count="st-desc-count" aria-describedby="st-desc-count st-desc-err">' + esc(st.desc) + '</textarea><p class="hint" id="st-desc-count">' + st.desc.length + ' / 600</p>' + err('st-desc') + '</div>' +
          '<div class="field"><label class="label" for="st-email">Support email</label><input class="input" id="st-email" name="email" type="email" required value="' + esc(st.email) + '" aria-describedby="st-email-hint st-email-err"><p class="hint" id="st-email-hint">Buyers contact you through the marketplace inbox; this is a fallback shown on your support policy.</p>' + err('st-email') + '</div>' +
          '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:12px"><legend class="label" style="margin-bottom:8px">Social links</legend>' + [['website', 'Website', 'globe'], ['github', 'GitHub', 'github'], ['dribbble', 'Dribbble', 'dribbble']].map(([k, l, ic]) => '<div class="field"><label class="sr-only" for="st-' + k + '">' + l + ' URL</label><div class="input-group input-group--prefix"><span class="input-group__prefix">' + M.icon(ic) + '</span><input class="input" id="st-' + k + '" name="' + k + '" type="url" placeholder="https://" value="' + esc(st[k]) + '" aria-describedby="st-' + k + '-err"></div>' + err('st-' + k) + '</div>').join('') + '</fieldset>' +
          '<button type="submit" class="btn btn--primary" style="justify-self:start">Save store settings</button>' +
        '</form>' +
        '<aside class="editor-aside" aria-labelledby="pp-h"><h2 class="label" id="pp-h" style="margin-bottom:10px">Public profile preview</h2><div class="store-preview" data-preview></div><p class="hint" style="margin-top:8px">Updates as you type.</p></aside></div>';
      const imgs = { logo: st.logo, banner: st.banner };
      const form = $('[data-store-form]');
      const preview = () => {
        $('[data-preview]').innerHTML = '<div class="store-preview__banner" style="background-image:url(\'' + (imgs.banner || url(seller.banner)) + '\')"></div><div class="store-preview__body"><img class="store-preview__logo" src="' + (imgs.logo || url(seller.logo)) + '" alt="" width="56" height="56"><p style="font-weight:600;margin-top:8px">' + esc(form.name.value || 'Store name') + '</p><p class="text-muted" style="font-size:var(--text-meta)">' + esc(form.tagline.value) + '</p><p class="text-secondary" style="font-size:var(--text-xs);margin-top:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">' + esc(form.desc.value) + '</p></div>';
      };
      preview();
      form.addEventListener('input', preview);
      form.addEventListener('change', (e) => {
        const inp = e.target.closest('[data-img]');
        if (!inp || !inp.files[0]) return;
        const f = inp.files[0];
        const max = inp.dataset.img === 'logo' ? 1 : 2;
        const errId = inp.dataset.img;
        if (!/^image\//.test(f.type) || f.size > max * 1024 * 1024) {
          inp.dataset.customError = !/^image\//.test(f.type) ? 'Choose a PNG, JPG, WebP' + (errId === 'logo' ? ' or SVG' : '') + ' image.' : 'File is ' + (f.size / 1048576).toFixed(1) + ' MB — the limit is ' + max + ' MB.';
          inp.setAttribute('aria-describedby', errId + '-h ' + errId + '-err');
          M.forms.check(inp); inp.value = ''; delete inp.dataset.customError; return;
        }
        M.forms.show(inp, '');
        imgs[errId] = URL.createObjectURL(f); // local preview only — nothing is uploaded
        preview();
      });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!M.forms.validate(form)) return;
        await M.forms.simulate(form.querySelector('[type=submit]'), 800);
        M.store.set('store-settings', { name: form.name.value, tagline: form.tagline.value, desc: form.desc.value, email: form.email.value, website: form.website.value, github: form.github.value, dribbble: form.dribbble.value, logo: null, banner: null });
        M.toast({ title: 'Store settings saved (demo)', desc: 'Text saved in this browser; images are preview-only.' });
      });
    }

    overview(); productsView(); ordersView(); earningsView(); analyticsView(); reviewsView(); settingsView();
    M.hydrateIcons();
    M.appNav({ default: 'overview', titlePrefix: 'Seller dashboard | Templora', onShow: (k) => { const c = $('[data-ws-crumb]'); if (c) c.textContent = 'Seller workspace / ' + ({ overview: 'Overview', products: 'Products', orders: 'Orders', earnings: 'Earnings & payouts', analytics: 'Analytics', reviews: 'Reviews & messages', settings: 'Store settings' }[k] || ''); } });

    /* ---------- Interactions ---------- */
    const main = $('#ws-main');
    main.addEventListener('click', async (e) => {
      const pf = e.target.closest('[data-pfilter]');
      if (pf) { productFilter = pf.dataset.pfilter; productsView(); const again = main.querySelector('[data-pfilter="' + productFilter + '"]'); if (again) again.focus(); return; }
      const pv = e.target.closest('[data-preview]');
      if (pv) {
        const p = products().find((x) => x.slug === pv.dataset.preview);
        if (p.status === 'published') { location.href = M.catalog.productUrl(p); return; }
        M.dialog({ title: 'Listing preview — ' + p.shortName, size: 'lg', body: '<div style="max-width:320px">' + R.productCard(Object.assign({ images: { main: null }, flags: {}, tools: [], tech: [] }, p)) + '</div><p class="hint" style="margin-top:12px">' + statusPill(p.status) + ' Not visible to buyers until approved.</p>', actions: [{ label: 'Close' }, { label: 'Edit listing', variant: 'primary', onClick: () => { location.href = url('pages/add-product.html?edit=' + p.slug); } }] });
        return;
      }
      const sl = e.target.closest('[data-sales]');
      if (sl) { orderFilter = sl.dataset.sales; ordersView(); location.hash = 'orders'; return; }
      if (e.target.closest('[data-clear-order-filter]')) { orderFilter = null; ordersView(); $('#h-orders').focus(); return; }
      const del = e.target.closest('[data-delete]');
      if (del) {
        const p = products().find((x) => x.slug === del.dataset.delete);
        if (await M.confirm({ title: 'Delete “' + p.shortName + '”?', body: 'This draft and its unsaved files will be permanently removed.', confirmLabel: 'Delete draft', danger: true })) {
          if (p.local) M.store.set('seller-products', localDrafts().filter((x) => x.slug !== p.slug));
          else p.status = 'deleted';
          productsView(); overview();
          M.toast({ title: 'Draft deleted', desc: p.shortName, type: 'info' });
        }
        return;
      }
      if (e.target.closest('[data-request-payout]')) {
        const requested = M.store.get('payout-requests', []).reduce((a, p) => a + p.amount, 0);
        const avail = Math.max(0, available - requested);
        const d = M.dialog({
          title: 'Request a payout', icon: 'wallet', tone: 'info',
          body: '<form class="form" id="payout-form" novalidate><p>Available balance: <strong>' + moneyExact(avail) + '</strong></p><div class="field"><label class="label" for="po-amount">Amount (USD)</label><div class="input-group input-group--prefix"><span class="input-group__prefix">' + M.icon('dollar') + '</span><input class="input" id="po-amount" type="number" inputmode="decimal" min="50" max="' + avail.toFixed(2) + '" step="0.01" required value="' + avail.toFixed(2) + '" data-msg-range-underflow="The minimum payout in this demo is $50." data-msg-range-overflow="You can request up to ' + moneyExact(avail) + '." aria-describedby="po-amount-err"></div>' + err('po-amount') + '</div><p class="demo-note">' + M.icon('alert') + 'Frontend-only. No money will move.</p></form>',
          actions: [{ label: 'Cancel', value: null }, { label: 'Request payout', variant: 'primary', submit: true, form: 'payout-form' }],
        });
        const f = d.el.querySelector('#payout-form');
        f.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          if (!M.forms.validate(f)) return;
          await M.forms.simulate(d.el.querySelector('[type=submit]'), 900);
          const list = M.store.get('payout-requests', []);
          list.push({ amount: +(+f.querySelector('#po-amount').value).toFixed(2), date: new Date().toISOString().slice(0, 10) });
          M.store.set('payout-requests', list);
          d.close(true);
          earningsView(); M.hydrateIcons();
          M.toast({ title: 'Payout request simulated', desc: 'Shown as “Requested” in your transaction history.' });
        });
        return;
      }
      const rp = e.target.closest('[data-reply]');
      if (rp) {
        const m = D.sellerMessages[+rp.dataset.reply];
        const d = M.dialog({
          title: 'Reply to ' + m.from, size: 'lg',
          body: '<blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid var(--color-border-strong);background:var(--color-bg-alt);border-radius:0 8px 8px 0"><p style="font-weight:600;color:var(--color-text)">' + esc(m.subject) + '</p><p style="margin-top:4px">' + esc(m.body) + '</p></blockquote><form class="form" id="reply-form" novalidate><div class="field"><label class="label" for="rp-msg">Your reply</label><textarea class="textarea" id="rp-msg" required minlength="10" aria-describedby="rp-msg-err"></textarea>' + err('rp-msg') + '</div></form>',
          actions: [{ label: 'Cancel', value: null }, { label: 'Send reply', variant: 'primary', submit: true, form: 'reply-form' }],
        });
        const f = d.el.querySelector('#reply-form');
        f.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          if (!M.forms.validate(f)) return;
          await M.forms.simulate(d.el.querySelector('[type=submit]'), 700);
          m.unread = false;
          d.close(true);
          reviewsView(); M.hydrateIcons();
          const unread = D.sellerMessages.filter((x) => x.unread).length;
          document.querySelectorAll('[data-unread]').forEach((b) => { b.textContent = unread; b.hidden = !unread; });
          M.toast({ title: 'Reply sending simulated', desc: 'Nothing was delivered — prototype only.' });
        });
      }
    });
    main.addEventListener('submit', async (e) => {
      if (!e.target.matches('[data-payout-method]')) return;
      e.preventDefault();
      if (!M.forms.validate(e.target)) return;
      await M.forms.simulate(e.target.querySelector('[type=submit]'), 700);
      M.toast({ title: 'Payout settings saved (demo)', desc: 'No payout method is actually configured.' });
    });
  };
})((window.Market = window.Market || {}));
