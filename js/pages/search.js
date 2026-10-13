/* Search results (/search?q=…). Uses the shared listing engine in load-more mode. */
(function (M) {
  'use strict';
  M.pages.search = function () {
    const { $, url, esc, qs } = M.util;
    const q = (qs('q') || '').trim();
    const cat = qs('cat');
    const catObj = cat && M.data.categories.find((c) => c.slug === cat);
    const crumbs = [{ label: 'Home', href: url('index.html') }, { label: catObj ? catObj.name : 'Search' }];
    $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs(crumbs);

    const title = () => {
      const cur = listing ? listing.state.q : q;
      if (catObj) return catObj.name;
      return cur ? 'Results for “' + cur + '”' : 'All templates';
    };

    // Category that exists in the taxonomy but has no sample products yet.
    const products = () => (catObj && !catObj.live ? [] : M.catalog.all());
    if (catObj && !catObj.live) {
      $('[data-category-note]').innerHTML = '<div class="alert alert--info" style="margin-bottom:20px">' + M.icon('info') + '<div><p class="alert__title">' + esc(catObj.name) + ' are coming soon</p><p class="alert__body">This category is part of the marketplace taxonomy but has no sample products in the prototype yet.</p></div></div>';
    }

    let listing = null;
    listing = M.listing({
      id: 'search', root: $('[data-search-root]'), searchInput: $('#search-q'), products, mode: 'loadmore', pageSize: 8,
      onUpdate: ({ total, state }) => {
        $('[data-title]').textContent = title();
        document.title = (state.q ? 'Search: ' + state.q : catObj ? catObj.name : 'All templates') + ' | Templora';
        renderRelated(state.q);
      },
      empty: (state) => M.render.emptyState({
        icon: 'search', title: state.q ? 'No templates found for “' + state.q + '”' : 'No templates here yet',
        desc: 'Check the spelling, remove filters, or try a broader term such as “landing page”, “Tailwind” or “dashboard”.',
        actions: '<button type="button" class="btn btn--primary" data-filters-clear>Clear search &amp; filters</button><a class="btn" href="' + url('pages/html-templates.html') + '">Browse HTML templates</a>',
      }),
    });

    function renderRelated(cur) {
      const base = ['Landing page', 'Tailwind', 'Bootstrap', 'Dashboard', 'Portfolio', 'E-commerce', 'Free', 'Dark mode'];
      const list = base.filter((x) => x.toLowerCase() !== String(cur).toLowerCase()).slice(0, 6);
      $('[data-related]').innerHTML = list.map((x) => '<li><a class="chip" href="' + url('pages/search.html?q=' + encodeURIComponent(x)) + '">' + esc(x) + '</a></li>').join('');
    }
    // Keep the header search box in sync with the query
    const hs = document.getElementById('header-search');
    $('[data-local-search]').addEventListener('input', (e) => { if (hs) hs.value = e.target.value; });
  };
})((window.Market = window.Market || {}));
