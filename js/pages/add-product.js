/* Add / Edit product (vendor product form).
   Uploads are LOCAL previews with a simulated progress bar — nothing is sent
   to a server, and the UI never claims files were securely uploaded. */
(function (M) {
  'use strict';
  M.pages.addProduct = function () {
    const { $, $$, url, esc, money, slugify, qs } = M.util;
    const D = M.data;
    const root = $('[data-editor-root]');
    const err = M.forms.errorHTML;
    const editSlug = qs('edit');
    const local = M.store.get('seller-products', []);
    const editing = editSlug ? local.find((p) => p.slug === editSlug) || M.catalog.bySlug(editSlug) : null;
    const v = (k, d) => (editing && editing[k] != null ? editing[k] : d);
    const MAX_SHOTS = 8;
    const shots = []; // { name, size, url }
    let zip = null;
    let slugTouched = !!editing;

    document.title = (editing ? 'Edit ' + editing.shortName : 'Add a product') + ' | Seller dashboard | Templora';
    const crumb = $('[data-ws-crumb]'); if (crumb) crumb.textContent = 'Seller workspace / Products / ' + (editing ? 'Edit' : 'New product');

    const SECTIONS = [['basics', 'Basics', 'file-text'], ['taxonomy', 'Category & technology', 'layers'], ['pricing', 'Pricing & licenses', 'tag'], ['media', 'Previews & demo', 'image'], ['files', 'Files & documentation', 'file-zip'], ['support', 'Version, support & updates', 'refresh']];
    const checkGroup = (name, opts, selected, min, label) => '<div class="field" data-check-group><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:4px 16px">' +
      Object.entries(opts).map(([k, l], i) => '<label class="check"><input type="checkbox" name="' + name + '" value="' + k + '"' + (selected.includes(k) ? ' checked' : '') + (i === 0 && min ? ' id="' + name + '-first" data-min-checked="' + min + '" data-label="' + label + '" data-msg-group="Select at least ' + min + ' option." aria-describedby="' + name + '-first-err"' : '') + '><span>' + esc(l) + '</span></label>').join('') + '</div>' + (min ? err(name + '-first') : '') + '</div>';
    const section = (id, title, desc, body) => '<section class="card form-section" id="sec-' + id + '" aria-labelledby="sh-' + id + '" style="scroll-margin-top:84px"><div><h2 class="form-section__title" id="sh-' + id + '">' + title + '</h2>' + (desc ? '<p class="text-muted" style="font-size:var(--text-sm);margin-top:4px">' + desc + '</p>' : '') + '</div>' + body + '</section>';
    const licRow = (id, on, price, required) => '<div class="license-row"><label class="check" style="margin:0"><input type="checkbox" name="lic" value="' + id + '"' + (on ? ' checked' : '') + (required ? ' disabled' : '') + '><span><strong style="color:var(--color-text)">' + D.licenses[id].name + '</strong>' + (required ? ' <span class="text-muted">(always offered)</span>' : '') + '<br><span class="hint">' + esc(D.licenses[id].desc) + '</span></span></label>' +
      '<div class="field"><label class="sr-only" for="lp-' + id + '">' + D.licenses[id].name + ' license price (USD)</label><div class="input-group input-group--prefix"><span class="input-group__prefix">' + M.icon('dollar') + '</span><input class="input" id="lp-' + id + '" name="lp-' + id + '" type="number" min="0" max="5000" step="1" inputmode="numeric" value="' + (price != null ? price : '') + '"' + (on ? ' required' : ' disabled') + ' data-label="' + D.licenses[id].name + ' price" aria-describedby="lp-' + id + '-err"></div>' + err('lp-' + id) + '</div></div>';
    const licPrice = (id) => { const l = editing && editing.licenses.find((x) => x.id === id); return l ? l.price : null; };
    const d = editing && editing.status === 'published' ? D.details(editing) : null;

    root.innerHTML =
      '<div class="app-main__head"><div><p style="margin-bottom:6px"><a class="link" href="' + url('pages/seller-dashboard.html#products') + '">← Products</a></p><h1 class="app-main__title" id="h-editor" tabindex="-1">' + (editing ? 'Edit “' + esc(editing.shortName) + '”' : 'Add a new product') + '</h1><p class="app-main__desc">Complete every section, then submit for review. Fields marked optional can be skipped.</p></div>' + (editing ? '<span class="status status--' + ({ published: 'success', pending: 'warning', draft: 'neutral', rejected: 'error' }[editing.status]) + '">' + editing.status + '</span>' : '') + '</div>' +
      (editing && editing.status === 'rejected' ? '<div class="alert alert--error" style="margin-bottom:20px">' + M.icon('x-circle') + '<div><p class="alert__title">Changes requested by reviewer</p><p class="alert__body">' + esc(editing.rejectionReason || '') + '</p></div></div>' : '') +
      '<div class="editor-layout"><form class="form" novalidate data-product-form style="gap:20px">' +
        '<div class="alert alert--error" tabindex="-1" data-error-summary hidden role="alert">' + M.icon('alert-circle') + '<div><p class="alert__title" data-error-count></p><ul style="margin:6px 0 0;padding-left:18px;list-style:disc;color:var(--color-text-secondary)"></ul></div></div>' +
        section('basics', 'Basics', 'How the product appears in search results and on its page.',
          '<div class="field"><label class="label" for="pr-title">Product title</label><input class="input" id="pr-title" name="title" required minlength="8" maxlength="90" value="' + esc(v('name', '')) + '" placeholder="e.g. Nova — SaaS Landing Page HTML Template" aria-describedby="pr-title-hint pr-title-err"><p class="hint" id="pr-title-hint">Name — short description. 8–90 characters.</p>' + err('pr-title') + '</div>' +
          '<div class="field"><label class="label" for="pr-slug">URL slug</label><div class="input-group input-group--prefix"><span class="input-group__prefix" style="font-size:var(--text-meta)">/product/</span><input class="input" id="pr-slug" name="slug" required data-validate="slug" style="padding-left:84px" value="' + esc(v('slug', '')) + '" aria-describedby="pr-slug-hint pr-slug-err"></div><p class="hint" id="pr-slug-hint">Generated from the title; lowercase letters, numbers and hyphens.</p>' + err('pr-slug') + '</div>' +
          '<div class="field"><label class="label" for="pr-short">Short description</label><input class="input" id="pr-short" name="short" required minlength="20" maxlength="160" data-count="pr-short-count" value="' + esc(v('summary', '')) + '" aria-describedby="pr-short-count pr-short-err"><p class="hint" id="pr-short-count">0 / 160</p>' + err('pr-short') + '</div>' +
          '<div class="field"><label class="label" for="pr-desc">Full description</label><textarea class="textarea" id="pr-desc" name="desc" required minlength="120" maxlength="5000" rows="7" data-count="pr-desc-count" aria-describedby="pr-desc-hint pr-desc-count pr-desc-err">' + esc(v('description', '')) + '</textarea><div style="display:flex;justify-content:space-between;gap:8px"><p class="hint" id="pr-desc-hint">What’s included, who it’s for, what makes it different. Min 120 characters.</p><p class="hint" id="pr-desc-count">0 / 5000</p></div>' + err('pr-desc') + '</div>') +
        section('taxonomy', 'Category &amp; technology', 'Categories and technologies are separate so buyers can filter by both.',
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pr-cat">Main category</label><select class="select" id="pr-cat" name="category" required aria-describedby="pr-cat-err"><option value="">Choose…</option>' + D.categories.filter((c) => c.group !== 'framework' || true).map((c) => '<option value="' + c.slug + '"' + (c.slug === v('category', '') ? ' selected' : '') + (c.slug === 'html' ? '' : '') + '>' + esc(c.name) + (c.live ? '' : ' (not yet open)') + '</option>').join('') + '</select>' + err('pr-cat') + '</div>' +
          '<div class="field"><label class="label" for="pr-sub">Subcategory</label><select class="select" id="pr-sub" name="sub" required aria-describedby="pr-sub-err"><option value="">Choose…</option>' + D.subcategories.map((s) => '<option value="' + s.slug + '"' + (s.slug === v('subcategory', '') ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select>' + err('pr-sub') + '</div></div>' +
          '<fieldset style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Technology attributes</legend>' + checkGroup('tech', D.technologies, v('tech', []), 1, 'Technology') + '</fieldset>' +
          '<fieldset style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Bundled libraries <span class="label__optional">(optional)</span></legend>' + checkGroup('tools', D.tools, v('tools', []), 0) + '</fieldset>' +
          '<fieldset style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Features</legend>' + checkGroup('features', D.features, v('features', ['responsive']), 1, 'Features') + '<p class="hint">Only tick “Figma File Included” if the download contains a Figma file.</p></fieldset>') +
        section('pricing', 'Pricing &amp; licenses', 'Set a price for each license you support. Use 0 for a free product.',
          '<div style="display:grid;gap:10px">' + licRow('personal', true, licPrice('personal') != null ? licPrice('personal') : v('price', ''), true) + licRow('commercial', !editing || !!licPrice('commercial'), licPrice('commercial')) + licRow('extended', !!licPrice('extended'), licPrice('extended')) + '</div>' +
          '<p class="hint">Marketplace commission isn’t defined yet; your earnings estimate will appear here once it is.</p>') +
        section('media', 'Previews &amp; live demo', 'Screenshots must match the downloadable files. No stock photos in place of real pages.',
          '<div class="field"><span class="label" id="shots-l">Preview screenshots</span><label class="dropzone" data-dropzone="shots"><input type="file" id="pr-shots" accept="image/png,image/jpeg,image/webp" multiple aria-labelledby="shots-l" aria-describedby="shots-h pr-shots-err" data-label="Preview screenshots"><span class="dropzone__icon">' + M.icon('upload') + '</span><span class="dropzone__title"><span>Choose images</span> or drag and drop</span><span class="hint" id="shots-h">PNG, JPG or WebP · 16:10 recommended (1440×900) · max 5 MB each · up to ' + MAX_SHOTS + ' images · first image is the cover</span></label>' + err('pr-shots') + '<div class="thumb-grid" data-shots style="margin-top:8px"></div></div>' +
          '<div class="field"><label class="label" for="pr-demo">Live demo URL</label><input class="input" id="pr-demo" name="demo" type="url" required placeholder="https://your-demo.example.com" value="' + esc(v('demoUrl', '') || '') + '" aria-describedby="pr-demo-hint pr-demo-err"><p class="hint" id="pr-demo-hint">Must be HTTPS and publicly reachable. Buyers open it from the product page.</p>' + err('pr-demo') + '</div>') +
        section('files', 'Files &amp; documentation', 'The ZIP buyers receive after purchase.',
          '<div class="field"><span class="label" id="zip-l">Downloadable package (.zip)</span><label class="dropzone" data-dropzone="zip"><input type="file" id="pr-zip" accept=".zip,application/zip,application/x-zip-compressed" aria-labelledby="zip-l" aria-describedby="zip-h pr-zip-err" data-label="Downloadable ZIP"><span class="dropzone__icon">' + M.icon('file-zip') + '</span><span class="dropzone__title"><span>Choose a ZIP file</span> or drag and drop</span><span class="hint" id="zip-h">.zip only · max 200 MB · include docs and license files</span></label>' + err('pr-zip') + '<ul class="upload-list" data-zip style="margin-top:8px"></ul></div>' +
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pr-docs">Documentation URL</label><input class="input" id="pr-docs" name="docs" type="url" placeholder="https://" aria-describedby="pr-docs-hint pr-docs-err"><p class="hint" id="pr-docs-hint">Or include docs in the ZIP and tick below.</p>' + err('pr-docs') + '</div>' +
          '<div class="field" style="align-content:center"><label class="check"><input type="checkbox" name="docsInZip" id="pr-docs-zip"' + (editing ? ' checked' : '') + '><span>Documentation is included in the ZIP</span></label></div></div>') +
        section('support', 'Version, compatibility, support &amp; updates', '',
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pr-version">Version</label><input class="input" id="pr-version" name="version" required data-validate="version" value="' + esc(v('version', '1.0.0')) + '" aria-describedby="pr-version-err">' + err('pr-version') + '</div>' +
          '<div class="field"><label class="label" for="pr-deps">Dependencies <span class="label__optional">(optional)</span></label><input class="input" id="pr-deps" name="deps" placeholder="e.g. GSAP 3.12, Swiper 11" value="' + esc(d ? d.dependencies.join(', ') : '') + '"></div></div>' +
          '<div class="field"><label class="label" for="pr-changelog">Changelog</label><textarea class="textarea" id="pr-changelog" name="changelog" rows="4" required minlength="10" placeholder="1.0.0 — Initial release" aria-describedby="pr-changelog-err">' + esc(d ? d.changelog.map((c) => c.version + ' — ' + c.notes.join('; ')).join('\n') : '') + '</textarea>' + err('pr-changelog') + '</div>' +
          '<fieldset style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">Browser compatibility</legend>' + checkGroup('browsers', { chrome: 'Chrome', firefox: 'Firefox', safari: 'Safari', edge: 'Edge', ios: 'iOS Safari', android: 'Chrome for Android' }, editing ? ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android'] : [], 2, 'Browser compatibility') + '</fieldset>' +
          '<div class="form-row form-row--2"><div class="field"><label class="label" for="pr-support">Support period</label><select class="select" id="pr-support" name="supportPeriod" required aria-describedby="pr-support-err"><option value="">Choose…</option><option' + (editing ? ' selected' : '') + '>6 months</option><option>12 months</option><option>Lifetime of product</option><option>No support offered</option></select>' + err('pr-support') + '</div>' +
          '<div class="field"><label class="label" for="pr-updates">Update policy</label><select class="select" id="pr-updates" name="updatePolicy" required aria-describedby="pr-updates-err"><option value="">Choose…</option><option' + (editing ? ' selected' : '') + '>Free lifetime updates</option><option>Free updates for 12 months</option><option>Bug fixes only</option></select>' + err('pr-updates') + '</div></div>' +
          '<div class="field"><label class="label" for="pr-licinfo">License information <span class="label__optional">(optional)</span></label><textarea class="textarea" id="pr-licinfo" name="licinfo" rows="3" placeholder="Credits and licenses for bundled fonts, icons, images and libraries."></textarea></div>') +
        '<div class="action-bar"><p class="hint" data-save-status aria-live="polite">' + (editing ? 'Editing ' + esc(editing.status) + ' listing' : 'Not saved yet') + '</p><div class="action-bar__btns"><button type="button" class="btn" data-save-draft>' + M.icon('file') + 'Save draft</button><button type="button" class="btn" data-preview-listing>' + M.icon('eye') + 'Preview listing</button><button type="submit" class="btn btn--primary" data-submit>' + M.icon('send') + 'Submit for review</button></div></div>' +
      '</form>' +
      '<aside class="editor-aside hide-mobile" aria-label="Form progress"><div class="card card--pad"><p class="label" style="margin-bottom:10px">Sections</p><ol class="editor-toc">' + SECTIONS.map(([id, l]) => '<li><a href="#sec-' + id + '" data-toc="' + id + '">' + M.icon('check-circle') + l + '</a></li>').join('') + '</ol>' +
        '<div class="divider" style="margin:16px 0"></div><p class="hint">Uploads in this prototype are processed locally for preview and are <strong>not</strong> sent anywhere.</p></div></aside></div>';

    const form = $('[data-product-form]');
    // Initial counters
    ['pr-short', 'pr-desc'].forEach((id) => { const el = document.getElementById(id); document.getElementById(el.dataset.count).textContent = el.value.length + ' / ' + el.maxLength; });

    // Slug follows title until edited manually
    form.title.addEventListener('input', () => { if (!slugTouched) form.slug.value = slugify(form.title.value.split('—')[0]); });
    form.slug.addEventListener('input', () => (slugTouched = true));
    // License toggles enable price fields
    form.addEventListener('change', (e) => {
      if (e.target.name === 'lic') {
        const inp = document.getElementById('lp-' + e.target.value);
        inp.disabled = !e.target.checked; inp.required = e.target.checked;
        if (!e.target.checked) M.forms.show(inp, '');
      }
      if (e.target.id === 'pr-docs-zip') { form.docs.required = false; M.forms.show(form.docs, ''); }
    });

    /* ---------- Screenshots (local previews) ---------- */
    const shotsInput = $('#pr-shots');
    function renderShots() {
      $('[data-shots]').innerHTML = shots.map((s, i) => '<figure><img src="' + s.url + '" alt="Screenshot ' + (i + 1) + ': ' + esc(s.name) + '"><figcaption>' + (i === 0 ? '<span class="badge badge--premium" style="height:20px">Cover</span>' : '') + '</figcaption><button type="button" data-remove-shot="' + i + '" aria-label="Remove screenshot ' + (i + 1) + '">' + M.icon('x', 'icon--sm') + '</button></figure>').join('');
      shotsInput.dataset.customError = '';
      delete shotsInput.dataset.customError;
      if (shots.length) M.forms.show(shotsInput, '');
      tocState();
    }
    function addShots(files) {
      const problems = [];
      Array.from(files).forEach((f) => {
        if (shots.length >= MAX_SHOTS) return problems.push(f.name + ': limit of ' + MAX_SHOTS + ' images reached');
        if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return problems.push(f.name + ': use PNG, JPG or WebP');
        if (f.size > 5 * 1048576) return problems.push(f.name + ': ' + (f.size / 1048576).toFixed(1) + ' MB exceeds 5 MB');
        shots.push({ name: f.name, size: f.size, url: URL.createObjectURL(f) });
      });
      renderShots();
      if (problems.length) { shotsInput.dataset.customError = problems.join(' · '); M.forms.check(shotsInput); delete shotsInput.dataset.customError; }
      shotsInput.value = '';
    }
    shotsInput.addEventListener('change', () => addShots(shotsInput.files));
    $('[data-shots]').addEventListener('click', (e) => { const b = e.target.closest('[data-remove-shot]'); if (b) { URL.revokeObjectURL(shots[+b.dataset.removeShot].url); shots.splice(+b.dataset.removeShot, 1); renderShots(); shotsInput.focus(); } });

    /* ---------- ZIP (simulated progress) ---------- */
    const zipInput = $('#pr-zip');
    function setZip(f) {
      if (!f) return;
      if (!/\.zip$/i.test(f.name)) { zipInput.dataset.customError = f.name + ' isn’t a .zip file.'; M.forms.check(zipInput); delete zipInput.dataset.customError; zipInput.value = ''; return; }
      if (f.size > 200 * 1048576) { zipInput.dataset.customError = 'File is ' + (f.size / 1048576).toFixed(0) + ' MB — the limit is 200 MB.'; M.forms.check(zipInput); delete zipInput.dataset.customError; zipInput.value = ''; return; }
      M.forms.show(zipInput, '');
      zip = { name: f.name, size: f.size, progress: 0, done: false };
      const list = $('[data-zip]');
      list.innerHTML = '<li class="upload-item"><span class="upload-item__thumb">' + M.icon('file-zip') + '</span><div style="min-width:0"><p class="upload-item__name">' + esc(f.name) + '</p><p class="hint" data-zip-status>' + (f.size / 1048576).toFixed(1) + ' MB · processing locally…</p><div class="progress" role="progressbar" aria-label="Processing ' + esc(f.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress__bar"></div></div></div><button type="button" class="btn btn--ghost btn--icon btn--sm" data-remove-zip aria-label="Remove ' + esc(f.name) + '">' + M.icon('trash', 'icon--sm') + '</button></li>';
      const bar = list.querySelector('.progress__bar');
      const pb = list.querySelector('.progress');
      const tick = setInterval(() => {
        if (!zip || zip.name !== f.name) return clearInterval(tick);
        zip.progress = Math.min(100, zip.progress + 7 + Math.random() * 14);
        bar.style.width = zip.progress + '%';
        pb.setAttribute('aria-valuenow', Math.round(zip.progress));
        if (zip.progress >= 100) {
          clearInterval(tick);
          zip.done = true;
          pb.classList.add('progress--done');
          list.querySelector('[data-zip-status]').innerHTML = (f.size / 1048576).toFixed(1) + ' MB · <span style="color:var(--color-success)">ready (local only — not uploaded)</span>';
          tocState();
        }
      }, 160);
    }
    zipInput.addEventListener('change', () => setZip(zipInput.files[0]));
    $('[data-zip]').addEventListener('click', (e) => { if (e.target.closest('[data-remove-zip]')) { zip = null; $('[data-zip]').innerHTML = ''; zipInput.value = ''; zipInput.focus(); tocState(); } });

    // Drag & drop styling
    $$('[data-dropzone]').forEach((dz) => {
      ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-dragover'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove('is-dragover')));
      dz.addEventListener('drop', (e) => { e.preventDefault(); if (dz.dataset.dropzone === 'shots') addShots(e.dataTransfer.files); else setZip(e.dataTransfer.files[0]); });
    });

    /* ---------- Section completeness (TOC) ---------- */
    function sectionValid(id) {
      const sec = document.getElementById('sec-' + id);
      const fields = $$('input, select, textarea', sec).filter((el) => el.required || el.dataset.minChecked || el.dataset.validate);
      const ok = fields.every((el) => {
        if (el.dataset.minChecked) return el.closest('[data-check-group]').querySelectorAll('input:checked').length >= +el.dataset.minChecked;
        return el.disabled || (el.checkValidity() && (!el.dataset.validate || !!el.value));
      });
      if (id === 'media') return ok && shots.length > 0;
      if (id === 'files') return !!(zip && zip.done) && (form.docsInZip.checked || !!form.docs.value);
      return ok;
    }
    function tocState() {
      SECTIONS.forEach(([id]) => { const a = document.querySelector('[data-toc="' + id + '"]'); if (a) { const done = sectionValid(id); a.classList.toggle('is-complete', done); a.classList.remove('has-error'); a.setAttribute('aria-label', a.textContent + (done ? ' (complete)' : ' (incomplete)')); } });
    }
    form.addEventListener('input', M.util.debounce(tocState, 200));
    form.addEventListener('change', tocState);
    tocState();

    /* ---------- Collect data ---------- */
    function collect(status) {
      const lic = ['personal'].concat($$('input[name="lic"]:checked').map((i) => i.value).filter((x) => x !== 'personal'));
      const licenses = lic.map((id) => ({ id, price: +(document.getElementById('lp-' + id).value || 0) }));
      const title = form.title.value.trim();
      return {
        id: (editing && editing.id) || 'local-' + Date.now(), local: true, status,
        slug: form.slug.value || slugify(title) || 'untitled-' + Date.now(),
        name: title || 'Untitled product', shortName: (title.split('—')[0] || 'Untitled').trim(),
        category: form.category.value || 'html', subcategory: form.sub.value || 'landing',
        summary: form.short.value, description: form.desc.value,
        tech: $$('input[name="tech"]:checked').map((i) => i.value), tools: $$('input[name="tools"]:checked').map((i) => i.value), features: $$('input[name="features"]:checked').map((i) => i.value),
        price: licenses[0].price, originalPrice: null, licenses,
        seller: D.demoSellerSlug, rating: 0, reviewCount: 0, sales: 0, views: 0,
        images: { main: null, gallery: [] }, demoUrl: form.demo.value || null, version: form.version.value || '1.0.0',
        updated: new Date().toISOString().slice(0, 10), published: null, flags: {}, pagesCount: 1, tags: [],
      };
    }
    function saveLocal(item) {
      const list = M.store.get('seller-products', []).filter((p) => p.id !== item.id && p.slug !== item.slug);
      list.unshift(item);
      M.store.set('seller-products', list);
    }

    root.addEventListener('click', async (e) => {
      if (e.target.closest('[data-save-draft]')) {
        // Drafts only need a title.
        if (!M.forms.check(form.title)) { form.title.focus(); return; }
        const btn = e.target.closest('[data-save-draft]');
        await M.forms.simulate(btn, 600);
        if (editing && !editing.local && editing.status === 'published') {
          M.toast({ title: 'Draft changes saved (demo)', desc: 'The published listing stays live until changes are approved.' });
        } else {
          saveLocal(collect('draft'));
          M.toast({ title: 'Draft saved', desc: 'Stored in this browser. Find it under Products › Draft.', action: { label: 'View products', href: url('pages/seller-dashboard.html#products') } });
        }
        $('[data-save-status]').textContent = 'Draft saved at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (e.target.closest('[data-preview-listing]')) {
        const p = collect('draft');
        const cover = shots[0] ? shots[0].url : null;
        const card = M.render.productCard(Object.assign({}, p, { images: { main: null } })).replace(M.PLACEHOLDER_IMG.replace(/&/g, '&amp;'), cover || M.PLACEHOLDER_IMG);
        M.dialog({
          title: 'Listing preview', size: 'lg',
          body: '<div style="display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:start"><div>' + card + '</div><div><p class="label">' + esc(p.name) + '</p><p style="margin-top:6px">' + esc(p.summary || 'No short description yet.') + '</p><dl class="kv" style="margin-top:16px"><dt>Licenses</dt><dd>' + p.licenses.map((l) => esc(M.catalog.licenseName(l.id)) + ' ' + money(l.price)).join(', ') + '</dd><dt>Version</dt><dd>' + esc(p.version) + '</dd><dt>Screenshots</dt><dd>' + shots.length + '</dd><dt>Package</dt><dd>' + (zip ? esc(zip.name) : '—') + '</dd></dl></div></div><p class="hint" style="margin-top:16px">Preview only — buyers can’t see this listing until it’s approved.</p>',
          actions: [{ label: 'Keep editing', variant: 'primary' }],
        });
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Custom requirements for uploads
      if (!shots.length) shotsInput.dataset.customError = 'Add at least one preview screenshot.';
      if (!zip) zipInput.dataset.customError = 'Add the downloadable ZIP package.';
      else if (!zip.done) zipInput.dataset.customError = 'Wait for the file to finish processing.';
      if (!form.docsInZip.checked) form.docs.required = true;
      const ok = M.forms.validate(form);
      delete shotsInput.dataset.customError; delete zipInput.dataset.customError;
      SECTIONS.forEach(([id]) => { const a = document.querySelector('[data-toc="' + id + '"]'); const bad = document.getElementById('sec-' + id).querySelector('[aria-invalid="true"]'); if (a) a.classList.toggle('has-error', !!bad); });
      if (!ok) return;
      const btn = $('[data-submit]');
      await M.forms.simulate(btn, 1200);
      const item = collect('pending');
      saveLocal(item);
      root.innerHTML = '<div class="card" style="max-width:640px;margin:24px auto;padding:clamp(24px,5vw,48px);text-align:center;display:grid;justify-items:center;gap:14px">' +
        '<div class="modal__icon modal__icon--success" style="width:64px;height:64px;border-radius:50%">' + M.icon('check', 'icon--lg') + '</div><span class="badge badge--demo">Simulated submission</span>' +
        '<h1 class="app-main__title" tabindex="-1" id="h-done">Submitted for review</h1><p class="text-secondary">“' + esc(item.name) + '” is now <strong>Pending review</strong>. Files were processed in your browser for this demo only — nothing was uploaded.</p>' +
        '<ol class="timeline" style="text-align:left;width:100%;max-width:360px;margin-top:8px"><li class="timeline__item is-done"><span class="timeline__dot">' + M.icon('check') + '</span><div><p class="timeline__title">Submitted</p><p class="timeline__desc">Just now</p></div></li><li class="timeline__item is-current"><span class="timeline__dot">' + M.icon('shield') + '</span><div><p class="timeline__title">Quality review</p><p class="timeline__desc">Code, previews and licensing checks</p></div></li><li class="timeline__item"><span class="timeline__dot">' + M.icon('store') + '</span><div><p class="timeline__title">Published</p><p class="timeline__desc">Visible on your storefront</p></div></li></ol>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn btn--primary" href="' + url('pages/seller-dashboard.html#products') + '">Go to products</a><a class="btn" href="' + url('pages/add-product.html') + '">Add another product</a></div></div>';
      $('#h-done').focus();
    });
  };
})((window.Market = window.Market || {}));
