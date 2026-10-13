# Templora: digital templates marketplace (frontend prototype)

Templora is a high-fidelity, multi-page HTML prototype of a **multi-vendor website-template marketplace**. Buyers can discover, preview, compare, buy and download templates. Sellers can apply, set up a store, submit products and track earnings.

It's built to be converted later into a **custom WordPress theme + WooCommerce + a multi-vendor plugin** (see [`docs/WORDPRESS-MAPPING.md`](docs/WORDPRESS-MAPPING.md)).

> **Everything is demo content.** Products, sellers, prices, ratings, reviews, sales, orders and payouts are fictional sample data. There is no backend: authentication, checkout, uploads, downloads and payouts are simulated in the browser and clearly labelled as such.

---

## Run it locally

No build step is needed to *view* the prototype. The compiled CSS is committed.

```bash
# Any static server works. Pick one:
npx http-server . -p 8080 -c-1      # or: npm run serve
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

All scripts are classic `defer` scripts under a single `window.Market` namespace, so pages also work from `file://`. A server is still recommended, because some browsers restrict `localStorage` on `file://`.

### Rebuilding assets (optional)

```bash
npm install            # installs Tailwind CSS CLI 3.4
npm run build:css      # css/tailwind.src.css -> css/tailwind.css (minified)
npm run watch:css      # rebuild on change
npm run previews       # regenerate the SVG template-preview mockups
```

### QA smoke test

```bash
npm run serve                                  # terminal 1
npm i -D playwright && npx playwright install chromium
npm run qa                                     # terminal 2
```

The smoke test loads 33 page states at 1440, 1024, 768, 390 and 360px. It fails on any of:

- console errors
- uncaught exceptions
- failed local requests
- horizontal overflow
- internal links that point to missing files

---

## Routes

The spec's routes map onto static files. Query strings stand in for dynamic segments.

| Spec route | Prototype file |
|---|---|
| `/` | `index.html` |
| `/templates/html` | `pages/html-templates.html` (`?sub=saas`, `?tech=tailwind`, `?price=free`, `?sort=newest`, …) |
| `/search?q=…` | `pages/search.html?q=…` (`?cat=react` shows a "coming soon" category) |
| `/product/{slug}` | `pages/product-detail.html?slug=nova` |
| Live demo | `pages/demo.html?slug=nova` (device-frame placeholder until sellers supply demo URLs) |
| `/seller/{store}` | `pages/seller-storefront.html?seller=pixelforge` |
| `/wishlist` | `pages/wishlist.html` |
| `/cart` | `pages/cart.html` |
| `/checkout` | `pages/checkout.html` |
| `/order-confirmation` | `pages/order-confirmation.html?order=DEMO-…` |
| `/account` | `pages/account.html#overview` (also `#orders`, `#downloads`, `#wishlist`, `#reviews`, `#support`, `#profile`) |
| `/become-a-seller` | `pages/seller-onboarding.html` |
| `/seller/dashboard` | `pages/seller-dashboard.html#overview` (also `#products`, `#orders`, `#earnings`, `#analytics`, `#reviews`, `#settings`) |
| `/seller/products/new` | `pages/add-product.html` (`?edit=nova` for edit mode) |
| `/login`, `/register` | `pages/login.html`, `pages/register.html` |
| `/forgot-password`, `/reset-password` | `pages/forgot-password.html`, `?step=reset`, `?step=expired` |
| `/about`, `/contact`, `/help` | `pages/about.html`, `pages/contact.html`, `pages/help.html` |
| Legal | `pages/legal.html?doc=terms` (`privacy`, `refund`, `license`, `seller`, `dmca`) |
| 404 | `404.html` |

## Demo walkthroughs

**Buyer:**

1. Search "tailwind" from the header.
2. Filter and sort.
3. Open **Nova** and switch the license to *Commercial*.
4. Add it to the cart and change the quantity.
5. Try a coupon. Every code is rejected, because the prototype doesn't invent valid codes.
6. Check out:
   - Submit empty to see validation.
   - Choose *Simulate payment failure* to see the failure state.
   - Then complete the order and land on the confirmation.
7. Visit **Account › My downloads**.

**Seller:**

1. Go to **Become a Seller** and submit the application.
2. Use the *Prototype controls* to preview each status: submitted, pending, info required, approved, rejected.
3. Open the **Seller dashboard** and try:
   - product status filters
   - a payout request
   - replying to a message
   - store settings with a live preview
4. Open **Add product**:
   - Upload screenshots (local preview) and a `.zip` (simulated progress).
   - Save a draft, preview the listing, then submit for review.

**States worth checking:**

- empty cart and wishlist
- no search results
- unavailable cart item (a demo button in the cart)
- missing product (`?slug=missing`)
- expired reset link
- "coming soon" category

---

## Project structure

