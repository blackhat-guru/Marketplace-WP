/* Public seller storefront (multi-vendor store page). */
(function (M) {
  'use strict';
  M.pages.storefront = function () {
    const { $, url, esc, fmtDate, qs } = M.util;
    const s = M.catalog.seller(qs('seller') || '');
    if (!s) {
      document.title = 'Store not found | Templora';
      $('[data-banner]').remove();
      $('[data-store-head]').innerHTML = '<div class="section">' + M.render.emptyState({ icon: 'store', level: 1, title: 'Store not found', desc: 'This seller may have closed their store, or the link is incorrect.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Browse templates</a>' }) + '</div>';
      document.querySelectorAll('.section').forEach((x) => x.remove());
      return;
    }
    const st = M.catalog.sellerStats(s.slug);
    document.title = s.name + ' — Templates & Store | Templora';
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = s.tagline + ' ' + st.count + ' templates on Templora.';
    $('[data-banner]').style.backgroundImage = 'url("' + url(s.banner) + '")';
    $('[data-store-head]').innerHTML =
      '<img class="store-head__logo" src="' + url(s.logo) + '" alt="' + esc(s.name) + ' logo" width="104" height="104">' +
      '<div><h1 class="text-h1">' + esc(s.name) + '</h1><p class="text-secondary" style="margin-top:6px;max-width:64ch">' + esc(s.bio) + '</p>' +
        '<div class="store-stats"><span>' + M.icon('map-pin', 'icon--sm icon--inline') + ' ' + esc(s.location) + '</span><span>Member since <strong>' + fmtDate(s.memberSince, { year: 'numeric', month: 'long' }) + '</strong></span><span><strong>' + st.count + '</strong> products</span>' +
        (st.reviews >= 10 ? '<span>' + M.icon('star', 'icon--sm icon--star icon--fill icon--inline') + ' <strong>' + st.rating.toFixed(1) + '</strong> from ' + st.reviews + ' reviews <span class="badge badge--demo" style="height:18px">sample</span></span>' : '') + '</div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--primary" href="#contact">' + M.icon('message') + 'Message seller</a>' +
        Object.entries(s.social).map(([k, h]) => '<a class="btn btn--icon" href="' + h + '" target="_blank" rel="noopener" aria-label="' + esc(s.name) + ' on ' + k + ' (placeholder, new tab)">' + M.icon(k === 'website' ? 'globe' : k) + '</a>').join('') + '</div>';
    const crumbs = [{ label: 'Home', href: url('index.html') }, { label: 'Sellers', href: url('index.html#sellers-title') }, { label: s.name }];
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs(crumbs);

    M.listing({ id: 'store', root: $('[data-store-root]'), searchInput: $('#store-search'), products: () => M.catalog.sellerProducts(s.slug), lock: { seller: new Set([s.slug]) }, facets: ['sub', 'price', 'tech'], pageSize: 6, mode: 'pages', defaultSort: 'newest', relevance: true });

    $('[data-policies]').innerHTML =
      '<div><dt class="label">Support</dt><dd class="text-secondary" style="margin:4px 0 0;font-size:var(--text-sm)">' + esc(s.supportPolicy) + '</dd></div>' +
      '<div><dt class="label">Updates</dt><dd class="text-secondary" style="margin:4px 0 0;font-size:var(--text-sm)">' + esc(s.updatePolicy) + '</dd></div>' +
      '<div><dt class="label">Verification</dt><dd class="text-secondary" style="margin:4px 0 0;font-size:var(--text-sm)">' + (s.verified ? 'Identity verified by Templora.' : 'Seller verification is not yet available in the prototype, so no badge is shown.') + '</dd></div>';

    $('[data-contact]').innerHTML = '<form class="form" novalidate data-message-form>' +
      '<div class="field"><label class="label" for="m-email">Your email</label><input class="input" id="m-email" type="email" required autocomplete="email" aria-describedby="m-email-err">' + M.forms.errorHTML('m-email') + '</div>' +
      '<div class="field"><label class="label" for="m-product">About</label><select class="select" id="m-product"><option value="">General question</option>' + M.catalog.sellerProducts(s.slug).map((p) => '<option>' + esc(p.shortName) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label class="label" for="m-msg">Message</label><textarea class="textarea" id="m-msg" required minlength="20" maxlength="1000" aria-describedby="m-msg-err m-msg-count" data-count="m-msg-count" data-msg-required="Write your question for the seller."></textarea><p class="hint" id="m-msg-count">0 / 1000</p>' + M.forms.errorHTML('m-msg') + '</div>' +
      '<button class="btn btn--primary" type="submit" style="justify-self:start">' + M.icon('send') + 'Send message</button></form>';
    $('[data-message-form]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (!M.forms.validate(f)) return;
      await M.forms.simulate(f.querySelector('[type=submit]'), 900);
      f.reset();
      M.toast({ title: 'Message sending simulated', desc: 'Prototype only — nothing was delivered to ' + s.name + '.' });
    });
  };
})((window.Market = window.Market || {}));
