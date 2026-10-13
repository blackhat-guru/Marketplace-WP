/* Homepage controller — fills reusable components from the sample dataset. */
(function (M) {
  'use strict';
  M.pages.home = function () {
    const { $, url, esc } = M.util;
    const all = M.catalog.all();
    const R = M.render;

    // Popular searches
    $('[data-popular]').innerHTML = M.search.POPULAR.slice(0, 5).map((q) => '<li><a class="chip" href="' + url('pages/search.html?q=' + encodeURIComponent(q)) + '">' + esc(q) + '</a></li>').join('');

    // Categories — counts derived from data, never hard-coded
    const cats = [
      { name: 'HTML Templates', href: 'pages/html-templates.html', img: 'agencypro', count: all.length },
      { name: 'Tailwind CSS', href: 'pages/html-templates.html?tech=tailwind', img: 'nova', count: all.filter((p) => p.tech.includes('tailwind')).length },
      { name: 'Bootstrap', href: 'pages/html-templates.html?tech=bootstrap', img: 'shoplite', count: all.filter((p) => p.tech.includes('bootstrap')).length },
      { name: 'Landing Pages', href: 'pages/html-templates.html?sub=landing', img: 'launchkit', count: all.filter((p) => p.subcategory === 'landing').length },
      { name: 'Portfolio Templates', href: 'pages/html-templates.html?sub=portfolio', img: 'studiogrid', count: all.filter((p) => p.subcategory === 'portfolio').length },
      { name: 'Business Websites', href: 'pages/search.html?q=business', img: 'realtyspace', count: M.search.query('business').length },
      { name: 'SaaS Templates', href: 'pages/html-templates.html?sub=saas', img: 'clouddesk', count: all.filter((p) => p.subcategory === 'saas').length },
      { name: 'Admin Dashboards', href: 'pages/html-templates.html?sub=admin', img: 'dashflow', count: all.filter((p) => p.subcategory === 'admin').length },
    ];
    $('[data-categories]').innerHTML = cats.map((c) =>
      '<li class="category-card" data-reveal><div class="category-card__media"><img src="' + url('assets/images/products/' + c.img + '-desktop.svg') + '" alt="" width="1440" height="900" loading="lazy"></div>' +
      '<div class="category-card__body"><div><h3 class="category-card__name"><a href="' + url(c.href) + '">' + esc(c.name) + '</a></h3><p class="category-card__count">' + c.count + ' sample ' + (c.count === 1 ? 'template' : 'templates') + '</p></div>' +
      '<span class="category-card__arrow">' + M.icon('arrow-right') + '</span></div></li>').join('');

    const fill = (key, list, ctx, opts) => {
      const host = document.querySelector('[data-list="' + key + '"]');
      host.innerHTML = list.length ? list.map((p) => R.productCard(p, Object.assign({ context: ctx, reveal: true }, opts))).join('') : R.emptyState({ icon: 'package', title: 'Nothing here yet', desc: 'Check back soon.' });
    };
    fill('featured', all.filter((p) => p.flags.featured).slice(0, 4), null);
    fill('trending', all.filter((p) => p.flags.trending).slice(0, 4), 'trending');
    fill('bestseller', all.filter((p) => p.flags.bestseller).sort((a, b) => b.sales - a.sales).slice(0, 4), 'bestseller', { showSales: true });
    fill('new', all.slice().sort((a, b) => b.published.localeCompare(a.published)).slice(0, 4), 'new');

    $('[data-usecases]').innerHTML = M.data.useCases.map((u) => '<li><a class="usecase" href="' + url(u.href) + '"><span class="usecase__icon">' + M.icon(u.icon) + '</span>' + esc(u.name) + '</a></li>').join('');
    $('[data-sellers]').innerHTML = M.data.sellers.slice(0, 4).map((s) => R.sellerCard(s, { reveal: true })).join('');

    R.jsonLd({
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'Templora', url: location.origin + location.pathname,
      potentialAction: { '@type': 'SearchAction', target: new URL('pages/search.html?q={search_term_string}', location.href).href.replace('%7B', '{').replace('%7D', '}'), 'query-input': 'required name=search_term_string' },
    });
  };
})((window.Market = window.Market || {}));
