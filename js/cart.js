/* ==========================================================================
   Cart — local demo persistence. Each line is { key, id, license, qty }.
   For digital goods, quantity = number of licenses of the same type.
   Totals are DEMO subtotals only: no tax or discount is calculated here;
   in production WooCommerce computes totals server-side.
   ========================================================================== */
(function (M) {
  'use strict';
  const KEY = 'cart';
  const MAX_QTY = 10;
  const read = () => M.store.get(KEY, []);
  const write = (items) => { M.store.set(KEY, items); M.emit('cart', items); };
  const keyOf = (id, license) => id + '::' + license;

  M.cart = {
    MAX_QTY,
    items() { return read(); },
    lines() {
      return read().map((it) => {
        const p = M.catalog.byId(it.id);
        const available = !!p && p.status === 'published';
        const unit = p ? M.catalog.priceFor(p, it.license) : 0;
        return Object.assign({}, it, { product: p, available, unit, total: available ? unit * it.qty : 0 });
      });
    },
    has(id) { return read().some((x) => x.id === id); },
    count() { return read().reduce((a, x) => a + x.qty, 0); },
    subtotal() { return M.cart.lines().reduce((a, l) => a + l.total, 0); },
    add(id, license, qty) {
      const p = M.catalog.byId(id);
      if (!p) return false;
      license = license || p.licenses[0].id;
      const items = read();
      const k = keyOf(id, license);
      const ex = items.find((x) => x.key === k);
      if (ex) ex.qty = Math.min(MAX_QTY, ex.qty + (qty || 1));
      else items.push({ key: k, id, license, qty: Math.min(MAX_QTY, qty || 1) });
      write(items);
      return true;
    },
    remove(key) { write(read().filter((x) => x.key !== key)); },
    setQty(key, qty) {
      qty = Math.max(1, Math.min(MAX_QTY, parseInt(qty, 10) || 1));
      write(read().map((x) => (x.key === key ? Object.assign(x, { qty }) : x)));
    },
    setLicense(key, license) {
      let items = read();
      const line = items.find((x) => x.key === key);
      if (!line) return;
      const nk = keyOf(line.id, license);
      const dup = items.find((x) => x.key === nk);
      if (dup && dup !== line) { dup.qty = Math.min(MAX_QTY, dup.qty + line.qty); items = items.filter((x) => x !== line); }
      else Object.assign(line, { license, key: nk });
      write(items);
    },
    clear() { write([]); },
  };

  /** Generic "Add to cart" buttons: data-add-to-cart="<id>" [data-license]. */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute('data-add-to-cart');
    const p = M.catalog.byId(id);
    const license = btn.getAttribute('data-license') || (p && p.licenses[0].id);
    if (M.cart.add(id, license)) {
      if (M.motion) M.motion.pop(btn);
      M.toast({ title: 'Added to cart', desc: p.shortName + ' · ' + M.catalog.licenseName(license) + ' license', action: { label: 'View cart', href: M.util.url('pages/cart.html') } });
    }
  });
})((window.Market = window.Market || {}));
