/* ==========================================================================
   Wishlist — local demo persistence (localStorage). Replace the storage
   calls with authenticated REST/AJAX endpoints in production; the public
   API (ids/has/toggle/remove) can stay the same.
   ========================================================================== */
(function (M) {
  'use strict';
  const KEY = 'wishlist';
  const read = () => M.store.get(KEY, []);
  const write = (ids) => { M.store.set(KEY, ids); M.emit('wishlist', ids); };

  M.wishlist = {
    ids: () => read().filter((id) => M.catalog.byId(id)),
    has: (id) => read().includes(id),
    add(id) { if (!M.wishlist.has(id)) write(read().concat(id)); },
    remove(id) { write(read().filter((x) => x !== id)); },
    toggle(id) {
      const on = !M.wishlist.has(id);
      on ? M.wishlist.add(id) : M.wishlist.remove(id);
      return on;
    },
    clear() { write([]); },
  };

  /** Keep every toggle for the same product in sync (cards, detail page, etc.). */
  function sync() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
      const p = M.catalog.byId(btn.getAttribute('data-wishlist-toggle'));
      if (!p) return;
      const on = M.wishlist.has(p.id);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (btn.classList.contains('product-card__wish')) {
        btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.shortName + (on ? ' from' : ' to') + ' wishlist');
      }
      const label = btn.querySelector('[data-wishlist-label]');
      if (label) label.textContent = on ? 'Saved to wishlist' : 'Add to wishlist';
    });
  }
  M.wishlist.sync = sync;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wishlist-toggle]');
    if (!btn) return;
    e.preventDefault();
    const p = M.catalog.byId(btn.getAttribute('data-wishlist-toggle'));
    if (!p) return;
    const on = M.wishlist.toggle(p.id);
    if (M.motion) M.motion.pop(btn);
    M.toast(on
      ? { title: 'Saved to wishlist', desc: p.shortName, action: { label: 'View wishlist', href: M.util.url('pages/wishlist.html') } }
      : { title: 'Removed from wishlist', desc: p.shortName, type: 'info' });
  });
  document.addEventListener('market:wishlist', sync);
})((window.Market = window.Market || {}));
