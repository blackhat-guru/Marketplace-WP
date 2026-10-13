/* Customer dashboard (WooCommerce My Account endpoints). */
(function (M) {
  'use strict';
  M.pages.account = function () {
    const { $, url, esc, money, moneyExact, fmtDate } = M.util;
    const R = M.render;
    const session = M.session.get();
    const user = session || M.data.customer;
    const err = M.forms.errorHTML;

    if (!session) {
      $('[data-demo-banner]').innerHTML = '<div class="alert alert--warning" style="margin-bottom:24px">' + M.icon('info') + '<div><p class="alert__title">You’re viewing a sample account</p><p class="alert__body">Not logged in, so the demo customer “' + esc(user.name) + '” is shown. <a class="link" href="' + url('pages/login.html') + '">Log in</a> to see your own demo session.</p></div></div>';
    }
    $('[data-profile-chip]').innerHTML = '<span class="avatar" style="width:40px;height:40px">' + esc(M.session.initials(user.name)) + '</span><div style="min-width:0"><p style="font-weight:600;font-size:var(--text-sm)">' + esc(user.name) + '</p><p class="text-muted" style="font-size:var(--text-xs);overflow:hidden;text-overflow:ellipsis">' + esc(user.email) + '</p></div>';
    const sellerStatus = (session && session.seller) || 'none';
    $('[data-seller-promo]').innerHTML = sellerStatus === 'approved'
      ? '<p style="font-weight:600;font-size:var(--text-sm)">Seller workspace</p><a class="btn btn--sm btn--dark btn--block" style="margin-top:10px" href="' + url('pages/seller-dashboard.html') + '">Open dashboard</a>'
      : '<p style="font-weight:600;font-size:var(--text-sm)">Sell your templates</p><p class="text-muted" style="font-size:var(--text-xs);margin-top:4px">Use this same account to open a store.</p><a class="btn btn--sm btn--block" style="margin-top:10px" href="' + url('pages/seller-onboarding.html') + '">' + (sellerStatus === 'none' ? 'Become a seller' : 'View application') + '</a>';

    // Orders = orders placed in this browser's demo checkout + sample history.
    const placed = M.store.get('orders', []).map((o) => Object.assign({}, o, { total: o.total }));
    const sample = M.data.customerOrders.map((o) => Object.assign({}, o, { sample: true, total: o.items.reduce((a, i) => a + M.catalog.priceFor(M.catalog.byId(i.id), i.license) * i.qty, 0) }));
    const orders = placed.concat(sample);
    const statusPill = (s) => ({ completed: '<span class="status status--success">Completed</span>', refunded: '<span class="status status--neutral">Refunded</span>', pending: '<span class="status status--warning">Pending payment</span>' }[s] || s);
    const downloads = [];
    orders.forEach((o) => o.items.forEach((i) => { if (!downloads.some((d) => d.id === i.id)) downloads.push({ id: i.id, license: i.license, order: o }); }));

    const head = (id, title, desc, action) => '<div class="app-main__head"><div><h1 class="app-main__title" id="h-' + id + '">' + title + '</h1>' + (desc ? '<p class="app-main__desc">' + desc + '</p>' : '') + '</div>' + (action || '') + '</div>';

    /* Overview */
    function overview() {
      const wl = M.wishlist.ids().map(M.catalog.byId);
      $('[data-section="overview"]').innerHTML = head('overview', 'Welcome back, ' + esc(user.name.split(' ')[0]), 'Here’s a summary of your recent activity.') +
        '<div class="stat-grid" style="margin-bottom:20px">' +
          '<div class="stat"><p class="stat__label">' + M.icon('receipt') + 'Orders</p><p class="stat__value">' + orders.length + '</p></div>' +
          '<div class="stat"><p class="stat__label">' + M.icon('download') + 'Available downloads</p><p class="stat__value">' + downloads.filter((d) => d.order.status === 'completed').length + '</p></div>' +
          '<div class="stat"><p class="stat__label">' + M.icon('heart') + 'Wishlist</p><p class="stat__value">' + wl.length + '</p></div>' +
          '<div class="stat"><p class="stat__label">' + M.icon('help') + 'Open requests</p><p class="stat__value">' + M.data.supportTickets.filter((t) => t.status === 'open').length + '</p></div>' +
        '</div>' +
        '<div class="dash-grid dash-grid--1-1">' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Recent purchases</h2><a class="link" style="font-size:var(--text-sm)" href="#orders">All orders</a></div><ul class="list-plain" style="padding:0 20px">' +
            orders.slice(0, 3).map((o) => '<li class="list-row"><div class="list-row__main"><p class="list-row__title">' + esc(o.number) + (o.sample ? ' <span class="badge badge--demo" style="height:18px">sample</span>' : ' <span class="badge badge--demo" style="height:18px">demo</span>') + '</p><p class="list-row__meta">' + fmtDate(o.date) + ' · ' + o.items.length + ' item' + (o.items.length > 1 ? 's' : '') + '</p></div>' + statusPill(o.status) + '</li>').join('') + '</ul></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Recent downloads</h2><a class="link" style="font-size:var(--text-sm)" href="#downloads">All downloads</a></div><ul class="list-plain" style="padding:0 20px">' +
            downloads.slice(0, 3).map((d) => { const p = M.catalog.byId(d.id); return '<li class="list-row"><img class="thumb-sm" src="' + url(p.images.main) + '" alt="" width="56" height="35"><div class="list-row__main"><p class="list-row__title">' + esc(p.shortName) + '</p><p class="list-row__meta">v' + esc(p.version) + ' · ' + esc(M.catalog.licenseName(d.license)) + '</p></div></li>'; }).join('') + '</ul></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Wishlist</h2><a class="link" style="font-size:var(--text-sm)" href="#wishlist">View all</a></div><div class="card__body">' +
            (wl.length ? '<ul class="list-plain">' + wl.slice(0, 3).map((p) => '<li class="list-row"><img class="thumb-sm" src="' + url(p.images.main) + '" alt="" width="56" height="35"><div class="list-row__main"><a class="list-row__title" href="' + M.catalog.productUrl(p) + '">' + esc(p.shortName) + '</a><p class="list-row__meta">' + money(p.price) + '</p></div></li>').join('') + '</ul>' : '<p class="text-muted" style="font-size:var(--text-sm)">No saved templates yet. <a class="link" href="' + url('pages/html-templates.html') + '">Explore templates</a></p>') + '</div></div>' +
          '<div class="card"><div class="card__head"><h2 class="card__title">Account activity</h2></div><ul class="list-plain" style="padding:0 20px">' +
            [['log-in', 'Signed in on this browser', 'Today'], ['download', 'Downloaded Nova v2.3.0', fmtDate('2026-09-29')], ['star', 'Reviewed PortfolioX', fmtDate('2026-09-02')], ['user', 'Account created', fmtDate(M.data.customer.joined)]].map(([i, t, d]) => '<li class="list-row"><span class="usecase__icon" style="width:32px;height:32px">' + M.icon(i, 'icon--sm') + '</span><div class="list-row__main"><p class="list-row__title">' + t + '</p><p class="list-row__meta">' + d + ' · sample activity</p></div></li>').join('') + '</ul></div>' +
        '</div>';
    }

    /* Orders */
    function ordersView() {
      $('[data-section="orders"]').innerHTML = head('orders', 'My orders', 'Orders placed with the demo checkout appear first; others are sample history.') +
        (orders.length ? '<div class="table-wrap"><table class="data-table data-table--stack"><caption class="sr-only">Order history</caption><thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col">Payment</th><th scope="col" class="num">Total</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
          orders.map((o, i) => '<tr><td class="cell-primary" data-label="Order"><span class="data-table__title">' + esc(o.number) + '</span> <span class="badge badge--demo" style="height:18px">' + (o.sample ? 'sample' : 'demo') + '</span></td><td data-label="Date">' + fmtDate(o.date) + '</td><td data-label="Items">' + o.items.map((it) => esc(M.catalog.byId(it.id).shortName)).join(', ') + '</td><td data-label="Payment">' + statusPill(o.status) + '</td><td class="num" data-label="Total">' + moneyExact(o.total) + '</td>' +
            '<td data-label="Actions"><div class="row-actions"><button type="button" class="btn btn--sm" data-order="' + i + '">Details</button><button type="button" class="btn btn--sm btn--ghost" data-invoice="' + i + '" aria-label="Invoice for ' + esc(o.number) + '">' + M.icon('file-text', 'icon--sm') + 'Invoice</button></div></td></tr>').join('') + '</tbody></table></div>'
          : R.emptyState({ icon: 'receipt', title: 'No orders yet', desc: 'When you buy a template it will appear here.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Explore templates</a>' }));
    }

    /* Downloads */
    function downloadsView() {
      $('[data-section="downloads"]').innerHTML = head('downloads', 'My downloads', 'Latest versions of the templates you own. Links are generated securely in production.') +
        '<div class="table-wrap"><table class="data-table data-table--stack"><caption class="sr-only">Downloads</caption><thead><tr><th scope="col">Product</th><th scope="col">Version</th><th scope="col">License</th><th scope="col">Updates</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
        downloads.map((d) => {
          const p = M.catalog.byId(d.id);
          const ok = d.order.status === 'completed';
          const updated = p.updated > d.order.date;
          return '<tr><td class="cell-primary"><div class="data-table__product"><img src="' + url(p.images.main) + '" alt="" width="64" height="40"><div><a class="data-table__title" href="' + M.catalog.productUrl(p) + '">' + esc(p.name) + '</a><p class="text-muted" style="font-size:var(--text-xs)">Order ' + esc(d.order.number) + '</p></div></div></td>' +
            '<td data-label="Version">v' + esc(p.version) + '</td><td data-label="License">' + esc(M.catalog.licenseName(d.license)) + '</td>' +
            '<td data-label="Updates">' + (updated ? '<span class="status status--info">Update available</span>' : '<span class="text-muted">Up to date</span>') + '</td>' +
            '<td data-label="Status">' + (ok ? '<span class="status status--success">Available</span>' : '<span class="status status--neutral">Unavailable — refunded</span>') + '</td>' +
            '<td data-label="Actions"><div class="row-actions"><button type="button" class="btn btn--sm ' + (ok ? 'btn--primary' : '') + '" data-dl="' + p.id + '"' + (ok ? '' : ' disabled') + '>' + M.icon('download', 'icon--sm') + 'Download</button></div></td></tr>';
        }).join('') + '</tbody></table></div>';
    }

    /* Wishlist */
    function wishlistView() {
      const wl = M.wishlist.ids().map(M.catalog.byId);
      $('[data-section="wishlist"]').innerHTML = head('wishlist', 'Wishlist', wl.length + ' saved template' + (wl.length === 1 ? '' : 's'), '<a class="btn" href="' + url('pages/wishlist.html') + '">Open full wishlist</a>') +
        (wl.length ? '<div class="product-grid">' + wl.map((p) => R.productCard(p, { headingLevel: 2 })).join('') + '</div>' : R.emptyState({ icon: 'heart', title: 'Nothing saved yet', desc: 'Use the heart on any template to save it here.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Explore templates</a>' }));
    }

    /* Reviews */
    function reviewsView() {
      const mine = M.store.get('my-reviews', [{ productId: 'p-1003', rating: 5, title: 'Exactly what I needed', body: 'Got my portfolio online in an evening.', date: '2026-09-02', sample: true }]);
      const owned = downloads.filter((d) => d.order.status === 'completed').map((d) => M.catalog.byId(d.id));
      const eligible = owned.filter((p) => !mine.some((r) => r.productId === p.id));
      const stars = (n) => '<span role="img" aria-label="' + n + ' out of 5 stars">' + R.stars(n) + '</span>';
      $('[data-section="reviews"]').innerHTML = head('reviews', 'Reviews', 'Review templates you’ve purchased. Reviews are moderated before publishing in production.') +
        '<div class="dash-grid dash-grid--1-1"><div class="card"><div class="card__head"><h2 class="card__title">Your reviews</h2></div><div class="card__body" style="padding-top:0">' +
          (mine.length ? mine.map((r) => { const p = M.catalog.byId(r.productId); return '<article class="review"><div class="review__head"><p class="review__author">' + esc(p.shortName) + '</p><span class="status ' + (r.sample ? 'status--success">Published' : 'status--warning">Pending moderation') + '</span></div><div class="rating" style="margin-top:6px">' + stars(r.rating) + '</div><h3 style="font-size:var(--text-sm);margin-top:8px">' + esc(r.title) + '</h3><p class="review__body">' + esc(r.body) + '</p><p class="hint" style="margin-top:6px">' + fmtDate(r.date) + (r.sample ? ' · sample' : ' · saved in this browser') + '</p></article>'; }).join('') : '<p class="text-muted" style="padding-top:16px">No reviews yet.</p>') +
        '</div></div>' +
        '<div class="card card--pad"><h2 class="card__title">Write a review</h2>' +
          (eligible.length ? '<p class="text-muted" style="font-size:var(--text-sm);margin-top:4px">Only verified buyers can review.</p><form class="form" style="margin-top:16px" novalidate data-review-form>' +
            '<div class="field"><label class="label" for="rv-product">Template</label><select class="select" id="rv-product" name="product" required aria-describedby="rv-product-err"><option value="">Choose a purchased template</option>' + eligible.map((p) => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select>' + err('rv-product') + '</div>' +
            '<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:6px">Rating</legend><div class="star-input">' + [5, 4, 3, 2, 1].map((n) => '<input type="radio" name="rating" id="rv-r' + n + '" value="' + n + '"' + (n === 5 ? ' required aria-describedby="rv-r5-err" data-label="Rating" data-msg-required="Choose a star rating."' : '') + '><label for="rv-r' + n + '" title="' + n + ' star' + (n > 1 ? 's' : '') + '">' + M.icon('star') + '<span class="sr-only">' + n + ' star' + (n > 1 ? 's' : '') + '</span></label>').join('') + '</div>' + err('rv-r5') + '</fieldset>' +
            '<div class="field"><label class="label" for="rv-title">Title</label><input class="input" id="rv-title" name="title" required maxlength="80" aria-describedby="rv-title-err">' + err('rv-title') + '</div>' +
            '<div class="field"><label class="label" for="rv-body">Your review</label><textarea class="textarea" id="rv-body" name="body" required minlength="30" maxlength="1500" data-count="rv-count" aria-describedby="rv-count rv-body-err"></textarea><p class="hint" id="rv-count">0 / 1500</p>' + err('rv-body') + '</div>' +
            '<button class="btn btn--primary" type="submit" style="justify-self:start">Submit review</button></form>'
            : '<p class="text-muted" style="font-size:var(--text-sm);margin-top:8px">You’ve reviewed every template you own. Thank you!</p>') +
        '</div></div>';
      const f = $('[data-review-form]');
      if (f) f.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!M.forms.validate(f)) return;
        await M.forms.simulate(f.querySelector('[type=submit]'), 800);
        mine.unshift({ productId: f.product.value, rating: +f.rating.value, title: f.title.value, body: f.body.value, date: new Date().toISOString().slice(0, 10) });
        M.store.set('my-reviews', mine);
        M.toast({ title: 'Review submitted for moderation', desc: 'Saved in this browser only (demo).' });
        reviewsView();
        $('#h-reviews').focus();
      });
    }

    /* Support */
    function supportView() {
      const tickets = M.store.get('tickets', []).concat(M.data.supportTickets);
      $('[data-section="support"]').innerHTML = head('support', 'Support requests', 'Product questions go to the seller; account and billing questions go to Templora.', '<button type="button" class="btn btn--primary" data-new-ticket>' + M.icon('plus') + 'New request</button>') +
        '<div class="card"><div class="accordion" style="border-top:0">' + tickets.map((t, i) => {
          const p = t.product && M.catalog.byId(t.product);
          return '<div class="accordion__item" style="padding:0 20px"><button type="button" class="accordion__trigger" data-disclosure aria-expanded="' + (i === 0) + '" aria-controls="tk-' + i + '"><span style="display:grid;gap:2px"><span>' + esc(t.subject) + '</span><span class="text-muted" style="font-size:var(--text-xs);font-weight:400">' + esc(t.id) + (p ? ' · ' + esc(p.shortName) : ' · Account') + ' · Updated ' + fmtDate(t.updated) + '</span></span><span style="display:flex;align-items:center;gap:12px">' + (t.status === 'open' ? '<span class="status status--info">Open</span>' : t.status === 'awaiting' ? '<span class="status status--warning">Awaiting reply</span>' : '<span class="status status--success">Resolved</span>') + M.icon('chevron-down') + '</span></button>' +
            '<div class="accordion__panel" id="tk-' + i + '"' + (i === 0 ? '' : ' hidden') + '><ol class="list-plain" style="display:grid;gap:12px">' + t.messages.map((m) => '<li style="padding:12px 14px;border-radius:10px;background:' + (m.from === 'You' ? 'var(--color-primary-soft)' : 'var(--color-bg-alt)') + '"><p style="font-weight:600;color:var(--color-text);font-size:var(--text-meta)">' + esc(m.from) + ' · <span class="text-muted" style="font-weight:400">' + fmtDate(m.date) + '</span></p><p style="margin-top:4px">' + esc(m.body) + '</p></li>').join('') + '</ol></div></div>';
        }).join('') + '</div></div>';
    }

    /* Profile */
    function profileView() {
      $('[data-section="profile"]').innerHTML = head('profile', 'Profile settings', 'Manage your personal details, password and account.') +
        '<div style="display:grid;gap:20px;max-width:760px">' +
        '<form class="card form-section" novalidate data-profile-form><h2 class="card__title">Personal details</h2><div class="form-row form-row--2">' +
          '<div class="field"><label class="label" for="pf-name">Full name</label><input class="input" id="pf-name" name="name" required autocomplete="name" value="' + esc(user.name) + '" aria-describedby="pf-name-err">' + err('pf-name') + '</div>' +
          '<div class="field"><label class="label" for="pf-email">Email</label><input class="input" id="pf-email" name="email" type="email" required autocomplete="email" value="' + esc(user.email) + '" aria-describedby="pf-email-hint pf-email-err"><p class="hint" id="pf-email-hint">Changing email requires re-verification in production.</p>' + err('pf-email') + '</div></div>' +
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pf-company">Company <span class="label__optional">(optional)</span></label><input class="input" id="pf-company" autocomplete="organization"></div><div class="field"><label class="label" for="pf-vat">VAT / tax ID <span class="label__optional">(optional)</span></label><input class="input" id="pf-vat"></div></div>' +
          '<button class="btn btn--primary" type="submit" style="justify-self:start">Save changes</button></form>' +
        '<form class="card form-section" novalidate data-password-form><h2 class="card__title">Change password</h2>' +
          '<div class="field"><label class="label" for="pw-current">Current password</label><div class="input-group"><input class="input" id="pw-current" type="password" required autocomplete="current-password" aria-describedby="pw-current-err">' + M.forms.passwordToggleHTML('pw-current') + '</div>' + err('pw-current') + '</div>' +
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pw-new">New password</label><div class="input-group"><input class="input" id="pw-new" type="password" required autocomplete="new-password" data-validate="password" aria-describedby="pw-new-err">' + M.forms.passwordToggleHTML('pw-new') + '</div>' + err('pw-new') + '</div>' +
          '<div class="field"><label class="label" for="pw-confirm">Confirm new password</label><div class="input-group"><input class="input" id="pw-confirm" type="password" required autocomplete="new-password" data-match="#pw-new" data-msg-match="Passwords don’t match." aria-describedby="pw-confirm-err">' + M.forms.passwordToggleHTML('pw-confirm') + '</div>' + err('pw-confirm') + '</div></div>' +
          '<button class="btn" type="submit" style="justify-self:start">Update password</button></form>' +
        '<div class="card form-section"><h2 class="card__title">Account details</h2><dl class="kv" style="max-width:420px"><dt>Member since</dt><dd>' + fmtDate(M.data.customer.joined) + '</dd><dt>Account type</dt><dd>Buyer' + (sellerStatus === 'approved' ? ' &amp; seller' : '') + '</dd><dt>Seller status</dt><dd>' + esc(sellerStatus) + '</dd></dl></div>' +
        '<div class="card form-section" style="border-color:#f2c6c2"><h2 class="card__title" style="color:var(--color-error)">Delete account</h2><p class="text-secondary" style="font-size:var(--text-sm)">Request permanent deletion of your account and personal data. Purchased licenses remain valid, but you’ll lose access to downloads and updates.</p><button type="button" class="btn btn--danger" style="justify-self:start" data-delete-account>' + M.icon('trash') + 'Request account deletion</button></div>' +
        '</div>';
      $('[data-profile-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!M.forms.validate(e.target)) return;
        await M.forms.simulate(e.target.querySelector('[type=submit]'), 800);
        if (session) M.session.update({ name: e.target.name.value, email: e.target.email.value });
        M.toast({ title: 'Profile saved', desc: session ? 'Updated your demo session.' : 'Demo account — changes not stored.' });
      });
      $('[data-password-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!M.forms.validate(e.target)) return;
        await M.forms.simulate(e.target.querySelector('[type=submit]'), 800);
        e.target.reset();
        M.toast({ title: 'Password change simulated', desc: 'No credentials are stored in the prototype.' });
      });
    }

    overview(); ordersView(); downloadsView(); wishlistView(); reviewsView(); supportView(); profileView();
    M.hydrateIcons();
    M.on('wishlist', () => { wishlistView(); overview(); });
    M.appNav({ default: 'overview', titlePrefix: 'My account | Templora' });

    document.getElementById('main').addEventListener('click', async (e) => {
      const ob = e.target.closest('[data-order]');
      if (ob) {
        const o = orders[+ob.dataset.order];
        M.dialog({ title: 'Order ' + o.number, size: 'lg', body: '<p style="margin-bottom:12px">' + fmtDate(o.date) + ' · ' + statusPill(o.status) + ' <span class="badge badge--demo">' + (o.sample ? 'sample order' : 'demo order') + '</span></p><ul class="list-plain">' + o.items.map((it) => { const p = M.catalog.byId(it.id); return '<li class="list-row"><img class="thumb-sm" src="' + url(p.images.main) + '" alt="" width="56" height="35"><div class="list-row__main"><p class="list-row__title">' + esc(p.name) + '</p><p class="list-row__meta">' + esc(M.catalog.licenseName(it.license)) + ' license × ' + it.qty + '</p></div><strong>' + money(M.catalog.priceFor(p, it.license) * it.qty) + '</strong></li>'; }).join('') + '</ul><div class="summary__total" style="margin-top:12px"><span>Total</span><span>' + moneyExact(o.total) + '</span></div>', actions: [{ label: 'Close' }] });
      }
      if (e.target.closest('[data-invoice]')) M.demoNotice('Invoice placeholder', 'Invoices are generated as PDFs by WooCommerce (or an invoicing plugin) in production.');
      if (e.target.closest('[data-dl]')) M.demoNotice('Download unavailable in the prototype', 'Production downloads use short-lived signed links after verifying your purchase. No files are hosted in this demo.');
      if (e.target.closest('[data-delete-account]')) {
        const ok = await M.confirm({ title: 'Request account deletion?', body: 'We’ll email you to confirm within 30 days. This prototype won’t delete anything.', confirmLabel: 'Request deletion', danger: true });
        if (ok) M.toast({ title: 'Deletion request simulated', desc: 'In production you would receive a confirmation email.', type: 'info' });
      }
      if (e.target.closest('[data-new-ticket]')) {
        const d = M.dialog({
          title: 'New support request',
          body: '<form class="form" id="ticket-form" novalidate><div class="field"><label class="label" for="tk-about">About</label><select class="select" id="tk-about" name="about"><option value="">Account or billing</option>' + downloads.map((x) => '<option value="' + x.id + '">' + esc(M.catalog.byId(x.id).shortName) + ' (goes to seller)</option>').join('') + '</select></div>' +
            '<div class="field"><label class="label" for="tk-subject">Subject</label><input class="input" id="tk-subject" name="subject" required maxlength="100" aria-describedby="tk-subject-err">' + err('tk-subject') + '</div>' +
            '<div class="field"><label class="label" for="tk-msg">Message</label><textarea class="textarea" id="tk-msg" name="msg" required minlength="20" aria-describedby="tk-msg-err"></textarea>' + err('tk-msg') + '</div></form>',
          actions: [{ label: 'Cancel', value: null }, { label: 'Submit request', variant: 'primary', submit: true, form: 'ticket-form' }],
        });
        const f = d.el.querySelector('#ticket-form');
        f.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          if (!M.forms.validate(f)) return;
          await M.forms.simulate(d.el.querySelector('[type=submit]'), 700);
          const list = M.store.get('tickets', []);
          list.unshift({ id: 'T-' + Math.floor(3000 + Math.random() * 999), subject: f.subject.value, product: f.about.value || null, status: 'awaiting', updated: new Date().toISOString().slice(0, 10), messages: [{ from: 'You', date: new Date().toISOString().slice(0, 10), body: f.msg.value }] });
          M.store.set('tickets', list);
          d.close(true);
          supportView();
          M.toast({ title: 'Request created (demo)', desc: 'Saved in this browser only.' });
        });
      }
    });
  };
})((window.Market = window.Market || {}));