```text
index.html                 Homepage
404.html
pages/                     All other pages (one HTML file per template)
css/
  design-tokens.css        Colour, type, spacing, radius, shadow, motion tokens
  components.css           Reusable components (BEM-style, WordPress/Elementor-friendly)
  custom.css               Page-level layouts
  tailwind.src.css         Tailwind entry → tailwind.css (compiled, committed)
js/
  data.js                  Centralised SAMPLE dataset (products, sellers, taxonomies, orders…)
  icons.js                 Inline Lucide-style SVG icon set
  app.js                   Core: utils, storage, session, header/mega menu/drawer, footer,
                           renderers (product card…), toast, dialog, tabs, accordion, boot
  search.js                Local relevance search + accessible combobox suggestions
  filters.js               Listing engine: facets, chips, sort, pagination/load more, drawer
  wishlist.js, cart.js     Client-side state with replaceable storage
  gallery.js               Product gallery, device previews, lightbox
  forms.js                 Inline validation, error summary, password tools
  dashboard.js             Hash-routed dashboard nav + inline SVG charts
  animations.js            GSAP / ScrollTrigger / Lenis (progressive enhancement)
  pages/*.js               One small controller per page
assets/
  images/products/         Generated template-preview mockups (desktop/inner/tablet/mobile)
  images/sellers/          Generated seller logos and banners
  icons/favicon.svg
scripts/
  generate-previews.mjs    Builds the preview mockups
  qa-smoke.mjs             Automated QA (Playwright)
docs/
  QA-CHECKLIST.md
  WORDPRESS-MAPPING.md
```

### Shared header and footer

Pages contain `<div data-include="header"></div>` and `<div data-include="footer"></div>`. `app.js` renders both from one function each, so every page stays consistent without a build-time include system. In WordPress these become `header.php` and `footer.php` (server-rendered).

### Page bootstrapping

Each `<body data-page="…">` maps to `Market.pages[name]()` in `js/pages/*.js`. Sample data is read only through `Market.catalog` and `Market.data`, so swapping in REST or WooCommerce data later doesn't touch the components.

---

## Dependencies

| Dependency | Use | Notes |
|---|---|---|
| Tailwind CSS 3.4 (dev only) | Layout utilities, mapped to the design tokens | Compiled to `css/tailwind.css`; no runtime CDN |
| GSAP 3.12 + ScrollTrigger (cdnjs) | Hero entrance, batched reveal-on-scroll, dialog/dropdown/micro-interactions | Optional; everything works without it |
| Lenis 1.1 (unpkg) | Smooth scrolling on the marketing pages only (home, about, become a seller) | Off for reduced motion and touch pointers; stopped while dialogs are open |
| Poppins (Google Fonts) | Typeface | Falls back to system UI fonts |

Icons are an inline Lucide-style SVG set (`js/icons.js`) to avoid a 350 KB runtime icon library. Charts are hand-rolled inline SVG, so there's no chart library. Three.js isn't used: nothing in a product-focused marketplace needs 3D.

## Accessibility and performance

Accessibility:

- semantic landmarks and a skip link
- one `h1` per page
- visible focus rings
- keyboard support for the mega menu, combobox, tabs, accordions, dialogs (focus trap, Esc, focus return) and drawers
- an error summary plus inline errors on forms
- `aria-live` result counts
- statuses always carry text, never colour alone
- 44px touch targets
- `prefers-reduced-motion` respected

Performance:

- lazy-loaded images with explicit dimensions
- consistent 16:10 aspect ratios
- an image error fallback
- no scroll listeners: `IntersectionObserver` and ScrollTrigger batching are used instead
- animation initialised once per page
- paginated or "load more" grids

## Prototype limitations

- **No backend.** Session, cart, wishlist, orders, reviews, tickets, seller application and drafts live in `localStorage` under keys prefixed `templora.`. Clear site data to reset.
- **Checkout** never renders card fields and takes no payment. The payment area marks where gateway hosted fields would mount.
- **Downloads** are disabled placeholders. Production should serve short-lived signed URLs after payment verification.
- **Uploads** are previewed locally with `URL.createObjectURL` and simulated progress. Nothing is uploaded, and the UI says so.
- **Search** is a simple local scorer over 14 sample products, not a production search engine.
- **Commission** is not defined. The seller orders table uses a clearly labelled *placeholder* rate to show the layout.
- **Seller verification** doesn't exist yet, so no verified badges are shown.
- **Legal pages** contain placeholder copy that must be replaced with counsel-approved text.
- **Structured data:** JSON-LD for `WebSite`, `BreadcrumbList` and `Product` (offers only) is injected client-side as an integration point. Sample ratings are intentionally *not* emitted as `aggregateRating`.
- **Social preview images:** `og:image` points to `assets/images/ui/og-image.png`.
