/* Seller registration & onboarding states. Frontend simulation only. */
(function (M) {
  'use strict';
  M.pages.onboarding = function () {
    const { $, url, esc, fmtDate } = M.util;
    const root = $('[data-apply-root]');
    const err = M.forms.errorHTML;
    const STATES = {
      submitted: { label: 'Application submitted', tone: 'info', icon: 'send', desc: 'We’ve received your application. You’ll get an email when review starts.' },
      pending: { label: 'Verification pending', tone: 'warning', icon: 'clock', desc: 'A reviewer is checking your details and portfolio. This usually takes a few business days.' },
      info: { label: 'Additional information required', tone: 'warning', icon: 'alert', desc: 'Please add a link to work you’ve published (portfolio, GitHub or Dribbble) so we can verify ownership.' },
      approved: { label: 'Approved', tone: 'success', icon: 'check-circle', desc: 'Your store is ready. Set up your profile and submit your first product for review.' },
      rejected: { label: 'Not approved', tone: 'error', icon: 'x-circle', desc: 'We couldn’t verify that you own the rights to the submitted work. You can re-apply in 30 days with additional evidence.' },
    };

    function render() {
      const app = M.store.get('seller-app', null);
      if (!app || !app.status || app.status === 'none') return renderForm();
      renderStatus(app);
    }

    function renderForm() {
      const s = M.session.get();
      root.innerHTML = '<div class="card card--pad" style="padding:clamp(20px,4vw,40px)"><h2 class="text-h2" id="apply-h">Seller application</h2><p class="text-secondary" style="margin-top:8px">Takes about 3 minutes. ' + (s ? 'You’re applying as <strong>' + esc(s.email) + '</strong> — selling will be added to this account.' : 'Selling is added to your buyer account — no separate login.') + '</p>' +
        '<form class="form" style="margin-top:24px" novalidate data-apply>' +
          '<div class="alert alert--error" tabindex="-1" data-error-summary hidden role="alert">' + M.icon('alert-circle') + '<div><p class="alert__title" data-error-count></p><ul style="margin:6px 0 0;padding-left:18px;list-style:disc;color:var(--color-text-secondary)"></ul></div></div>' +
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="ap-store">Store name</label><input class="input" id="ap-store" name="store" required minlength="3" maxlength="40" aria-describedby="ap-store-hint ap-store-err"><p class="hint" id="ap-store-hint">Shown on your storefront, e.g. “PixelForge Studio”.</p>' + err('ap-store') + '</div>' +
          '<div class="field"><label class="label" for="ap-display">Display name</label><input class="input" id="ap-display" name="display" required autocomplete="name" value="' + esc(s ? s.name : '') + '" aria-describedby="ap-display-err">' + err('ap-display') + '</div></div>' +
          (s ? '' : '<div class="form-row form-row--2"><div class="field"><label class="label" for="ap-email">Email</label><input class="input" id="ap-email" name="email" type="email" required autocomplete="email" aria-describedby="ap-email-err">' + err('ap-email') + '</div>' +
            '<div class="field"><label class="label" for="ap-pass">Password</label><div class="input-group"><input class="input" id="ap-pass" name="password" type="password" required autocomplete="new-password" data-validate="password" aria-describedby="ap-pass-err">' + M.forms.passwordToggleHTML('ap-pass') + '</div>' + err('ap-pass') + '</div></div>' +
            '<p class="hint" style="margin-top:-8px">Already have an account? <a class="link" href="' + url('pages/login.html') + '">Log in</a> first to apply with it.</p>') +
          '<div class="field"><label class="label" for="ap-desc">Describe your store</label><textarea class="textarea" id="ap-desc" name="desc" required minlength="40" maxlength="600" data-count="ap-desc-count" aria-describedby="ap-desc-hint ap-desc-count ap-desc-err" placeholder="What kind of templates do you make, and who are they for?"></textarea><div style="display:flex;justify-content:space-between;gap:8px"><p class="hint" id="ap-desc-hint">At least 40 characters.</p><p class="hint" id="ap-desc-count">0 / 600</p></div>' + err('ap-desc') + '</div>' +
          '<div class="field"><label class="label" for="ap-portfolio">Portfolio or GitHub URL <span class="label__optional">(optional)</span></label><input class="input" id="ap-portfolio" name="portfolio" type="url" placeholder="https://" aria-describedby="ap-portfolio-err">' + err('ap-portfolio') + '</div>' +
          '<div class="field"><label class="check"><input type="checkbox" id="ap-terms" name="terms" required data-label="Accept the Seller Agreement" data-msg-required="You need to accept the Seller Agreement to apply." aria-describedby="ap-terms-err"><span>I confirm I own or have the rights to sell my templates, and I agree to the <a href="' + url('pages/legal.html?doc=seller') + '" target="_blank">Seller Agreement</a>.</span></label>' + err('ap-terms') + '</div>' +
          '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn btn--primary btn--lg" type="submit">Submit application</button><p class="demo-note">' + M.icon('info') + 'Simulated — nothing is sent.</p></div>' +
        '</form></div>';
      $('[data-apply]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        if (!M.forms.validate(f)) return;
        await M.forms.simulate(f.querySelector('[type=submit]'), 1100);
        const app = { status: 'submitted', store: f.store.value.trim(), display: f.display.value.trim(), email: s ? s.email : f.email.value.trim(), desc: f.desc.value.trim(), date: new Date().toISOString().slice(0, 10) };
        M.store.set('seller-app', app);
        if (s) M.session.update({ seller: 'submitted' }); else M.session.login({ name: app.display, email: app.email, seller: 'submitted' });
        M.toast({ title: 'Application submitted (demo)', desc: app.store });
        render();
        const h = $('#apply-h'); if (h) h.focus();
      });
    }

    function renderStatus(app) {
      const st = STATES[app.status];
      const steps = [
        ['Application submitted', 'send'], ['Verification', 'shield'], [app.status === 'rejected' ? 'Decision: not approved' : app.status === 'info' ? 'More information needed' : 'Approved — store open', app.status === 'rejected' ? 'x-circle' : app.status === 'info' ? 'alert' : 'store'],
      ];
      const CLASSES = { submitted: ['is-done', '', ''], pending: ['is-done', 'is-current', ''], info: ['is-done', 'is-warning', ''], approved: ['is-done', 'is-done', 'is-done'], rejected: ['is-done', 'is-done', 'is-error'] };
      const stepClass = (i) => CLASSES[app.status][i];
      root.innerHTML = '<div class="card status-card" style="padding:clamp(20px,4vw,40px)">' +
        '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><p class="eyebrow">Seller application</p><h2 class="text-h2" id="apply-h" tabindex="-1" style="margin-top:6px">' + esc(app.store) + '</h2><p class="text-muted" style="font-size:var(--text-sm)">Submitted ' + fmtDate(app.date) + ' · ' + esc(app.email) + '</p></div>' +
          '<span class="status status--' + st.tone + '" style="height:32px;font-size:var(--text-sm)">' + st.label + '</span></div>' +
        '<div class="alert alert--' + (st.tone === 'error' ? 'error' : st.tone === 'warning' ? 'warning' : st.tone === 'success' ? 'success' : 'info') + '">' + M.icon(st.icon) + '<div><p class="alert__title">' + st.label + '</p><p class="alert__body">' + st.desc + '</p></div></div>' +
        '<ol class="timeline" aria-label="Application progress">' + steps.map(([t, ic], i) => '<li class="timeline__item ' + stepClass(i) + '"><span class="timeline__dot">' + M.icon(stepClass(i) === 'is-done' ? 'check' : ic) + '</span><div><p class="timeline__title">' + t + '</p><p class="timeline__desc">' + (stepClass(i) === 'is-done' ? 'Complete' : stepClass(i) === 'is-current' ? 'In progress' : stepClass(i) === 'is-warning' ? 'Action needed' : stepClass(i) === 'is-error' ? 'Closed' : 'Not started') + '</p></div></li>').join('') + '</ol>' +
        actionsFor(app) +
        '<fieldset class="demo-controls" style="margin-top:8px"><legend>' + M.icon('info', 'icon--sm') + 'Prototype: preview each onboarding state</legend><div class="state-switch">' +
          Object.entries(STATES).map(([k, v]) => '<button type="button" class="chip" data-state="' + k + '" aria-pressed="' + (k === app.status) + '">' + v.label + '</button>').join('') +
          '<button type="button" class="chip" data-reset>Start over</button></div></fieldset></div>';
    }

    function actionsFor(app) {
      if (app.status === 'approved') return '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--primary btn--lg" href="' + url('pages/seller-dashboard.html') + '">Open seller dashboard</a><a class="btn btn--lg" href="' + url('pages/add-product.html') + '">Submit your first product</a></div>';
      if (app.status === 'info') return '<form class="form" novalidate data-more-info style="gap:12px"><div class="field"><label class="label" for="mi-url">Portfolio, GitHub or Dribbble URL</label><input class="input" id="mi-url" type="url" required placeholder="https://" aria-describedby="mi-url-err">' + err('mi-url') + '</div><button type="submit" class="btn btn--primary" style="justify-self:start">Send information</button></form>';
      if (app.status === 'rejected') return '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="' + url('pages/legal.html?doc=seller') + '">Review the Seller Agreement</a><a class="btn btn--ghost" href="' + url('pages/contact.html') + '">Contact support</a></div>';
      return '<p class="text-secondary" style="font-size:var(--text-sm)">You can keep shopping in the meantime — we’ll email you at each step.</p>';
    }

    function setStatus(status) {
      const app = M.store.get('seller-app', null);
      if (!app) return;
      app.status = status;
      M.store.set('seller-app', app);
      if (M.session.get()) M.session.update({ seller: status });
      render();
      const h = $('#apply-h'); if (h) h.focus();
    }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-state]');
      if (b) setStatus(b.dataset.state);
      if (e.target.closest('[data-reset]')) { M.store.remove('seller-app'); if (M.session.get()) M.session.update({ seller: 'none' }); render(); }
    });
    root.addEventListener('submit', async (e) => {
      if (!e.target.matches('[data-more-info]')) return;
      e.preventDefault();
      if (!M.forms.validate(e.target)) return;
      await M.forms.simulate(e.target.querySelector('[type=submit]'), 800);
      M.toast({ title: 'Information sent (simulated)' });
      setStatus('pending');
    });
    render();
  };
})((window.Market = window.Market || {}));
