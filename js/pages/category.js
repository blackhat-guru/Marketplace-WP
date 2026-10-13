/* HTML Templates category listing (WooCommerce product_cat archive). */
(function (M) {
  'use strict';
  M.pages.category = function () {
    const { $, url, esc } = M.util;
    const all = () => M.catalog.all().filter((p) => p.category === 'html');
    const crumbs = [{ label: 'Home', href: url('index.html') }, { label: 'Templates', href: url('pages/html-templates.html') }, { label: 'HTML Templates' }];
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs(crumbs);
    M.render.breadcrumbLd(crumbs);

    // Sub-category chips: only those with products, plus "All".
    const subnav = $('[data-subnav]');
    const counts = {};
    all().forEach((p) => (counts[p.subcategory] = (counts[p.subcategory] || 0) + 1));
    function renderSubnav(state) {
      const active = state.sub.size === 1 ? [...state.sub][0] : '';
      subnav.innerHTML = '<li><button type="button" class="chip" data-sub="" aria-pressed="' + (!state.sub.size) + '">All <span class="chip__count">' + all().length + '</span></button></li>' +
        M.data.subcategories.map((s) => {
          const n = counts[s.slug] || 0;
          return '<li><button type="button" class="chip" data-sub="' + s.slug + '" aria-pressed="' + (active === s.slug) + '"' + (n ? '' : ' disabled aria-disabled="true" title="No sample templates yet"') + ' style="' + (n ? '' : 'opacity:.5') + '">' + esc(s.name) + ' <span class="chip__count">' + n + '</span></button></li>';
        }).join('');
    }
    const listing = M.listing({
      id: 'cat', root: $('[data-listing]').parentElement, searchInput: $('#cat-search'), products: all, pageSize: 9, mode: 'pages',
      onSubnav: renderSubnav,
      onUpdate: ({ state }) => {
        const sub = state.sub.size === 1 ? [...state.sub][0] : '';
        const tech = state.tech.size === 1 ? [...state.tech][0] : '';
        const t = sub ? M.catalog.subName(sub) : tech ? M.data.technologies[tech] + ' Templates' : 'HTML Website Templates';
        $('[data-title]').textContent = t;
        document.title = t + ' | Templora';
      },
    });
    subnav.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sub]');
      if (!b || b.disabled) return;
      listing.toggle('sub', b.dataset.sub, true);
    });
    // Keep the search field in sync with the listing (header search uses its own form)
    $('[data-faq]').innerHTML = M.render.accordion([
      { q: 'Do HTML templates work with WordPress?', a: 'They are static front-ends. A developer can convert one into a WordPress theme, or you can choose a ready-made WordPress theme when that category opens.' },
      { q: 'Do I need to know how to code?', a: 'Basic HTML and CSS knowledge helps. Each template includes documentation describing how to edit content, colours and layout.' },
      { q: 'Which license do I need for a client site?', a: 'The Commercial license covers one end product for a client. See the <a class="link" href="' + url('pages/legal.html?doc=license') + '">License Agreement</a> for details.' },
    ], { headingLevel: 3 });
    // Price filter shortcut from header link (?price=free) is read by the listing engine.
  };
})((window.Market = window.Market || {}));
