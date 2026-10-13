/* Checkout (WooCommerce checkout template).
   PROTOTYPE: no card fields are rendered and no payment is processed. The
   payment section shows where a gateway's hosted/secure fields would mount. */
(function (M) {
  'use strict';
  M.pages.checkout = function () {
    const { $, url, esc, money, moneyExact, wait } = M.util;
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label: 'Cart', href: url('pages/cart.html') }, { label: 'Checkout' }]);
    const root = $('[data-checkout-root]');
    const lines = M.cart.lines();
    const avail = lines.filter((l) => l.available);
    if (!avail.length) {
      root.innerHTML = M.render.emptyState({ icon: 'cart', title: 'There’s nothing to check out', desc: 'Your cart is empty. Add a template to continue.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Explore templates</a>' });
      return;
    }
    if (avail.length !== lines.length) {
      root.innerHTML = M.render.emptyState({ icon: 'alert', error: true, title: 'Some items are unavailable', desc: 'Return to your cart to remove unavailable items before checking out.', actions: '<a class="btn btn--primary" href="' + url('pages/cart.html') + '">Back to cart</a>' });
      return;
    }
    const session = M.session.get() || {};
    const [first, ...rest] = String(session.name || '').split(' ');
    const sub = M.cart.subtotal();
    const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Netherlands', 'Spain', 'Other'];
    const field = (id, label, input, opt) => '<div class="field"><label class="label" for="' + id + '">' + label + (opt ? ' <span class="label__optional">(optional)</span>' : '') + '</label>' + input + (opt ? '' : M.forms.errorHTML(id)) + '</div>';

    root.innerHTML = '<form class="cart-layout" novalidate data-checkout>' +
      '<div style="display:grid;gap:20px">' +
        '<div class="alert alert--error" tabindex="-1" data-error-summary hidden role="alert">' + M.icon('alert-circle') + '<div><p class="alert__title" data-error-count></p><ul style="margin:6px 0 0;padding-left:18px;list-style:disc;color:var(--color-text-secondary)"></ul></div></div>' +
        '<div class="alert alert--error" data-payment-error hidden tabindex="-1" role="alert">' + M.icon('x-circle') + '<div><p class="alert__title">Payment failed (simulated)</p><p class="alert__body">The payment provider declined the transaction. No order was created. Check your details or choose another method and try again.</p></div></div>' +
        (session.email ? '' : '<p class="alert alert--neutral">' + M.icon('user') + '<span>Have an account? <a class="link" href="' + url('pages/login.html?next=checkout') + '">Log in</a> to save this purchase to your downloads. Otherwise we’ll create one with your email.</span></p>') +
        '<fieldset class="card form-section" style="margin:0"><legend class="sr-only">Contact information</legend><h2 class="form-section__title"><span class="form-section__num">1</span>Contact information</h2>' +
          field('co-email', 'Email address', '<input class="input" id="co-email" name="email" type="email" required autocomplete="email" value="' + esc(session.email || '') + '" aria-describedby="co-email-err co-email-hint"><p class="hint" id="co-email-hint">Your receipt and download links will be sent here.</p>') +
          '<div class="form-row form-row--2">' + field('co-first', 'First name', '<input class="input" id="co-first" name="first" required autocomplete="given-name" value="' + esc(first || '') + '" aria-describedby="co-first-err">') + field('co-last', 'Last name', '<input class="input" id="co-last" name="last" required autocomplete="family-name" value="' + esc(rest.join(' ')) + '" aria-describedby="co-last-err">') + '</div>' +
        '</fieldset>' +
        '<fieldset class="card form-section" style="margin:0"><legend class="sr-only">Billing details</legend><h2 class="form-section__title"><span class="form-section__num">2</span>Billing details</h2>' +
          '<div class="form-row form-row--2">' + field('co-country', 'Country / region', '<select class="select" id="co-country" name="country" required autocomplete="country-name" aria-describedby="co-country-err"><option value="">Select a country</option>' + countries.map((c) => '<option>' + c + '</option>').join('') + '</select>') +
          field('co-postal', 'Postal code', '<input class="input" id="co-postal" name="postal" required autocomplete="postal-code" maxlength="12" aria-describedby="co-postal-err">') + '</div>' +
          '<div class="form-row form-row--2">' + field('co-company', 'Company name', '<input class="input" id="co-company" name="company" autocomplete="organization">', true) + field('co-vat', 'VAT / tax ID', '<input class="input" id="co-vat" name="vat" autocomplete="off">', true) + '</div>' +
          '<p class="hint">Applicable taxes are calculated from your billing location by the payment provider in production.</p>' +
        '</fieldset>' +
        '<fieldset class="card form-section" style="margin:0"><legend class="sr-only">Payment method</legend><h2 class="form-section__title"><span class="form-section__num">3</span>Payment method</h2>' +
          '<div style="display:grid;gap:8px" role="radiogroup" aria-label="Payment method">' +
            '<label class="option-card"><input type="radio" name="method" value="card" checked><span class="option-card__body"><span class="option-card__title"><span>Credit or debit card</span>' + M.icon('card') + '</span><span class="option-card__desc">Processed by the payment gateway’s secure hosted fields.</span></span></label>' +
            '<label class="option-card"><input type="radio" name="method" value="paypal"><span class="option-card__body"><span class="option-card__title"><span>PayPal</span>' + M.icon('wallet') + '</span><span class="option-card__desc">You’ll be redirected to complete payment.</span></span></label>' +
          '</div>' +
          '<div class="pay-placeholder" data-pay-placeholder>' + M.icon('lock') + '<div><p style="font-weight:600;color:var(--color-text)">Payment fields placeholder</p><p>The gateway’s secure card fields (e.g. Stripe Elements) mount here in production. This prototype never asks for or stores card numbers.</p></div></div>' +
        '</fieldset>' +
        '<fieldset class="demo-controls"><legend>' + M.icon('info', 'icon--sm') + 'Prototype controls</legend><p class="hint" style="margin-top:-4px">Choose how the simulated payment should respond.</p>' +
          '<label class="check"><input type="radio" name="outcome" value="success" checked><span>Simulate successful payment</span></label><label class="check"><input type="radio" name="outcome" value="fail"><span>Simulate payment failure</span></label></fieldset>' +
      '</div>' +
      '<aside class="summary-sticky" aria-labelledby="co-summary-h"><div class="card summary"><h2 class="card__title" id="co-summary-h">Order summary</h2>' +
        '<ul class="list-plain">' + avail.map((l) => '<li class="list-row"><img class="thumb-sm" src="' + url(l.product.images.main) + '" alt="" width="56" height="35"><div class="list-row__main"><p class="list-row__title">' + esc(l.product.shortName) + '</p><p class="list-row__meta">' + esc(M.catalog.licenseName(l.license)) + ' license' + (l.qty > 1 ? ' × ' + l.qty : '') + '</p></div><strong style="font-weight:600">' + money(l.total) + '</strong></li>').join('') + '</ul>' +
        '<div class="summary__rows"><div class="summary__row"><span>Subtotal</span><strong>' + moneyExact(sub) + '</strong></div><div class="summary__row"><span>Coupon</span><span>None applied</span></div><div class="summary__row"><span>Tax</span><span>Calculated by provider</span></div></div>' +
        '<div class="summary__total"><span>Total (demo)</span><span>' + moneyExact(sub) + '</span></div>' +
        '<div class="field"><label class="check"><input type="checkbox" id="co-terms" name="terms" required data-label="Accept the terms" aria-describedby="co-terms-err" data-msg-required="Please accept the terms and license agreement to place your order."><span>I agree to the <a href="' + url('pages/legal.html?doc=terms') + '" target="_blank">Terms</a>, <a href="' + url('pages/legal.html?doc=license') + '" target="_blank">License Agreement</a> and <a href="' + url('pages/legal.html?doc=refund') + '" target="_blank">Refund Policy</a>.</span></label>' + M.forms.errorHTML('co-terms') + '</div>' +
        '<button type="submit" class="btn btn--primary btn--lg btn--block" data-place>' + M.icon('lock') + 'Place order — ' + moneyExact(sub) + '</button>' +
        '<p class="sr-only" aria-live="assertive" data-processing-status></p>' +
        '<p class="hint" style="text-align:center">Demo checkout — no payment will be taken.</p>' +
      '</div></aside></form>';

    const form = $('[data-checkout]');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'method') $('[data-pay-placeholder] p:last-child').textContent = e.target.value === 'paypal' ? 'In production you’d be redirected to PayPal to approve the payment, then returned here.' : 'The gateway’s secure card fields (e.g. Stripe Elements) mount here in production. This prototype never asks for or stores card numbers.';
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      $('[data-payment-error]').hidden = true;
      if (!M.forms.validate(form)) return;
      const btn = $('[data-place]');
      const status = $('[data-processing-status]');
      btn.classList.add('is-loading'); btn.disabled = true;
      status.textContent = 'Processing payment, please wait.';
      form.querySelectorAll('input, select').forEach((i) => (i.readOnly = true));
      await wait(1600);
      btn.classList.remove('is-loading'); btn.disabled = false;
      form.querySelectorAll('input, select').forEach((i) => (i.readOnly = false));
      if (form.outcome.value === 'fail') {
        status.textContent = 'Payment failed.';
        const err = $('[data-payment-error]');
        err.hidden = false; err.focus(); err.scrollIntoView({ block: 'center' });
        return;
      }
      const order = {
        number: 'DEMO-' + Math.floor(10000 + Math.random() * 89999),
        date: new Date().toISOString().slice(0, 10),
        status: 'completed', demo: true,
        email: form.email.value, name: form.first.value + ' ' + form.last.value,
        method: form.method.value,
        items: avail.map((l) => ({ id: l.id, license: l.license, qty: l.qty, total: l.total })),
        total: sub,
      };
      M.store.set('orders', [order].concat(M.store.get('orders', [])).slice(0, 20));
      M.cart.clear();
      location.href = url('pages/order-confirmation.html?order=' + order.number);
    });
  };
})((window.Market = window.Market || {}));
