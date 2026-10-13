/* Supporting pages: About, Contact, Help Center and Legal (WordPress pages). */
(function (M) {
  'use strict';
  const { $, $$, url, esc, qs } = M.util;
  const crumbs = (label) => { const el = $('[data-breadcrumbs]'); if (el) el.innerHTML = M.render.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label }]); };

  M.pages.about = () => crumbs('About');
  M.pages.notfound = () => {};

  M.pages.contact = function () {
    crumbs('Contact');
    const form = $('[data-contact-form]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      $('[data-success]').hidden = true;
      if (!M.forms.validate(form)) return;
      await M.forms.simulate(form.querySelector('[type=submit]'), 1000);
      form.reset();
      $('#c-msg-count').textContent = '0 / 2000';
      const s = $('[data-success]'); s.hidden = false; s.focus();
    });
  };

  M.pages.help = function () {
    crumbs('Help Center');
    const topics = M.data.helpTopics;
    $('[data-topics]').innerHTML = topics.map((t) => '<li><a class="topic-card" href="#' + t.slug + '"><span class="usecase__icon">' + M.icon(t.icon) + '</span><span><h3>' + esc(t.name) + '</h3><p>' + t.articles.length + ' article' + (t.articles.length > 1 ? 's' : '') + '</p></span></a></li>').join('');
    const host = $('[data-articles]');
    function render(q) {
      const term = (q || '').toLowerCase().trim();
      let shown = 0;
      host.innerHTML = topics.map((t) => {
        const arts = t.articles.filter((a) => !term || (a.q + ' ' + a.a + ' ' + t.name).toLowerCase().includes(term));
        shown += arts.length;
        if (!arts.length) return '';
        return '<section id="' + t.slug + '" style="scroll-margin-top:120px;padding-top:32px" aria-labelledby="ht-' + t.slug + '"><h2 class="text-h3" id="ht-' + t.slug + '" style="display:flex;align-items:center;gap:10px">' + M.icon(t.icon) + esc(t.name) + '</h2><div style="margin-top:8px">' + M.render.accordion(arts.map((a) => ({ q: a.q, a: esc(a.a), open: !!term }))) + '</div></section>';
      }).join('') || M.render.emptyState({ icon: 'search', title: 'No articles match “' + q + '”', desc: 'Try different words, or contact support and we’ll help directly.', actions: '<a class="btn btn--primary" href="contact.html">Contact support</a>' });
      $('[data-help-status]').textContent = term ? shown + ' articles found' : '';
    }
    render('');
    const input = $('#help-q');
    input.addEventListener('input', M.util.debounce(() => render(input.value), 200));
    $('[data-help-search-form]').addEventListener('submit', (e) => { e.preventDefault(); render(input.value); });
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  };

  /* Legal — placeholder copy, clearly marked, with one reusable layout. */
  const PLACEHOLDER = '<div class="alert alert--warning" style="margin-bottom:24px;max-width:none">' + '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>' + '<div><p class="alert__title">Placeholder legal copy</p><p class="alert__body">This text is a structural template only and is not legal advice. Replace it with policy content approved by qualified counsel before launch.</p></div></div>';
  const DOCS = {
    terms: { sections: [['Acceptance of terms', 'By creating an account or purchasing on Templora you agree to these terms. [Placeholder — define the contracting entity, governing law and how changes are communicated.]'], ['Accounts', 'You are responsible for keeping your login details secure and for activity on your account. One account may be used for both buying and selling.'], ['Purchases', 'Prices are shown in USD. Applicable taxes are calculated at checkout. A purchase grants a license to use the product; it does not transfer ownership. [Placeholder]'], ['Prohibited use', 'Do not resell, redistribute or share downloaded files except as allowed by the License Agreement. [Placeholder]'], ['Liability', '[Placeholder — limitation of liability, warranties disclaimer and indemnities to be drafted by counsel.]']] },
    privacy: { sections: [['Information we collect', 'Account details (name, email), order history, and technical data such as device and usage information. Payment details are processed by the payment provider and are not stored by Templora. [Placeholder]'], ['How we use information', 'To provide purchases and downloads, support, fraud prevention, and — with consent — marketing emails.'], ['Sharing', 'With sellers when needed to fulfil support, with payment and email providers, and where required by law. [Placeholder]'], ['Your rights', 'Access, correction, deletion and objection rights depend on your location. Contact us to exercise them. [Placeholder]'], ['Cookies', '[Placeholder — describe essential and optional cookies and how consent is managed.]']] },
    refund: { sections: [['Overview', 'Because digital products can’t be returned, refunds are assessed case by case. [Placeholder — define eligibility window.]'], ['Eligible situations', 'The product is materially different from its description or preview; the files are broken or incomplete; or promised support is not provided. [Placeholder]'], ['Not eligible', 'Change of mind after download, or lack of technical skills to use the product. [Placeholder]'], ['How to request', 'Contact support with your order number and a description of the issue.']] },
    license: { sections: [['Personal license', 'Use in one end product for yourself or a single client, which is not sold. [Placeholder]'], ['Commercial license', 'Use in one end product that is sold or used commercially, such as a client SaaS marketing site. [Placeholder]'], ['Extended license', 'Use in one end product that is sold to many end customers (for example a site builder or SaaS where users create sites). [Placeholder]'], ['What every license prohibits', 'Reselling or redistributing the source files as-is, or as part of another template, theme or kit.'], ['Third-party assets', 'Bundled fonts, icons, libraries and images keep their own licenses as listed by the seller.']] },
    seller: { sections: [['Eligibility', 'Sellers must own or have the rights to sell everything included in their products. [Placeholder]'], ['Product review', 'Templora reviews each product before publishing and may request changes or reject submissions that don’t meet quality guidelines.'], ['Fees and commission', 'Commission rates and any seller plans will be specified here before selling opens. No rates are set in this prototype.'], ['Payouts', 'Payout schedules, minimums and methods will be defined with the payment provider. [Placeholder]'], ['Support obligations', 'Sellers provide support according to the policy shown on their storefront.']] },
    dmca: { sections: [['Reporting infringement', 'If you believe content on Templora infringes your copyright, send a notice including your contact details, the work, the infringing URL and a good-faith statement. [Placeholder]'], ['Counter-notices', 'Sellers may submit a counter-notice if they believe content was removed in error. [Placeholder]'], ['Repeat infringers', 'Accounts of repeat infringers may be terminated.'], ['Contact', 'copyright@templora.example (placeholder)']] },
  };
  M.pages.legal = function () {
    const docs = M.data.legalDocs;
    function show(slug, push) {
      const meta = docs.find((d) => d.slug === slug) || docs[0];
      const doc = DOCS[meta.slug];
      $('[data-breadcrumbs]').innerHTML = M.render.breadcrumbs([{ label: 'Home', href: url('index.html') }, { label: 'Legal', href: url('pages/legal.html') }, { label: meta.name }]);
      $('[data-legal-title]').textContent = meta.name;
      $('[data-legal-updated]').textContent = 'Last updated: — (draft placeholder)';
      document.title = meta.name + ' | Templora';
      $('[data-legal-nav]').innerHTML = docs.map((d) => '<li><a href="?doc=' + d.slug + '"' + (d.slug === meta.slug ? ' aria-current="page"' : '') + ' data-doc="' + d.slug + '">' + esc(d.name) + '</a></li>').join('');
      $('[data-legal-body]').innerHTML = PLACEHOLDER + '<nav aria-label="On this page"><p style="font-weight:600;color:var(--color-text)">On this page</p><ol>' + doc.sections.map((s, i) => '<li><a href="#s' + (i + 1) + '">' + esc(s[0]) + '</a></li>').join('') + '</ol></nav>' +
        doc.sections.map((s, i) => '<h2 id="s' + (i + 1) + '">' + (i + 1) + '. ' + esc(s[0]) + '</h2><p>' + esc(s[1]) + '</p>').join('') +
        '<p style="margin-top:32px">Questions about this policy? <a href="contact.html">Contact us</a>.</p>';
      if (push) history.pushState({ doc: meta.slug }, '', '?doc=' + meta.slug);
    }
    $('[data-legal-nav]').addEventListener('click', (e) => {
      const a = e.target.closest('[data-doc]');
      if (!a) return;
      e.preventDefault();
      show(a.dataset.doc, true);
      $('[data-legal-title]').setAttribute('tabindex', '-1');
      $('[data-legal-title]').focus();
    });
    window.addEventListener('popstate', () => show(qs('doc') || 'terms'));
    show(qs('doc') || 'terms');
  };
})((window.Market = window.Market || {}));
