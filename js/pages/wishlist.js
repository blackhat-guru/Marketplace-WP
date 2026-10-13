/* Wishlist page. */
(function (M) {
  'use strict';
  M.pages.wishlist = function () {
    const { $, url, esc, money } = M.util;
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label: 'Wishlist' }]);
    const grid = $('[data-wishlist-grid]');
    function render() {
      const items = M.wishlist.ids().map(M.catalog.byId);
      $('[data-summary]').textContent = items.length ? items.length + (items.length === 1 ? ' saved template' : ' saved templates') : 'Templates you’ve saved for later.';
      $('[data-wl-actions]').innerHTML = items.length ? '<button type="button" class="btn btn--ghost" data-clear>' + M.icon('trash') + 'Clear wishlist</button>' : '';
      if (!items.length) {
        grid.style.display = 'block';
        grid.innerHTML = M.render.emptyState({ icon: 'heart', title: 'Your wishlist is empty', desc: 'Tap the heart on any template to save it here and compare later.', actions: '<a class="btn btn--primary" href="' + url('pages/html-templates.html') + '">Explore templates</a>' });
        return;
      }
      grid.style.display = '';
      grid.innerHTML = items.map((p) => {
        const s = M.catalog.seller(p.seller);
        const unavailable = p.status !== 'published';
        return '<article class="product-card" data-product-id="' + p.id + '"><div class="product-card__media"><img src="' + url(p.images.main) + '" alt="' + esc(p.shortName) + ' preview" width="1440" height="900" loading="lazy"></div>' +
          '<div class="product-card__body"><p class="product-card__cat">' + esc(M.catalog.subName(p.subcategory)) + '</p><h2 class="product-card__title"><a href="' + M.catalog.productUrl(p) + '">' + esc(p.name) + '</a></h2>' +
          '<div class="product-card__meta"><p class="product-card__seller">by <a href="' + M.catalog.sellerUrl(s.slug) + '">' + esc(s.name) + '</a></p>' + M.render.rating(p, { compact: true }) + '</div>' +
          (unavailable ? '<p class="alert alert--warning" style="padding:8px 10px">' + M.icon('alert') + 'No longer available</p>' : '') +
          '<div class="product-card__footer">' + M.render.price(p) + '<a class="product-card__demo" style="position:relative;z-index:2" href="' + M.catalog.demoUrl(p) + '">' + M.icon('eye') + 'Live demo</a></div>' +
          '<div style="display:grid;grid-template-columns:1fr auto;gap:8px;position:relative;z-index:2"><button type="button" class="btn btn--primary btn--sm" data-add-to-cart="' + p.id + '"' + (unavailable ? ' disabled' : '') + '>' + M.icon('cart', 'icon--sm') + (M.cart.has(p.id) ? 'Add another' : 'Add to cart') + '</button><button type="button" class="btn btn--sm btn--danger" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.shortName) + ' from wishlist">' + M.icon('trash', 'icon--sm') + '</button></div></div></article>';
      }).join('');
    }
    grid.parentElement.parentElement.parentElement.addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-remove]');
      if (rm) {
        const p = M.catalog.byId(rm.dataset.remove);
        M.wishlist.remove(p.id);
        M.toast({ title: 'Removed from wishlist', desc: p.shortName, type: 'info' });
        const next = grid.querySelector('[data-remove]'); if (next) next.focus(); else $('h1').focus && $('#main').focus();
      }
      if (e.target.closest('[data-clear]')) {
        if (await M.confirm({ title: 'Clear your wishlist?', body: 'All saved templates will be removed from this browser.', confirmLabel: 'Clear wishlist', danger: true })) { M.wishlist.clear(); M.toast({ title: 'Wishlist cleared', type: 'info' }); }
      }
    });
    M.on('wishlist', render);
    M.on('cart', render);
    render();
  };
})((window.Market = window.Market || {}));
