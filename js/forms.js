/* ==========================================================================
   Forms — accessible inline validation (on blur + on submit), password
   visibility toggles, strength meter, character counters and a helper for
   simulated submissions that prevents duplicate clicks.
   Markup contract:
     <div class="field">
       <label for="x">…</label>
       <input id="x" aria-describedby="x-err" required data-msg-required="…">
       <p class="field-error" id="x-err"><svg/><span></span></p>
     </div>
   ========================================================================== */
(function (M) {
  'use strict';
  const { $$ } = M.util;

  const DEFAULTS = {
    valueMissing: (el) => (el.type === 'checkbox' ? 'Please tick this box to continue.' : el.tagName === 'SELECT' ? 'Please choose an option.' : el.type === 'file' ? 'Please choose a file.' : 'This field is required.'),
    typeMismatch: (el) => (el.type === 'email' ? 'Enter an email address like name@example.com.' : el.type === 'url' ? 'Enter a full URL starting with https://' : 'Please check the format.'),
    tooShort: (el) => 'Use at least ' + el.minLength + ' characters (currently ' + el.value.length + ').',
    tooLong: (el) => 'Use no more than ' + el.maxLength + ' characters.',
    patternMismatch: (el) => el.getAttribute('title') || 'Please match the requested format.',
    rangeUnderflow: (el) => 'Enter a value of ' + el.min + ' or more.',
    rangeOverflow: (el) => 'Enter a value of ' + el.max + ' or less.',
    stepMismatch: () => 'Enter a valid amount.',
    badInput: () => 'Enter a number.',
  };

  function errorEl(el) {
    const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/);
    for (const id of ids) {
      const node = id && document.getElementById(id);
      if (node && node.classList.contains('field-error')) return node;
    }
    return null;
  }

  function messageFor(el) {
    // Custom rules first
    if (el.dataset.match) {
      const other = document.querySelector(el.dataset.match);
      if (other && el.value && el.value !== other.value) return el.dataset.msgMatch || 'The values do not match.';
    }
    if (el.dataset.validate === 'password' && el.value) {
      if (el.value.length < 8 || !/[0-9]/.test(el.value) || !/[A-Za-z]/.test(el.value)) return 'Use 8+ characters with at least one letter and one number.';
    }
    if (el.dataset.validate === 'slug' && el.value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(el.value)) return 'Use lowercase letters, numbers and single hyphens only.';
    if (el.dataset.validate === 'version' && el.value && !/^\d+\.\d+\.\d+$/.test(el.value)) return 'Use semantic versioning, e.g. 1.0.0.';
    if (el.type === 'url' && el.value && el.validity.valid && !/^https:\/\//i.test(el.value)) return 'Use a secure URL starting with https://';
    if (el.dataset.minChecked) {
      const group = el.closest('[data-check-group]');
      const n = group ? group.querySelectorAll('input:checked').length : 0;
      if (n < +el.dataset.minChecked) return el.dataset.msgGroup || 'Select at least ' + el.dataset.minChecked + '.';
    }
    if (el.dataset.customError) return el.dataset.customError;
    if (el.validity.valid) return '';
    for (const k in DEFAULTS) {
      if (el.validity[k]) {
        const custom = k === 'valueMissing' ? el.dataset.msgRequired : el.dataset['msg' + k.charAt(0).toUpperCase() + k.slice(1)];
        return custom || DEFAULTS[k](el);
      }
    }
    return 'Please check this field.';
  }

  function show(el, msg) {
    const err = errorEl(el);
    const field = el.closest('.field');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (!msg) el.removeAttribute('aria-invalid');
    if (err) {
      const span = err.querySelector('span') || err;
      span.textContent = msg;
      err.classList.toggle('is-visible', !!msg);
    }
    if (field) field.classList.toggle('has-error', !!msg);
    const dz = el.closest('.dropzone');
    if (dz) dz.classList.toggle('has-error', !!msg);
  }

  function check(el) {
    if (el.disabled || el.closest('[hidden]') || el.type === 'hidden') { show(el, ''); return true; }
    const msg = messageFor(el);
    show(el, msg);
    return !msg;
  }

  const fieldsOf = (form) => $$('input, select, textarea', form).filter((el) => el.willValidate || el.dataset.minChecked || el.dataset.validate || el.dataset.match);

  M.forms = {
    check,
    show,
    /** Validate every field; focuses the first invalid one. Returns boolean. */
    validate(form, opts) {
      const fields = fieldsOf(form);
      let first = null;
      fields.forEach((el) => { if (!check(el) && !first) first = el; });
      const summary = form.querySelector('[data-error-summary]');
      if (summary) {
        const invalid = fields.filter((el) => el.getAttribute('aria-invalid') === 'true');
        summary.hidden = !invalid.length;
        if (invalid.length) {
          const seen = new Set();
          summary.querySelector('ul').innerHTML = invalid.filter((el) => (el.name && seen.has(el.name) ? false : seen.add(el.name))).map((el) => {
            const label = el.dataset.label || (form.querySelector('label[for="' + el.id + '"]') || el.closest('label') || {}).textContent || el.name;
            return '<li><a href="#' + el.id + '">' + M.util.esc(label.replace(/\s*\*$/, '').replace(/\(optional\)/, '').trim()) + '</a></li>';
          }).join('');
          summary.querySelector('[data-error-count]').textContent = invalid.length === 1 ? '1 field needs attention' : invalid.length + ' fields need attention';
        }
      }
      if (first && !(opts && opts.silent)) {
        (summary && !summary.hidden ? summary : first).focus({ preventScroll: false });
        if (summary && !summary.hidden) summary.scrollIntoView({ block: 'center', behavior: M.util.prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      return !first;
    },
    /** Disable the submit button and show a spinner while a simulated request runs. */
    async simulate(btn, ms) {
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      await M.util.wait(ms || 900);
      btn.classList.remove('is-loading');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    },
    strength(value) {
      let s = 0;
      if (value.length >= 8) s++;
      if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
      if (/\d/.test(value)) s++;
      if (/[^A-Za-z0-9]/.test(value) || value.length >= 14) s++;
      return value ? Math.max(1, s) : 0;
    },
    init(root) {
      // Validate on blur once the user has interacted; re-validate on input after an error.
      root.addEventListener('focusout', (e) => {
        const el = e.target;
        if (!el.matches || !el.matches('input, select, textarea') || !el.closest('form[novalidate]')) return;
        if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'file') return;
        if (el.value !== '' || el.getAttribute('aria-invalid') === 'true') check(el);
      });
      root.addEventListener('input', (e) => {
        const el = e.target;
        if (el.getAttribute && el.getAttribute('aria-invalid') === 'true') check(el);
        if (el.matches && el.matches('[data-strength]')) {
          const meter = document.getElementById(el.dataset.strength);
          if (meter) {
            const s = M.forms.strength(el.value);
            meter.dataset.score = s;
            const label = meter.nextElementSibling;
            if (label) label.textContent = el.value ? 'Password strength: ' + ['', 'weak', 'fair', 'good', 'strong'][s] : '';
          }
        }
        if (el.matches && el.matches('[data-count]')) {
          const out = document.getElementById(el.dataset.count);
          if (out) out.textContent = el.value.length + ' / ' + el.maxLength;
        }
      });
      root.addEventListener('change', (e) => {
        const el = e.target;
        if (el.getAttribute && el.getAttribute('aria-invalid') === 'true') check(el);
        const group = el.closest && el.closest('[data-check-group]');
        if (group) { const g = group.querySelector('[data-min-checked]'); if (g && g.getAttribute('aria-invalid') === 'true') check(g); }
      });
      // Password visibility toggles
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-password-toggle]');
        if (!t) return;
        const input = document.getElementById(t.getAttribute('aria-controls'));
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        t.setAttribute('aria-pressed', show ? 'true' : 'false');
        t.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        t.innerHTML = M.icon(show ? 'eye-off' : 'eye');
      });
      // Error-summary links focus the field
      root.addEventListener('click', (e) => {
        const a = e.target.closest('[data-error-summary] a');
        if (!a) return;
        e.preventDefault();
        const el = document.querySelector(a.getAttribute('href'));
        if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); }
      });
    },
  };

  /** Markup helpers so page scripts can build consistent fields. */
  M.forms.errorHTML = (id) => '<p class="field-error" id="' + id + '-err">' + M.icon('alert-circle') + '<span></span></p>';
  M.forms.passwordToggleHTML = (id) => '<button type="button" class="icon-btn input-group__btn" data-password-toggle aria-controls="' + id + '" aria-pressed="false" aria-label="Show password">' + M.icon('eye') + '</button>';
})((window.Market = window.Market || {}));
