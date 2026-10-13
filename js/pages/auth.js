/* Login, registration, email verification, forgot & reset password.
   Authentication is SIMULATED — a demo session is stored in localStorage. */
(function (M) {
  'use strict';
  M.pages.auth = function () {
    const { $, url, esc, qs, wait } = M.util;
    const mode = document.getElementById('main').dataset.auth;
    const card = $('[data-auth-card]');
    const err = M.forms.errorHTML;
    const pwToggle = M.forms.passwordToggleHTML;
    const next = qs('next') === 'checkout' ? 'pages/checkout.html' : 'pages/account.html';
    const legal = '<p class="hint" style="text-align:center">By continuing you agree to the <a class="link" href="' + url('pages/legal.html?doc=terms') + '">Terms</a> and <a class="link" href="' + url('pages/legal.html?doc=privacy') + '">Privacy Policy</a>.</p>';
    const demoNote = '<p class="demo-note" style="justify-content:center">' + M.icon('info') + 'Demo: any email and an 8+ character password with a number works. Use <strong>&nbsp;error@example.com&nbsp;</strong> to see a failed login.</p>';
    const alertBox = '<div class="alert alert--error" data-form-alert hidden tabindex="-1" role="alert">' + M.icon('alert-circle') + '<div><p class="alert__title" data-alert-title></p><p class="alert__body" data-alert-body></p></div></div>';
    const showAlert = (t, b) => { const a = $('[data-form-alert]'); a.hidden = false; $('[data-alert-title]').textContent = t; $('[data-alert-body]').textContent = b; a.focus(); };
    const head = (title, sub) => '<a class="logo" href="' + url('index.html') + '" style="margin-bottom:28px">' + M.LOGO + '<span>Templora</span></a><h1 class="auth__title">' + title + '</h1><p class="text-secondary" style="margin-top:6px;margin-bottom:24px">' + sub + '</p>';
    const stateView = (icon, tone, title, body, actions) => '<div style="text-align:center;display:grid;justify-items:center;gap:12px"><div class="modal__icon modal__icon--' + tone + '" style="width:60px;height:60px;border-radius:18px">' + M.icon(icon, 'icon--lg') + '</div><h1 class="auth__title" tabindex="-1" data-focus>' + title + '</h1><p class="text-secondary">' + body + '</p><div style="display:grid;gap:8px;width:100%;margin-top:8px">' + actions + '</div></div>';
    const focusState = () => { const h = $('[data-focus]'); if (h) h.focus(); };

    if (mode === 'login') {
      card.innerHTML = head('Welcome back', 'Log in to access your purchases and downloads.') +
        '<form class="form" novalidate data-form>' + alertBox +
        '<div class="field"><label class="label" for="email">Email address</label><input class="input" id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err">' + err('email') + '</div>' +
        '<div class="field"><div style="display:flex;justify-content:space-between;align-items:baseline"><label class="label" for="password">Password</label><a class="link" style="font-size:var(--text-meta)" href="' + url('pages/forgot-password.html') + '">Forgot password?</a></div><div class="input-group"><input class="input" id="password" name="password" type="password" autocomplete="current-password" required aria-describedby="password-err">' + pwToggle('password') + '</div>' + err('password') + '</div>' +
        '<label class="check"><input type="checkbox" name="remember"><span>Keep me logged in on this device</span></label>' +
        '<button class="btn btn--primary btn--lg btn--block" type="submit">Log in</button></form>' +
        '<p style="text-align:center;margin-top:20px;font-size:var(--text-sm)">New to Templora? <a class="link" href="' + url('pages/register.html' + (qs('next') ? '?next=' + qs('next') : '')) + '">Create an account</a></p>' +
        '<div style="margin-top:20px;display:grid;gap:10px">' + demoNote + legal + '</div>';
      $('[data-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        $('[data-form-alert]').hidden = true;
        if (!M.forms.validate(f)) return;
        await M.forms.simulate(f.querySelector('[type=submit]'), 900);
        if (f.email.value.toLowerCase() === 'error@example.com' || f.password.value.length < 8) {
          return showAlert('Incorrect email or password', 'Check your details and try again, or reset your password. (Simulated error.)');
        }
        const name = f.email.value.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        M.session.login({ name, email: f.email.value, seller: (M.store.get('seller-app', {}) || {}).status || 'none' });
        M.toast({ title: 'Logged in (demo session)', desc: 'Welcome back, ' + name });
        await wait(500);
        location.href = url(next);
      });
    }

    if (mode === 'register') {
      card.innerHTML = head('Create your account', 'One account to buy templates — and to sell them once your seller application is approved.') +
        '<form class="form" novalidate data-form>' + alertBox +
        '<div class="field"><label class="label" for="name">Full name</label><input class="input" id="name" name="name" autocomplete="name" required minlength="2" aria-describedby="name-err">' + err('name') + '</div>' +
        '<div class="field"><label class="label" for="email">Email address</label><input class="input" id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err">' + err('email') + '</div>' +
        '<div class="field"><label class="label" for="password">Password</label><div class="input-group"><input class="input" id="password" name="password" type="password" autocomplete="new-password" required data-validate="password" data-strength="pw-strength" aria-describedby="password-hint password-err">' + pwToggle('password') + '</div><div class="strength" id="pw-strength" data-score="0" aria-hidden="true"><span></span><span></span><span></span><span></span></div><p class="hint" id="password-hint" aria-live="polite">8+ characters with at least one letter and one number.</p>' + err('password') + '</div>' +
        '<div class="field"><label class="label" for="confirm">Confirm password</label><div class="input-group"><input class="input" id="confirm" name="confirm" type="password" autocomplete="new-password" required data-match="#password" data-msg-match="Passwords don’t match." aria-describedby="confirm-err">' + pwToggle('confirm') + '</div>' + err('confirm') + '</div>' +
        '<div class="field"><label class="check"><input type="checkbox" id="terms" name="terms" required data-label="Accept the terms" data-msg-required="You need to accept the Terms and Privacy Policy." aria-describedby="terms-err"><span>I agree to the <a href="' + url('pages/legal.html?doc=terms') + '">Terms and Conditions</a> and <a href="' + url('pages/legal.html?doc=privacy') + '">Privacy Policy</a>.</span></label>' + err('terms') + '</div>' +
        '<label class="check"><input type="checkbox" name="news"><span>Email me about new templates (optional)</span></label>' +
        '<button class="btn btn--primary btn--lg btn--block" type="submit">Create account</button></form>' +
        '<p style="text-align:center;margin-top:20px;font-size:var(--text-sm)">Already have an account? <a class="link" href="' + url('pages/login.html') + '">Log in</a></p>' +
        '<p class="hint" style="text-align:center;margin-top:12px">Want to sell? Create your account first, then <a class="link" href="' + url('pages/seller-onboarding.html') + '">apply as a seller</a>.</p>';
      // The password hint doubles as the strength label for screen readers.
      $('#pw-strength').insertAdjacentElement('afterend', $('#password-hint'));
      $('[data-form]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        if (!M.forms.validate(f)) return;
        await M.forms.simulate(f.querySelector('[type=submit]'), 1000);
        const user = { name: f.name.value.trim(), email: f.email.value.trim() };
        card.innerHTML = stateView('mail', 'info', 'Verify your email', 'We sent a verification link to <strong>' + esc(user.email) + '</strong>. Open it to activate your account. <span class="demo-note">(Simulated — no email was sent.)</span>',
          '<button type="button" class="btn btn--primary btn--lg" data-verify>Simulate clicking the verification link</button><button type="button" class="btn" data-resend>Resend email</button><a class="btn btn--ghost" href="' + url('pages/register.html') + '">Use a different email</a>');
        focusState();
        card.querySelector('[data-resend]').addEventListener('click', async (ev) => { await M.forms.simulate(ev.currentTarget, 700); M.toast({ title: 'Verification email re-sent (simulated)' }); });
        card.querySelector('[data-verify]').addEventListener('click', async () => {
          M.session.login(Object.assign(user, { seller: (M.store.get('seller-app', {}) || {}).status || 'none' }));
          card.innerHTML = stateView('check-circle', 'success', 'Email verified', 'Your account is ready, ' + esc(user.name.split(' ')[0]) + '. You can buy templates now, or apply to sell.',
            '<a class="btn btn--primary btn--lg" href="' + url(next) + '">' + (next.includes('checkout') ? 'Continue to checkout' : 'Go to my account') + '</a><a class="btn" href="' + url('pages/seller-onboarding.html') + '">Apply to become a seller</a>');
          focusState();
        });
      });
    }

    if (mode === 'forgot-password') {
      const step = qs('step');
      if (step === 'reset') {
        document.title = 'Choose a new password | Templora';
        card.innerHTML = head('Choose a new password', 'Pick something you haven’t used on Templora before.') +
          '<form class="form" novalidate data-form>' + alertBox +
          '<div class="field"><label class="label" for="password">New password</label><div class="input-group"><input class="input" id="password" name="password" type="password" autocomplete="new-password" required data-validate="password" data-strength="pw-strength" aria-describedby="password-hint password-err">' + pwToggle('password') + '</div><div class="strength" id="pw-strength" data-score="0" aria-hidden="true"><span></span><span></span><span></span><span></span></div><p class="hint" id="password-hint">8+ characters with at least one letter and one number.</p>' + err('password') + '</div>' +
          '<div class="field"><label class="label" for="confirm">Confirm new password</label><div class="input-group"><input class="input" id="confirm" name="confirm" type="password" autocomplete="new-password" required data-match="#password" data-msg-match="Passwords don’t match." aria-describedby="confirm-err">' + pwToggle('confirm') + '</div>' + err('confirm') + '</div>' +
          '<button class="btn btn--primary btn--lg btn--block" type="submit">Update password</button></form>' +
          '<p class="demo-note" style="justify-content:center;margin-top:16px">' + M.icon('info') + 'Reset tokens are validated server-side in production. <a class="link" href="?step=expired">&nbsp;See the expired-link state</a></p>';
        $('[data-form]').addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!M.forms.validate(e.target)) return;
          await M.forms.simulate(e.target.querySelector('[type=submit]'), 900);
          card.innerHTML = stateView('check-circle', 'success', 'Password updated', 'Your password has been changed (simulated). Log in with your new password.', '<a class="btn btn--primary btn--lg" href="' + url('pages/login.html') + '">Log in</a>');
          focusState();
        });
      } else if (step === 'expired') {
        card.innerHTML = stateView('alert', 'danger', 'This reset link has expired', 'For your security, reset links work once and expire after a short time. Request a new link to continue.', '<a class="btn btn--primary btn--lg" href="' + url('pages/forgot-password.html') + '">Request a new link</a><a class="btn" href="' + url('pages/login.html') + '">Back to log in</a>');
      } else {
        card.innerHTML = head('Forgot your password?', 'Enter the email you use for Templora and we’ll send you a reset link.') +
          '<form class="form" novalidate data-form><div class="field"><label class="label" for="email">Email address</label><input class="input" id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err">' + err('email') + '</div>' +
          '<button class="btn btn--primary btn--lg btn--block" type="submit">Send reset link</button></form>' +
          '<p style="text-align:center;margin-top:20px;font-size:var(--text-sm)"><a class="link" href="' + url('pages/login.html') + '">' + '← Back to log in</a></p>';
        $('[data-form]').addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!M.forms.validate(e.target)) return;
          const email = e.target.email.value;
          await M.forms.simulate(e.target.querySelector('[type=submit]'), 900);
          // Same message whether or not the account exists (prevents account enumeration).
          card.innerHTML = stateView('mail', 'info', 'Check your inbox', 'If an account exists for <strong>' + esc(email) + '</strong>, you’ll receive a link to reset your password. <span class="demo-note">(Simulated — no email sent.)</span>',
            '<a class="btn btn--primary btn--lg" href="' + url('pages/forgot-password.html?step=reset') + '">Open the reset link (demo)</a><a class="btn" href="' + url('pages/login.html') + '">Back to log in</a>');
          focusState();
        });
      }
    }
  };
})((window.Market = window.Market || {}));
