/* ==========================================================================
   Templora — centralised SAMPLE data
   --------------------------------------------------------------------------
   Everything in this file is DEMONSTRATION CONTENT. Prices, ratings, review
   counts, sales figures, sellers and orders are invented for the prototype
   and are not real marketplace activity. In WordPress this file is replaced
   by WooCommerce products, product taxonomies, vendor profiles and orders.
   ========================================================================== */
(function (M) {
  'use strict';

  const IMG = 'assets/images/products/';
  const SELLER_IMG = 'assets/images/sellers/';

  /* ---------- Taxonomies (independent from products) ---------- */
  const categories = [
    // Website templates
    { slug: 'html', name: 'HTML Templates', desc: 'Hand-coded HTML, CSS & JS', group: 'website', route: 'pages/html-templates.html', live: true, icon: 'code' },
    { slug: 'tailwind', name: 'Tailwind CSS Templates', desc: 'Utility-first, easy to theme', group: 'website', route: 'pages/html-templates.html?tech=tailwind', live: true, icon: 'wind' },
    { slug: 'bootstrap', name: 'Bootstrap Templates', desc: 'Familiar grid & components', group: 'website', route: 'pages/html-templates.html?tech=bootstrap', live: true, icon: 'boxes' },
    { slug: 'landing', name: 'Landing Pages', desc: 'Single-page, conversion focused', group: 'website', route: 'pages/html-templates.html?sub=landing', live: true, icon: 'rocket' },
    { slug: 'business', name: 'Business Websites', desc: 'Corporate & service sites', group: 'website', route: 'pages/html-templates.html?sub=business', live: true, icon: 'briefcase' },
    { slug: 'agency', name: 'Agency Websites', desc: 'Studios and creative teams', group: 'website', route: 'pages/html-templates.html?sub=agency', live: true, icon: 'sparkles' },
    { slug: 'portfolio', name: 'Portfolio Websites', desc: 'Show off your work', group: 'website', route: 'pages/html-templates.html?sub=portfolio', live: true, icon: 'image' },
    { slug: 'saas', name: 'SaaS Websites', desc: 'Product & startup marketing', group: 'website', route: 'pages/html-templates.html?sub=saas', live: true, icon: 'cloud' },
    { slug: 'ecommerce', name: 'E-commerce Templates', desc: 'Storefronts & product pages', group: 'website', route: 'pages/html-templates.html?sub=ecommerce', live: true, icon: 'bag' },
    // Frameworks & platforms — taxonomy exists, no sample products yet
    { slug: 'react', name: 'React Templates', desc: 'Component-based apps', group: 'framework', route: 'pages/search.html?cat=react', live: false, icon: 'atom' },
    { slug: 'nextjs', name: 'Next.js Templates', desc: 'Full-stack React sites', group: 'framework', route: 'pages/search.html?cat=nextjs', live: false, icon: 'triangle' },
    { slug: 'wordpress', name: 'WordPress Themes', desc: 'Block & classic themes', group: 'framework', route: 'pages/search.html?cat=wordpress', live: false, icon: 'globe' },
    { slug: 'shopify', name: 'Shopify Themes', desc: 'Online Store 2.0 themes', group: 'framework', route: 'pages/search.html?cat=shopify', live: false, icon: 'store' },
    // Other assets
    { slug: 'admin', name: 'Admin Dashboard Templates', desc: 'Back-office & analytics UIs', group: 'other', route: 'pages/html-templates.html?sub=admin', live: true, icon: 'layout' },
    { slug: 'ui-kits', name: 'UI Kits', desc: 'Design systems & components', group: 'other', route: 'pages/search.html?cat=ui-kits', live: false, icon: 'layers' },
    { slug: 'assets', name: 'Other Digital Assets', desc: 'Icons, illustrations & more', group: 'other', route: 'pages/search.html?cat=assets', live: false, icon: 'package' },
  ];

  /** Sub-categories of the HTML Templates category (spec §7). */
  const subcategories = [
    { slug: 'landing', name: 'Landing Pages' },
    { slug: 'business', name: 'Business Websites' },
    { slug: 'agency', name: 'Agency Websites' },
    { slug: 'portfolio', name: 'Portfolio Websites' },
    { slug: 'saas', name: 'SaaS Websites' },
    { slug: 'ecommerce', name: 'E-commerce Templates' },
    { slug: 'personal', name: 'Personal Websites' },
    { slug: 'blog', name: 'Blog & Magazine' },
    { slug: 'realestate', name: 'Real Estate Websites' },
    { slug: 'education', name: 'Education Websites' },
    { slug: 'healthcare', name: 'Healthcare Websites' },
    { slug: 'restaurant', name: 'Restaurant Websites' },
    { slug: 'admin', name: 'Admin Dashboards' },
  ];

  const technologies = {
    vanilla: 'HTML/CSS/JS',
    tailwind: 'Tailwind CSS',
    bootstrap: 'Bootstrap 5',
    alpine: 'Alpine.js',
  };
  const tools = { gsap: 'GSAP', swiper: 'Swiper', chartjs: 'Chart.js', lenis: 'Lenis' };
  const features = {
    responsive: 'Responsive Design',
    'dark-mode': 'Dark Mode',
    rtl: 'RTL Support',
    'multi-page': 'Multi-page Template',
    'one-page': 'One-page Template',
    animations: 'Animations',
    docs: 'Documentation Included',
    figma: 'Figma File Included',
  };
  const licenses = {
    personal: { name: 'Personal', desc: 'One end product for yourself or one client. Not for resale.' },
    commercial: { name: 'Commercial', desc: 'One end product that is sold or used commercially, e.g. a client SaaS site.' },
    extended: { name: 'Extended', desc: 'Use in an end product that is sold to many customers (e.g. a site builder).' },
  };

  const useCases = [
    { slug: 'startup', name: 'Startup', icon: 'rocket', href: 'pages/html-templates.html?sub=landing' },
    { slug: 'saas', name: 'SaaS', icon: 'cloud', href: 'pages/html-templates.html?sub=saas' },
    { slug: 'agency', name: 'Agency', icon: 'sparkles', href: 'pages/html-templates.html?sub=agency' },
    { slug: 'portfolio', name: 'Portfolio', icon: 'image', href: 'pages/html-templates.html?sub=portfolio' },
    { slug: 'ecommerce', name: 'E-commerce', icon: 'bag', href: 'pages/html-templates.html?sub=ecommerce' },
    { slug: 'business', name: 'Business', icon: 'briefcase', href: 'pages/search.html?q=business' },
    { slug: 'realestate', name: 'Real Estate', icon: 'home', href: 'pages/html-templates.html?sub=realestate' },
    { slug: 'education', name: 'Education', icon: 'graduation', href: 'pages/html-templates.html?sub=education' },
    { slug: 'healthcare', name: 'Healthcare', icon: 'heart-pulse', href: 'pages/html-templates.html?sub=healthcare' },
    { slug: 'restaurant', name: 'Restaurant', icon: 'utensils', href: 'pages/html-templates.html?sub=restaurant' },
  ];

  /* ---------- Sellers (fictional) ---------- */
  const sellers = [
    {
      slug: 'pixelforge', name: 'PixelForge Studio', logo: SELLER_IMG + 'pixelforge.svg', banner: SELLER_IMG + 'pixelforge-banner.svg',
      tagline: 'Conversion-focused SaaS & startup templates.',
      bio: 'A two-person studio building fast, accessible marketing sites for software companies. Every template ships with documented components and a Figma file where noted.',
      memberSince: '2024-03-14', verified: false, location: 'Lisbon, Portugal',
      supportPolicy: 'Questions answered within 2 business days via the marketplace inbox.',
      updatePolicy: 'Free updates for the lifetime of the product, including framework upgrades.',
      social: { website: 'https://example.com', github: 'https://github.com', dribbble: 'https://dribbble.com' },
    },
    {
      slug: 'northwind-ui', name: 'Northwind UI', logo: SELLER_IMG + 'northwind-ui.svg', banner: SELLER_IMG + 'northwind-ui-banner.svg',
      tagline: 'Dashboards, admin panels and commerce UIs.',
      bio: 'We design data-dense interfaces that stay readable. Our templates focus on clear information hierarchy, keyboard support and well-structured code.',
      memberSince: '2023-09-02', verified: false, location: 'Toronto, Canada',
      supportPolicy: '6 months of included support; extendable at checkout in production.',
      updatePolicy: 'Bug-fix and compatibility updates published quarterly.',
      social: { website: 'https://example.com', github: 'https://github.com' },
    },
    {
      slug: 'lumen-labs', name: 'Lumen Labs', logo: SELLER_IMG + 'lumen-labs.svg', banner: SELLER_IMG + 'lumen-labs-banner.svg',
      tagline: 'Bold agency and real-estate websites.',
      bio: 'Lumen Labs creates expressive, motion-rich websites for agencies and property brands, with performance budgets baked in.',
      memberSince: '2024-06-21', verified: false, location: 'Melbourne, Australia',
      supportPolicy: 'Support via email ticket within 3 business days.',
      updatePolicy: 'Updates for 12 months after purchase.',
      social: { website: 'https://example.com', dribbble: 'https://dribbble.com' },
    },
    {
      slug: 'grid-and-grain', name: 'Grid & Grain', logo: SELLER_IMG + 'grid-and-grain.svg', banner: SELLER_IMG + 'grid-and-grain-banner.svg',
      tagline: 'Editorial, hospitality and education templates.',
      bio: 'Typography-first templates with a warm, editorial feel for restaurants, schools and creative portfolios.',
      memberSince: '2025-01-08', verified: false, location: 'Bristol, UK',
      supportPolicy: 'Support through the marketplace inbox, usually within 48 hours.',
      updatePolicy: 'Free updates while the product is listed.',
      social: { website: 'https://example.com' },
    },
    {
      slug: 'byteframe', name: 'Byteframe', logo: SELLER_IMG + 'byteframe.svg', banner: SELLER_IMG + 'byteframe-banner.svg',
      tagline: 'Developer-friendly portfolios and SaaS kits.',
      bio: 'Byteframe is an independent developer publishing minimal, well-documented templates for developers and indie hackers — including a free starter.',
      memberSince: '2024-11-30', verified: false, location: 'Bengaluru, India',
      supportPolicy: 'Community support via GitHub discussions; direct support for paid licenses.',
      updatePolicy: 'Updates follow semantic versioning; changelog published per release.',
      social: { website: 'https://example.com', github: 'https://github.com' },
    },
  ];

  /* ---------- Products ---------- */
  const imgs = (slug) => ({
    main: IMG + slug + '-desktop.svg',
    gallery: [IMG + slug + '-desktop.svg', IMG + slug + '-inner.svg'],
    tablet: IMG + slug + '-tablet.svg',
    mobile: IMG + slug + '-mobile.svg',
  });
  const lic = (price, opts = {}) => {
    if (price === 0) return [{ id: 'personal', price: 0 }, { id: 'commercial', price: 0 }];
    const out = [{ id: 'personal', price }, { id: 'commercial', price: Math.round(price * 2.5) }];
    if (opts.extended) out.push({ id: 'extended', price: Math.round(price * 8) });
    return out;
  };

  const products = [
    {
      id: 'p-1001', slug: 'nova', name: 'Nova — SaaS Landing Page HTML Template', shortName: 'Nova',
      category: 'html', subcategory: 'saas',
      summary: 'A polished SaaS marketing site with pricing, changelog, docs and blog pages.',
      description: 'Nova gives software teams a complete marketing site out of the box: a high-conversion homepage, pricing with monthly/annual toggle, a changelog, documentation layout and blog. Components are built with Tailwind CSS utilities and small Alpine.js behaviours, so there is no build-heavy framework to maintain.',
      tech: ['tailwind', 'alpine'], tools: ['gsap'], features: ['responsive', 'dark-mode', 'multi-page', 'animations', 'docs', 'figma'],
      price: 39, originalPrice: 59, licenses: lic(39, { extended: true }),
      seller: 'pixelforge', rating: 4.8, reviewCount: 64, sales: 412, views: 9840,
      images: imgs('nova'), demoUrl: null, version: '2.3.0', updated: '2026-09-28', published: '2025-11-12', status: 'published',
      flags: { featured: true, trending: true }, pagesCount: 12,
      tags: ['saas', 'startup', 'pricing', 'software', 'landing'],
    },
    {
      id: 'p-1002', slug: 'agencypro', name: 'AgencyPro — Creative Agency Website', shortName: 'AgencyPro',
      category: 'html', subcategory: 'agency',
      summary: 'A bold, motion-led website for studios with case studies and team pages.',
      description: 'AgencyPro is built for creative studios that want to lead with their work. Large typography, case-study templates, a services matrix and a team page are paired with restrained GSAP scroll effects and Lenis smooth scrolling that respect reduced-motion preferences.',
      tech: ['vanilla'], tools: ['gsap', 'lenis', 'swiper'], features: ['responsive', 'multi-page', 'animations', 'docs', 'figma'],
      price: 49, originalPrice: null, licenses: lic(49, { extended: true }),
      seller: 'lumen-labs', rating: 4.7, reviewCount: 38, sales: 530, views: 11200,
      images: imgs('agencypro'), demoUrl: null, version: '1.6.2', updated: '2026-08-14', published: '2025-06-03', status: 'published',
      flags: { featured: true, bestseller: true }, pagesCount: 9,
      tags: ['business', 'agency', 'studio', 'creative', 'case study', 'dark'],
    },
    {
      id: 'p-1003', slug: 'portfoliox', name: 'PortfolioX — Developer Portfolio Template', shortName: 'PortfolioX',
      category: 'html', subcategory: 'portfolio',
      summary: 'A dark, terminal-inspired one-page portfolio for developers.',
      description: 'PortfolioX presents projects, experience and writing on a single fast page. It includes a project grid with filters, an experience timeline, a résumé section and a contact form ready to connect to any form service.',
      tech: ['tailwind'], tools: [], features: ['responsive', 'dark-mode', 'one-page', 'docs'],
      price: 24, originalPrice: null, licenses: lic(24),
      seller: 'byteframe', rating: 4.9, reviewCount: 51, sales: 388, views: 7600,
      images: imgs('portfoliox'), demoUrl: null, version: '1.4.0', updated: '2026-07-30', published: '2025-08-19', status: 'published',
      flags: { featured: true, trending: true }, pagesCount: 1,
      tags: ['developer', 'portfolio', 'resume', 'dark', 'personal'],
    },
    {
      id: 'p-1004', slug: 'shoplite', name: 'ShopLite — Bootstrap E-commerce Template', shortName: 'ShopLite',
      category: 'html', subcategory: 'ecommerce',
      summary: 'A clean storefront with product, cart, checkout and account templates.',
      description: 'ShopLite covers the full shopping journey as static templates: collection pages with filters, product detail with variant pickers, cart drawer, checkout layout and customer account. Built on Bootstrap 5 with Swiper carousels.',
      tech: ['bootstrap'], tools: ['swiper'], features: ['responsive', 'multi-page', 'rtl', 'docs'],
      price: 45, originalPrice: 65, licenses: lic(45, { extended: true }),
      seller: 'northwind-ui', rating: 4.5, reviewCount: 29, sales: 241, views: 6300,
      images: imgs('shoplite'), demoUrl: null, version: '3.0.1', updated: '2026-06-05', published: '2025-02-11', status: 'published',
      flags: { bestseller: true }, pagesCount: 16,
      tags: ['shop', 'store', 'ecommerce', 'fashion', 'cart'],
    },
    {
      id: 'p-1005', slug: 'dashflow', name: 'DashFlow — Admin Dashboard UI', shortName: 'DashFlow',
      category: 'html', subcategory: 'admin',
      summary: 'A data-dense admin dashboard with 40+ screens and Chart.js charts.',
      description: 'DashFlow is an admin template with analytics, CRM, orders, invoices, kanban, settings and authentication screens. Tables are sortable and responsive, charts use Chart.js, and interactive pieces are written with Alpine.js.',
      tech: ['tailwind', 'alpine'], tools: ['chartjs'], features: ['responsive', 'dark-mode', 'multi-page', 'docs', 'figma'],
      price: 59, originalPrice: null, licenses: lic(59, { extended: true }),
      seller: 'northwind-ui', rating: 4.8, reviewCount: 83, sales: 702, views: 15400,
      images: imgs('dashflow'), demoUrl: null, version: '4.1.0', updated: '2026-10-02', published: '2024-10-20', status: 'published',
      flags: { featured: true, bestseller: true }, pagesCount: 42,
      tags: ['dashboard', 'admin', 'analytics', 'crm', 'charts'],
    },
    {
      id: 'p-1006', slug: 'launchkit', name: 'LaunchKit — Startup Landing Page', shortName: 'LaunchKit',
      category: 'html', subcategory: 'landing',
      summary: 'A fast one-page launch site with waitlist, features and FAQ sections.',
      description: 'LaunchKit helps founders get a credible landing page live in an afternoon. It includes a waitlist form, feature grid, social-proof section, pricing preview and FAQ, all in a single HTML file with Tailwind CSS.',
      tech: ['tailwind'], tools: [], features: ['responsive', 'one-page', 'animations', 'docs'],
      price: 19, originalPrice: null, licenses: lic(19),
      seller: 'pixelforge', rating: 4.6, reviewCount: 47, sales: 615, views: 12100,
      images: imgs('launchkit'), demoUrl: null, version: '1.9.0', updated: '2026-09-10', published: '2025-04-07', status: 'published',
      flags: { trending: true, bestseller: true }, pagesCount: 1,
      tags: ['startup', 'landing', 'waitlist', 'launch', 'product'],
    },
    {
      id: 'p-1007', slug: 'studiogrid', name: 'StudioGrid — Designer Portfolio', shortName: 'StudioGrid',
      category: 'html', subcategory: 'portfolio',
      summary: 'An editorial masonry portfolio for designers and photographers.',
      description: 'StudioGrid puts work first with a masonry gallery, full-bleed case studies and a quiet typographic system. Smooth scrolling and image reveals are progressive enhancements — the site is fully usable without JavaScript.',
      tech: ['vanilla'], tools: ['gsap', 'lenis'], features: ['responsive', 'multi-page', 'animations', 'docs'],
      price: 29, originalPrice: null, licenses: lic(29),
      seller: 'grid-and-grain', rating: 4.7, reviewCount: 22, sales: 133, views: 4100,
      images: imgs('studiogrid'), demoUrl: null, version: '1.1.0', updated: '2026-09-22', published: '2026-08-30', status: 'published',
      flags: { new: true }, pagesCount: 6,
      tags: ['designer', 'portfolio', 'photography', 'gallery', 'minimal'],
    },
    {
      id: 'p-1008', slug: 'clouddesk', name: 'CloudDesk — SaaS Application Website', shortName: 'CloudDesk',
      category: 'html', subcategory: 'saas',
      summary: 'Marketing site plus in-app screens for a helpdesk-style SaaS.',
      description: 'CloudDesk combines a marketing website with sample in-app screens (inbox, ticket view, reports) so you can show prospects the product inside your site. Built with Bootstrap 5 and Chart.js.',
      tech: ['bootstrap'], tools: ['chartjs'], features: ['responsive', 'multi-page', 'docs'],
      price: 42, originalPrice: null, licenses: lic(42, { extended: true }),
      seller: 'byteframe', rating: 4.4, reviewCount: 17, sales: 96, views: 3500,
      images: imgs('clouddesk'), demoUrl: null, version: '1.0.3', updated: '2026-10-06', published: '2026-09-15', status: 'published',
      flags: { new: true }, pagesCount: 14,
      tags: ['business', 'saas', 'helpdesk', 'support', 'app', 'software'],
    },
    {
      id: 'p-1009', slug: 'realtyspace', name: 'RealtySpace — Real Estate Website', shortName: 'RealtySpace',
      category: 'html', subcategory: 'realestate',
      summary: 'Property listings, search, agent profiles and a mortgage calculator.',
      description: 'RealtySpace includes listing grids, a property detail page with gallery and floor plans, agent profiles, a neighbourhood guide and a simple mortgage calculator written in vanilla JavaScript.',
      tech: ['bootstrap'], tools: ['swiper'], features: ['responsive', 'multi-page', 'docs'],
      price: 36, originalPrice: null, licenses: lic(36),
      seller: 'lumen-labs', rating: 4.6, reviewCount: 19, sales: 158, views: 5200,
      images: imgs('realtyspace'), demoUrl: null, version: '2.0.0', updated: '2026-05-18', published: '2025-05-02', status: 'published',
      flags: {}, pagesCount: 11,
      tags: ['business', 'real estate', 'property', 'listings', 'agent', 'homes'],
    },
    {
      id: 'p-1010', slug: 'edunova', name: 'EduNova — Education Website Template', shortName: 'EduNova',
      category: 'html', subcategory: 'education',
      summary: 'Course catalogue, lesson pages, instructors and events for schools.',
      description: 'EduNova serves online academies and schools with a course catalogue, course detail and lesson layouts, instructor profiles, events calendar and an enrolment form. Tailwind CSS with Swiper sliders.',
      tech: ['tailwind'], tools: ['swiper'], features: ['responsive', 'multi-page', 'rtl', 'docs', 'figma'],
      price: 34, originalPrice: 44, licenses: lic(34),
      seller: 'grid-and-grain', rating: 4.5, reviewCount: 26, sales: 174, views: 4800,
      images: imgs('edunova'), demoUrl: null, version: '1.3.1', updated: '2026-08-01', published: '2025-09-09', status: 'published',
      flags: { trending: true }, pagesCount: 13,
      tags: ['education', 'courses', 'school', 'lms', 'academy'],
    },
    {
      id: 'p-1011', slug: 'mediq', name: 'Mediq — Healthcare Clinic Website', shortName: 'Mediq',
      category: 'html', subcategory: 'healthcare',
      summary: 'Calm, accessible clinic website with departments and appointment form.',
      description: 'Mediq is designed for clinics and practices: departments, doctor profiles, appointment request form, patient resources and FAQs. High-contrast colour choices and large touch targets throughout.',
      tech: ['bootstrap'], tools: [], features: ['responsive', 'multi-page', 'docs'],
      price: 32, originalPrice: null, licenses: lic(32),
      seller: 'northwind-ui', rating: 4.3, reviewCount: 9, sales: 41, views: 1900,
      images: imgs('mediq'), demoUrl: null, version: '1.0.0', updated: '2026-10-01', published: '2026-10-01', status: 'published',
      flags: { new: true }, pagesCount: 8,
      tags: ['business', 'healthcare', 'clinic', 'medical', 'doctor', 'hospital'],
    },
    {
      id: 'p-1012', slug: 'savora', name: 'Savora — Restaurant Website', shortName: 'Savora',
      category: 'html', subcategory: 'restaurant',
      summary: 'An atmospheric restaurant site with menus, reservations and events.',
      description: 'Savora sets the mood with full-bleed imagery, a printable menu layout, private-dining enquiries and a reservation form. Subtle GSAP transitions and Swiper galleries.',
      tech: ['vanilla'], tools: ['gsap', 'swiper'], features: ['responsive', 'multi-page', 'animations', 'docs'],
      price: 28, originalPrice: null, licenses: lic(28),
      seller: 'grid-and-grain', rating: 4.8, reviewCount: 14, sales: 67, views: 2600,
      images: imgs('savora'), demoUrl: null, version: '1.0.2', updated: '2026-09-26', published: '2026-09-04', status: 'published',
      flags: { new: true }, pagesCount: 7,
      tags: ['restaurant', 'cafe', 'food', 'menu', 'bar'],
    },
    {
      id: 'p-1013', slug: 'inkwell', name: 'Inkwell — Blog & Magazine Template', shortName: 'Inkwell',
      category: 'html', subcategory: 'blog',
      summary: 'A fast editorial blog with category, article and author templates.',
      description: 'Inkwell is a reading-first magazine layout with a front page, category archives, long-form article template with table of contents, author pages and newsletter sign-up. Includes RTL styles.',
      tech: ['tailwind'], tools: [], features: ['responsive', 'multi-page', 'rtl', 'dark-mode', 'docs'],
      price: 26, originalPrice: null, licenses: lic(26),
      seller: 'pixelforge', rating: 4.2, reviewCount: 11, sales: 58, views: 2200,
      images: imgs('inkwell'), demoUrl: null, version: '1.2.0', updated: '2026-04-12', published: '2025-12-01', status: 'published',
      flags: {}, pagesCount: 10,
      tags: ['blog', 'magazine', 'news', 'editorial', 'writing'],
    },
    {
      id: 'p-1014', slug: 'solo', name: 'Solo — Personal Website Starter', shortName: 'Solo',
      category: 'html', subcategory: 'personal',
      summary: 'A free, minimal personal site starter with blog and about pages.',
      description: 'Solo is a free starter for personal websites: home, about, writing and contact pages in plain HTML and CSS with no dependencies. A good base to learn from or extend.',
      tech: ['vanilla'], tools: [], features: ['responsive', 'multi-page', 'docs'],
      price: 0, originalPrice: null, licenses: lic(0),
      seller: 'byteframe', rating: 4.6, reviewCount: 33, sales: 1290, views: 8900,
      images: imgs('solo'), demoUrl: null, version: '1.5.0', updated: '2026-07-09', published: '2025-03-15', status: 'published',
      flags: {}, pagesCount: 4,
      tags: ['personal', 'free', 'blog', 'minimal', 'starter'],
    },
    // Seller-only listings (not public) — used to demonstrate dashboard statuses.
    {
      id: 'p-2001', slug: 'orbit', name: 'Orbit — Crypto Landing Page', shortName: 'Orbit', category: 'html', subcategory: 'landing',
      summary: 'Awaiting marketplace review.', description: '', tech: ['tailwind'], tools: ['gsap'], features: ['responsive', 'one-page'],
      price: 29, originalPrice: null, licenses: lic(29), seller: 'pixelforge', rating: 0, reviewCount: 0, sales: 0, views: 0,
      images: { main: null, gallery: [] }, demoUrl: null, version: '1.0.0', updated: '2026-10-09', published: null, status: 'pending', flags: {}, pagesCount: 1, tags: [],
    },
    {
      id: 'p-2002', slug: 'halo', name: 'Halo — Event & Conference Website', shortName: 'Halo', category: 'html', subcategory: 'business',
      summary: 'Draft — not yet submitted.', description: '', tech: ['vanilla'], tools: [], features: ['responsive'],
      price: 35, originalPrice: null, licenses: lic(35), seller: 'pixelforge', rating: 0, reviewCount: 0, sales: 0, views: 0,
      images: { main: null, gallery: [] }, demoUrl: null, version: '0.9.0', updated: '2026-10-11', published: null, status: 'draft', flags: {}, pagesCount: 5, tags: [],
    },
    {
      id: 'p-2003', slug: 'vertex', name: 'Vertex — Consulting Firm Website', shortName: 'Vertex', category: 'html', subcategory: 'business',
      summary: 'Rejected — screenshots did not match the demo.', description: '', tech: ['bootstrap'], tools: [], features: ['responsive', 'multi-page'],
      price: 31, originalPrice: null, licenses: lic(31), seller: 'pixelforge', rating: 0, reviewCount: 0, sales: 0, views: 0,
      images: { main: null, gallery: [] }, demoUrl: null, version: '1.0.0', updated: '2026-09-30', published: null, status: 'rejected', flags: {}, pagesCount: 6, tags: [],
      rejectionReason: 'Preview screenshots did not match the live demo. Please upload current screenshots and resubmit.',
    },
  ];

  /* ---------- Per-product detail content, derived by type ---------- */
  const PAGE_SETS = {
    saas: ['Home', 'Features', 'Pricing', 'Integrations', 'Changelog', 'Docs layout', 'Blog', 'Blog post', 'About', 'Contact', 'Log in', '404'],
    agency: ['Home', 'Work', 'Case study', 'Services', 'About', 'Team', 'Careers', 'Contact', '404'],
    portfolio: ['Home', 'Projects', 'Project detail', 'About', 'Contact', '404'],
    ecommerce: ['Home', 'Collection', 'Product', 'Cart', 'Checkout', 'Account', 'Order history', 'Wishlist', 'Search', 'About', 'Contact', 'FAQ', 'Blog', 'Blog post', 'Lookbook', '404'],
    admin: ['Analytics', 'CRM', 'Orders', 'Invoices', 'Kanban', 'Calendar', 'Settings', 'Profile', 'Sign in', 'Sign up', '…and 30+ more'],
    landing: ['Single page: hero, features, social proof, pricing, FAQ, waitlist'],
    realestate: ['Home', 'Listings', 'Property detail', 'Agents', 'Agent profile', 'Neighbourhoods', 'Mortgage calculator', 'Blog', 'About', 'Contact', '404'],
    education: ['Home', 'Courses', 'Course detail', 'Lesson', 'Instructors', 'Instructor profile', 'Events', 'Pricing', 'Blog', 'About', 'Contact', 'Enrol', '404'],
    healthcare: ['Home', 'Departments', 'Doctors', 'Doctor profile', 'Appointments', 'Patient resources', 'FAQ', 'Contact'],
    restaurant: ['Home', 'Menu', 'Reservations', 'Private dining', 'Events', 'About', 'Contact'],
    blog: ['Front page', 'Category', 'Article', 'Author', 'Tag archive', 'Search', 'About', 'Newsletter', 'Contact', '404'],
    personal: ['Home', 'About', 'Writing', 'Contact'],
    business: ['Home', 'Services', 'About', 'Contact'],
  };

  function details(p) {
    const tech = p.tech.map((t) => technologies[t]);
    const pages = p.pagesCount === 1 && p.subcategory === 'portfolio'
      ? ['Single page: intro, projects, experience, writing, contact']
      : PAGE_SETS[p.subcategory] || PAGE_SETS.business;
    return {
      includedPages: pages,
      components: ['Header & mobile navigation', 'Hero variants', 'Feature grids', 'Cards & lists', 'Forms with validation styles', 'Footer variants']
        .concat(p.tools.includes('swiper') ? ['Carousels (Swiper)'] : [])
        .concat(p.tools.includes('chartjs') ? ['Charts (Chart.js)'] : [])
        .concat(p.features.includes('dark-mode') ? ['Dark mode toggle'] : []),
      technologies: tech.concat(p.tools.map((t) => tools[t])),
      compatibility: ['Chrome (latest 2)', 'Firefox (latest 2)', 'Safari 16+', 'Edge (latest 2)', 'iOS Safari 16+', 'Chrome for Android'],
      installation: [
        'Download and unzip the package from your account’s Downloads page.',
        p.tech.includes('tailwind') ? 'Run `npm install` then `npm run dev` to start the Tailwind watcher.' : 'Open `index.html` in a browser — no build step is required.',
        'Replace placeholder text and images in each HTML page.',
        'Upload the `dist/` (or project) folder to any static host.',
      ],
      documentation: 'Documentation is included as an HTML file inside the download and covers structure, customisation, colour tokens and component usage.',
      dependencies: p.tools.length ? p.tools.map((t) => tools[t]) : ['None — no third-party JavaScript libraries'],
      requirements: p.tech.includes('tailwind') ? ['Node.js 18+ (only for rebuilding CSS)', 'A code editor'] : ['A code editor', 'Any static web host'],
      support: (sellers.find((s) => s.slug === p.seller) || {}).supportPolicy,
      updates: (sellers.find((s) => s.slug === p.seller) || {}).updatePolicy,
      changelog: [
        { version: p.version, date: p.updated, notes: ['Improved focus styles across navigation and forms', 'Updated dependencies to latest stable versions', 'Fixed mobile menu scroll lock on iOS'] },
        { version: bump(p.version, -1), date: shiftDate(p.updated, -74), notes: ['Added new section variants', 'Reduced CSS bundle size'] },
        { version: '1.0.0', date: p.published, notes: ['Initial release'] },
      ],
      faqs: [
        { q: 'Can I use this template for a client project?', a: 'Yes, with the Commercial license for one end product. The Personal license covers one non-commercial end product.' },
        { q: 'Does it include a backend or CMS?', a: 'No. This is a front-end template (HTML, CSS and JavaScript). You can connect forms and content to the service of your choice.' },
        { q: 'How do I receive updates?', a: 'Updates appear in your account under Downloads. ' + ((sellers.find((s) => s.slug === p.seller) || {}).updatePolicy || '') },
      ],
    };
  }
  function bump(v, d) {
    const parts = v.split('.').map(Number);
    parts[1] = Math.max(0, parts[1] + d);
    return parts.join('.');
  }
  function shiftDate(iso, days) {
    const dt = new Date(iso + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().slice(0, 10);
  }

  /* ---------- Sample reviews (demo) ---------- */
  const reviews = [
    { productId: 'p-1001', author: 'Demo buyer · R.K.', rating: 5, date: '2026-09-30', title: 'Clean code, easy to theme', body: 'The Tailwind config is tidy and the pricing toggle worked first time. Swapping brand colours took about ten minutes.' },
    { productId: 'p-1001', author: 'Demo buyer · M.L.', rating: 5, date: '2026-08-12', title: 'Docs layout is a nice bonus', body: 'We used the docs layout for our help centre as well as the marketing site. Good keyboard support in the navigation.' },
    { productId: 'p-1001', author: 'Demo buyer · J.P.', rating: 4, date: '2026-07-03', title: 'Great, wished for more blog variants', body: 'Solid template. Would love one more blog index variant, but the components made it easy to build one.' },
    { productId: 'p-1005', author: 'Demo buyer · A.S.', rating: 5, date: '2026-09-21', title: 'Tables are genuinely responsive', body: 'The stacked table pattern on mobile saved us a lot of work. Charts are easy to swap for our own data.' },
    { productId: 'p-1005', author: 'Demo buyer · T.N.', rating: 4, date: '2026-06-18', title: 'Lots of screens', body: 'Plenty of screens to start from. Dark mode needed a couple of tweaks for our brand colours.' },
    { productId: 'p-1002', author: 'Demo buyer · E.V.', rating: 5, date: '2026-08-29', title: 'Motion feels premium but not heavy', body: 'Animations are subtle and turn off with reduced motion. Case-study template is excellent.' },
    { productId: 'p-1003', author: 'Demo buyer · D.C.', rating: 5, date: '2026-09-02', title: 'Exactly what I needed', body: 'Got my portfolio online in an evening. Lighthouse scores were excellent out of the box.' },
    { productId: 'p-1006', author: 'Demo buyer · S.B.', rating: 4, date: '2026-08-08', title: 'Fast to launch', body: 'Simple and effective. The waitlist form just needed our endpoint.' },
  ];

  /* ---------- Customer account samples ---------- */
  const customer = { name: 'Alex Morgan', email: 'alex@example.com', joined: '2025-04-18' };
  const customerOrders = [
    { number: 'DEMO-10482', date: '2026-09-18', status: 'completed', items: [{ id: 'p-1001', license: 'commercial', qty: 1 }, { id: 'p-1003', license: 'personal', qty: 1 }] },
    { number: 'DEMO-10311', date: '2026-07-02', status: 'completed', items: [{ id: 'p-1005', license: 'personal', qty: 1 }] },
    { number: 'DEMO-10107', date: '2026-04-27', status: 'refunded', items: [{ id: 'p-1009', license: 'personal', qty: 1 }] },
  ];
  const supportTickets = [
    { id: 'T-2207', subject: 'Dark mode toggle not persisting', product: 'p-1001', status: 'open', updated: '2026-10-10', messages: [
      { from: 'You', date: '2026-10-09', body: 'After reloading, the theme resets to light. Is localStorage expected to be used?' },
      { from: 'PixelForge Studio (demo)', date: '2026-10-10', body: 'Thanks! Version 2.3.1 will persist the preference. In the meantime, see docs › Theming for a two-line fix.' },
    ] },
    { id: 'T-2150', subject: 'Invoice with company details', product: null, status: 'resolved', updated: '2026-09-20', messages: [
      { from: 'You', date: '2026-09-19', body: 'Could my invoice include our VAT number?' },
      { from: 'Templora Support (demo)', date: '2026-09-20', body: 'Yes — add it under Profile › Billing details and re-download the invoice.' },
    ] },
  ];

  /* ---------- Seller workspace samples (demo seller: PixelForge Studio) ---------- */
  const sellerOrders = [
    { ref: 'DEMO-S-8841', productId: 'p-1001', date: '2026-10-11', gross: 98, license: 'commercial', status: 'completed' },
    { ref: 'DEMO-S-8839', productId: 'p-1006', date: '2026-10-11', gross: 19, license: 'personal', status: 'completed' },
    { ref: 'DEMO-S-8826', productId: 'p-1001', date: '2026-10-09', gross: 39, license: 'personal', status: 'completed' },
    { ref: 'DEMO-S-8810', productId: 'p-1013', date: '2026-10-07', gross: 26, license: 'personal', status: 'refunded' },
    { ref: 'DEMO-S-8797', productId: 'p-1006', date: '2026-10-05', gross: 48, license: 'commercial', status: 'completed' },
    { ref: 'DEMO-S-8774', productId: 'p-1001', date: '2026-10-02', gross: 312, license: 'extended', status: 'completed' },
    { ref: 'DEMO-S-8760', productId: 'p-1006', date: '2026-09-30', gross: 19, license: 'personal', status: 'pending' },
    { ref: 'DEMO-S-8742', productId: 'p-1001', date: '2026-09-27', gross: 39, license: 'personal', status: 'completed' },
  ];
  /** Commission is not defined for the prototype. A placeholder rate is used
   *  only to show how the table will look; it is labelled as such in the UI. */
  const demoCommissionRate = 0.2;
  const payouts = [
    { id: 'DEMO-PO-031', date: '2026-10-01', amount: 1840.5, method: 'Bank transfer', status: 'paid' },
    { id: 'DEMO-PO-030', date: '2026-09-01', amount: 1622.0, method: 'Bank transfer', status: 'paid' },
    { id: 'DEMO-PO-029', date: '2026-08-01', amount: 1415.75, method: 'Bank transfer', status: 'paid' },
  ];
  const sellerMessages = [
    { from: 'Demo buyer · K.W.', product: 'p-1001', date: '2026-10-11', subject: 'Pre-sale: multi-language support?', body: 'Does Nova support adding a language switcher? We need English and German.', unread: true },
    { from: 'Demo buyer · F.H.', product: 'p-1006', date: '2026-10-08', subject: 'Waitlist form endpoint', body: 'Which form services have you tested the waitlist form with?', unread: true },
    { from: 'Demo buyer · O.A.', product: 'p-1013', date: '2026-09-29', subject: 'RTL font recommendation', body: 'Thanks for the RTL styles! Which Arabic font pairs best with the headings?', unread: false },
  ];
  /** 12 months of demo sales/views for the analytics charts. */
  const analytics = {
    months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    sales: [1180, 1420, 1260, 1390, 1510, 1470, 1690, 1640, 1820, 1910, 2040, 2210],
    salesPrev: [960, 1100, 1040, 1150, 1210, 1190, 1300, 1350, 1420, 1480, 1560, 1600],
    views: [5200, 6100, 5600, 5900, 6400, 6300, 7100, 6900, 7600, 8000, 8400, 9100],
    conversion: [1.9, 2.0, 1.9, 2.1, 2.2, 2.1, 2.3, 2.2, 2.4, 2.4, 2.5, 2.6],
    wishlistAdds: [140, 162, 150, 171, 188, 180, 204, 199, 221, 236, 249, 263],
  };

  /* ---------- Help centre ---------- */
  const helpTopics = [
    { slug: 'buying', name: 'Buying Templates', icon: 'cart', articles: [
      { q: 'How do I buy a template?', a: 'Open a product, choose a license, then select Buy Now or Add to Cart and complete checkout. In this prototype checkout is simulated and no payment is taken.' },
      { q: 'Which license should I choose?', a: 'Personal covers one non-commercial end product. Commercial covers one end product used commercially. Extended, where offered, covers end products sold to many customers. See the License Agreement for full terms.' },
      { q: 'Can I preview a template before buying?', a: 'Yes. Every product page has screenshots, device previews and a Live Demo link supplied by the seller.' },
    ] },
    { slug: 'downloads', name: 'Downloads', icon: 'download', articles: [
      { q: 'Where are my downloads?', a: 'After a completed purchase, files are listed under Account › My Downloads. Download links are generated securely for verified purchases in production.' },
      { q: 'A download link expired. What now?', a: 'Return to My Downloads and request a fresh link. Links are short-lived for security.' },
    ] },
    { slug: 'licenses', name: 'Licenses', icon: 'shield', articles: [
      { q: 'Can I use one license for multiple projects?', a: 'No. Each license covers a single end product. Buy an additional license for each new project.' },
      { q: 'Can I upgrade my license later?', a: 'License upgrades are planned for production. Contact support with your order number in the meantime.' },
    ] },
    { slug: 'payments', name: 'Payments', icon: 'card', articles: [
      { q: 'Which payment methods are accepted?', a: 'Payment methods depend on the payment gateway configured in production. This prototype shows placeholders only and never collects card details.' },
      { q: 'Do prices include tax?', a: 'Applicable taxes are calculated at checkout based on your billing location in production. The prototype does not calculate real taxes.' },
    ] },
    { slug: 'refunds', name: 'Refunds', icon: 'refresh', articles: [
      { q: 'Can I get a refund?', a: 'Refund eligibility is defined in the Refund Policy (placeholder copy until approved). Typically refunds apply when an item is broken, not as described, or not supported as promised.' },
    ] },
    { slug: 'seller-registration', name: 'Seller Registration', icon: 'store', articles: [
      { q: 'Who can sell on Templora?', a: 'Designers and developers who own the rights to their work and meet the quality guidelines. Apply on the Become a Seller page.' },
      { q: 'Do I need a separate seller account?', a: 'No. Selling is enabled on your existing account once your seller application is approved.' },
    ] },
    { slug: 'product-submission', name: 'Product Submission', icon: 'upload', articles: [
      { q: 'What do I need to submit a product?', a: 'Title, description, category, technologies, price, license options, preview screenshots, a live demo URL, the downloadable ZIP and documentation.' },
      { q: 'How long does review take?', a: 'Review times will be published once the review team is in place. You will see the status of each submission in your dashboard.' },
    ] },
    { slug: 'earnings', name: 'Earnings and Payouts', icon: 'wallet', articles: [
      { q: 'What commission does the marketplace take?', a: 'Commission rates have not been finalised. They will be published in the Seller Agreement before selling opens.' },
      { q: 'When are payouts sent?', a: 'Payout schedules and methods will be defined with the payment provider. The dashboard shows how balances will be presented.' },
    ] },
    { slug: 'technical', name: 'Technical Support', icon: 'wrench', articles: [
      { q: 'Who provides support for a template?', a: 'The seller supports their products according to the support policy shown on the product page.' },
      { q: 'The template looks broken after editing.', a: 'Check the browser console for errors, confirm all asset paths are correct, and rebuild CSS if the template uses Tailwind.' },
    ] },
  ];

  const legalDocs = [
    { slug: 'terms', name: 'Terms and Conditions' },
    { slug: 'privacy', name: 'Privacy Policy' },
    { slug: 'refund', name: 'Refund Policy' },
    { slug: 'license', name: 'License Agreement' },
    { slug: 'seller', name: 'Seller Agreement' },
    { slug: 'dmca', name: 'Copyright & DMCA Policy' },
  ];

  /** Configurable announcement (spec §6.1). */
  const announcement = {
    id: 'launch-2026-10',
    text: 'Templora is in preview — browse sample templates and try the full buying and selling flow.',
    link: { label: 'What’s included', href: 'pages/about.html' },
  };

  M.data = {
    categories, subcategories, technologies, tools, features, licenses, useCases,
    sellers, products, reviews, customer, customerOrders, supportTickets,
    sellerOrders, demoCommissionRate, payouts, sellerMessages, analytics,
    helpTopics, legalDocs, announcement, details, demoSellerSlug: 'pixelforge',
  };
})((window.Market = window.Market || {}));
