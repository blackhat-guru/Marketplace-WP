/* Order received / thank-you page. Always labelled as a demo order. */
(function (M) {
  'use strict';
  M.pages.confirmation = function () {
    const { $, url, esc, money, moneyExact, fmtDate, qs } = M.util;
    const root = $('[data-confirm-root]');
    const orders = M.store.get('orders', []);
    const order = orders.find((o) => o.number === qs('order')) || (qs('order') ? null : orders[0]);
    if (!order) {
      root.innerHTML = M.render.emptyState({ icon: 'receipt', level: 1, title: 'No recent order found', desc: 'Complete the demo checkout to see a confirmation here, or view sample orders in your account.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Browse templates</a><a class="btn" href="' + url('pages/account.html#orders') + '">My orders</a>' });
      return;
    }
    document.title = 'Order ' + order.number + ' confirmed (demo) | Templora';
    root.innerHTML =
      '<div class="confirm-hero"><div class="confirm-hero__icon">' + M.icon('check') + '</div><span class="badge badge--demo">Demo order — no payment taken</span>' +
      '<h1 class="text-h1">Thank you, ' + esc(order.name.split(' ')[0]) + '!</h1><p class="text-secondary" style="max-width:52ch">This simulated order shows what buyers see after a successful payment. A receipt would be emailed to <strong>' + esc(order.email) + '</strong>.</p></div>' +
      '<div class="card" style="margin-top:28px"><div class="card__head"><h2 class="card__title">Order summary</h2><span class="status status--warning">Payment: simulated</span></div>' +
        '<div class="card__body"><dl class="kv" style="grid-template-columns:auto 1fr"><dt>Order number</dt><dd>' + esc(order.number) + '</dd><dt>Date</dt><dd>' + fmtDate(order.date) + '</dd><dt>Payment status</dt><dd>Demo — not charged</dd><dt>Payment method</dt><dd>' + (order.method === 'paypal' ? 'PayPal (placeholder)' : 'Card (placeholder)') + '</dd></dl></div>' +
        '<div style="border-top:1px solid var(--color-border)"><h3 class="sr-only">Purchased products</h3><ul class="list-plain" style="padding:0 20px">' + order.items.map((it) => {
          const p = M.catalog.byId(it.id);
          return '<li class="list-row" style="flex-wrap:wrap"><img class="thumb-sm" src="' + url(p.images.main) + '" alt="" width="56" height="35" style="width:80px"><div class="list-row__main"><p class="list-row__title"><a href="' + M.catalog.productUrl(p) + '">' + esc(p.name) + '</a></p><p class="list-row__meta">' + esc(M.catalog.licenseName(it.license)) + ' license' + (it.qty > 1 ? ' × ' + it.qty : '') + ' · v' + esc(p.version) + '</p></div><strong>' + money(it.total) + '</strong>' +
            '<button type="button" class="btn btn--sm" data-download="' + p.id + '">' + M.icon('download', 'icon--sm') + 'Download</button></li>';
        }).join('') + '</ul></div>' +
        '<div class="card__body" style="border-top:1px solid var(--color-border)"><div class="summary__total" style="border:0;padding:0"><span>Total (demo)</span><span>' + moneyExact(order.total) + '</span></div></div></div>' +
      '<div class="alert alert--info" style="margin-top:20px">' + M.icon('shield') + '<div><p class="alert__title">How downloads work in production</p><p class="alert__body">Files are only released after the payment provider confirms payment, through short-lived signed links tied to your account. The buttons above are disabled placeholders.</p></div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:28px"><a class="btn btn--primary" href="' + url('pages/account.html#downloads') + '">' + M.icon('download') + 'My downloads</a><a class="btn" href="' + url('pages/account.html') + '">Go to my account</a><a class="btn btn--ghost" href="' + url('pages/html-templates.html') + '">Continue browsing</a></div>';
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-download]');
      if (b) M.demoNotice('Download unavailable in the prototype', 'In production this generates a secure, time-limited link after verifying your purchase. No files are hosted in this demo.');
    });
  };
})((window.Market = window.Market || {}));
