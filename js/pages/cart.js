/* Cart (WooCommerce cart template). Totals are demo subtotals only. */
(function (M) {
  'use strict';
  M.pages.cart = function () {
    const { $, url, esc, money, moneyExact } = M.util;
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label: 'Cart' }]);
    const root = $('[data-cart-root]');
    let couponState = { code: '', error: '' };

    function render() {
      const lines = M.cart.lines();
      if (!lines.length) {
        root.innerHTML = M.render.emptyState({ icon: 'cart', title: 'Your cart is empty', desc: 'Browse the catalogue and add a template with the license you need.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Explore templates</a>' + (M.wishlist.ids().length ? '<a class="btn" href="' + url('pages/wishlist.html') + '">View wishlist (' + M.wishlist.ids().length + ')</a>' : '') });
        return;
      }
      const unavailable = lines.filter((l) => !l.available);
      const sub = M.cart.subtotal();
      root.innerHTML = '<div class="cart-layout"><div>' +
        (unavailable.length ? '<div class="alert alert--error" role="alert" style="margin-bottom:20px">' + M.icon('alert') + '<div><p class="alert__title">' + unavailable.length + ' item' + (unavailable.length > 1 ? 's are' : ' is') + ' no longer available</p><p class="alert__body">Remove ' + (unavailable.length > 1 ? 'them' : 'it') + ' to continue to checkout. Unavailable items are not included in the total.</p></div></div>' : '') +
        '<h2 class="sr-only">Items in your cart</h2><ul class="list-plain">' + lines.map(lineHTML).join('') + '</ul>' +
        '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:20px"><a class="btn btn--ghost" href="' + url('pages/html-templates.html') + '">' + M.icon('arrow-left') + 'Continue shopping</a>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-demo-unavailable title="Demo control">' + M.icon('alert', 'icon--sm') + 'Demo: add an unavailable item</button></div></div>' +
        '<aside class="summary-sticky" aria-labelledby="summary-h"><div class="card summary"><h2 class="card__title" id="summary-h">Order summary</h2>' +
          '<form class="form" style="gap:8px" novalidate data-coupon><div class="field"><label class="label" for="coupon">Coupon code</label><div style="display:flex;gap:8px"><input class="input" id="coupon" name="coupon" autocomplete="off" value="' + esc(couponState.code) + '" aria-describedby="coupon-err"' + (couponState.error ? ' aria-invalid="true" data-custom-error="' + esc(couponState.error) + '"' : '') + '><button type="submit" class="btn">Apply</button></div>' +
          '<p class="field-error' + (couponState.error ? ' is-visible' : '') + '" id="coupon-err" role="alert">' + M.icon('alert-circle') + '<span>' + esc(couponState.error) + '</span></p></div></form>' +
          '<div class="summary__rows"><div class="summary__row"><span>Subtotal (' + lines.filter((l) => l.available).reduce((a, l) => a + l.qty, 0) + ' licenses)</span><strong>' + moneyExact(sub) + '</strong></div>' +
          '<div class="summary__row"><span>Discount</span><strong>—</strong></div>' +
          '<div class="summary__row"><span>Tax</span><span>Calculated at checkout</span></div></div>' +
          '<div class="summary__total"><span>Total</span><span>' + moneyExact(sub) + '</span></div>' +
          '<p class="hint">Demo total in USD. Applicable taxes are calculated by the payment provider in production.</p>' +
          (unavailable.length ? '<button type="button" class="btn btn--primary btn--lg btn--block" aria-disabled="true" data-blocked>Proceed to checkout</button>' : '<a class="btn btn--primary btn--lg btn--block" href="' + url('pages/checkout.html') + '">Proceed to checkout' + M.icon('arrow-right') + '</a>') +
          '<p class="note-strip" style="justify-content:center">' + M.icon('lock') + 'No payment is taken in this prototype.</p>' +
        '</div></aside></div>';
    }

    function lineHTML(l) {
      const p = l.product;
      if (!p || !l.available) {
        return '<li class="cart-line" data-key="' + esc(l.key) + '"><div class="cart-line__thumb" style="display:grid;place-items:center;color:var(--color-text-muted)">' + M.icon('alert') + '</div><div><div class="cart-line__top"><div><p style="font-weight:600">' + esc(p ? p.name : 'Unknown product') + '</p><p class="status status--error" style="margin-top:6px">Unavailable</p><p class="text-muted" style="font-size:var(--text-meta);margin-top:6px">This product is not currently published by the seller.</p></div>' +
          '<button type="button" class="btn btn--sm btn--danger" data-remove="' + esc(l.key) + '">' + M.icon('trash', 'icon--sm') + 'Remove</button></div></div></li>';
      }
      const s = M.catalog.seller(p.seller);
      const lid = 'lic-' + l.key.replace(/[^a-z0-9]/gi, '');
      return '<li class="cart-line" data-key="' + esc(l.key) + '"><a href="' + M.catalog.productUrl(p) + '" tabindex="-1" aria-hidden="true"><img class="cart-line__thumb" src="' + url(p.images.main) + '" alt="" width="1440" height="900" loading="lazy"></a>' +
        '<div style="min-width:0"><div class="cart-line__top"><div style="min-width:0"><h3 style="font-size:var(--text-body)"><a href="' + M.catalog.productUrl(p) + '">' + esc(p.name) + '</a></h3><p class="text-muted" style="font-size:var(--text-meta);margin-top:2px">by <a class="link" href="' + M.catalog.sellerUrl(s.slug) + '">' + esc(s.name) + '</a> · v' + esc(p.version) + '</p></div>' +
          '<div style="text-align:right"><p style="font-weight:600">' + money(l.total) + '</p>' + (l.qty > 1 ? '<p class="text-muted" style="font-size:var(--text-xs)">' + money(l.unit) + ' each</p>' : '') + '</div></div>' +
        '<div class="cart-line__controls">' +
          (p.licenses.length > 1 && p.price > 0 ? '<div class="field"><label class="label" for="' + lid + '">License</label><select class="select" id="' + lid + '" data-license-select="' + esc(l.key) + '">' + p.licenses.map((x) => '<option value="' + x.id + '"' + (x.id === l.license ? ' selected' : '') + '>' + esc(M.catalog.licenseName(x.id)) + ' — ' + money(x.price) + '</option>').join('') + '</select></div>' : '<p class="badge">' + esc(M.catalog.licenseName(l.license)) + ' license</p>') +
          '<div class="field"><span class="label" id="' + lid + '-q">Licenses</span><div class="qty" role="group" aria-labelledby="' + lid + '-q"><button type="button" data-qty="-1" aria-label="Decrease quantity"' + (l.qty <= 1 ? ' disabled' : '') + '>' + M.icon('minus', 'icon--sm') + '</button><input type="number" min="1" max="' + M.cart.MAX_QTY + '" value="' + l.qty + '" aria-label="Quantity of ' + esc(p.shortName) + ' licenses" data-qty-input><button type="button" data-qty="1" aria-label="Increase quantity"' + (l.qty >= M.cart.MAX_QTY ? ' disabled' : '') + '>' + M.icon('plus', 'icon--sm') + '</button></div></div>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-remove="' + esc(l.key) + '" aria-label="Remove ' + esc(p.shortName) + ' from cart" style="margin-left:auto">' + M.icon('trash', 'icon--sm') + 'Remove</button>' +
        '</div><p class="hint" style="margin-top:8px">Each license covers one end product. ' + (l.qty > 1 ? l.qty + ' licenses = ' + l.qty + ' projects.' : '') + '</p></div></li>';
    }

    root.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        const key = rm.dataset.remove;
        const item = M.cart.items().find((x) => x.key === key);
        const p = item && M.catalog.byId(item.id);
        M.cart.remove(key);
        M.toast({ title: 'Removed from cart', desc: p ? p.shortName : '', type: 'info' });
        return;
      }
      const q = e.target.closest('[data-qty]');
      if (q) {
        const key = q.closest('[data-key]').dataset.key;
        const item = M.cart.items().find((x) => x.key === key);
        M.cart.setQty(key, item.qty + +q.dataset.qty);
        const again = root.querySelector('[data-key="' + CSS.escape(key) + '"] [data-qty="' + q.dataset.qty + '"]');
        if (again) (again.disabled ? root.querySelector('[data-key="' + CSS.escape(key) + '"] [data-qty-input]') : again).focus();
        return;
      }
      if (e.target.closest('[data-demo-unavailable]')) { M.cart.add('p-2001', 'personal'); M.toast({ title: 'Demo: unavailable item added', type: 'info' }); }
      if (e.target.closest('[data-blocked]')) M.toast({ type: 'error', title: 'Remove unavailable items first', desc: 'Checkout is blocked while your cart has items that can’t be purchased.' });
    });
    root.addEventListener('change', (e) => {
      const ls = e.target.closest('[data-license-select]');
      if (ls) { M.cart.setLicense(ls.dataset.licenseSelect, ls.value); M.toast({ title: 'License updated', desc: M.catalog.licenseName(ls.value), duration: 2500 }); }
      const qi = e.target.closest('[data-qty-input]');
      if (qi) M.cart.setQty(qi.closest('[data-key]').dataset.key, qi.value);
    });
    root.addEventListener('submit', async (e) => {
      if (!e.target.matches('[data-coupon]')) return;
      e.preventDefault();
      const code = e.target.coupon.value.trim();
      couponState.code = code;
      if (!code) couponState.error = 'Enter a coupon code to apply.';
      else {
        await M.forms.simulate(e.target.querySelector('button'), 600);
        // No coupons exist in the prototype — never invent a valid code.
        couponState.error = '“' + code + '” isn’t a valid coupon. (Coupons are validated by WooCommerce in production.)';
      }
      render();
      const c = document.getElementById('coupon'); if (c) c.focus();
    });
    M.on('cart', render);
    render();
  };
})((window.Market = window.Market || {}));
