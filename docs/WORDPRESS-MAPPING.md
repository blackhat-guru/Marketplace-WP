# WordPress, WooCommerce and multi-vendor mapping

This prototype is structured so each page and component maps onto a WordPress template or template part. The approach stays independent of any specific multi-vendor plugin: Dokan, WCFM, MultiVendorX and WC Vendors all provide equivalent vendor, store and payout data.

Presentation lives in `css/` (tokens, components, layouts), and the class names are semantic and BEM-style.

Data comes **only** from `js/data.js` through `Market.catalog` and `Market.data`. Replace those reads with PHP template data, or with WooCommerce Store API / REST responses, and the components keep working.

## Page templates

| Prototype | WordPress / WooCommerce template | Data source |
|---|---|---|
| `index.html` | `front-page.php` (or block template) | `WP_Query` product loops by tag/flag (featured, trending, best-selling via `total_sales`, newest) |
| `pages/html-templates.html` | `taxonomy-product_cat.php` → `archive-product.php` | `product_cat` = html; sub-terms for chips; layered-nav filters |
| `pages/search.html` | `search.php` (`post_type=product`) | WC product search / ElasticPress / Relevanssi |
| `pages/product-detail.html` | `single-product.php` + `content-single-product.php` | Product, gallery, attributes, variations (licenses), reviews, related, upsells |
| `pages/demo.html` | Custom page template `page-demo.php` (or direct link to seller's demo URL) | Product meta `_demo_url` |
| `pages/seller-storefront.html` | Vendor store template (plugin override, e.g. `dokan/store.php`) | Vendor profile, store products query |
| `pages/wishlist.html` | Page + wishlist plugin endpoint (e.g. YITH / TI) or custom user meta | User meta / plugin table |
| `pages/cart.html` | `cart/cart.php` | `WC()->cart` |
| `pages/checkout.html` | `checkout/form-checkout.php` | WC checkout fields, payment gateway (Stripe/PayPal hosted fields) |
| `pages/order-confirmation.html` | `checkout/thankyou.php` | `WC_Order`, downloadable files (`wc_get_customer_available_downloads`) |
| `pages/account.html` | `myaccount/*.php` endpoints: `dashboard`, `orders`, `downloads`, custom `wishlist`, `reviews`, `support`, `edit-account` | WC account endpoints + custom endpoints via `add_rewrite_endpoint` |
| `pages/seller-onboarding.html` | Page template `page-become-seller.php` + vendor registration form | Multi-vendor registration API / user role `seller` (pending) |
| `pages/seller-dashboard.html` | Vendor dashboard (plugin template overrides) | Vendor orders, earnings, withdrawals, analytics |
| `pages/add-product.html` | Vendor "new product" form override | Product CPT + meta, media library uploads, downloadable files |
| `pages/login.html`, `register.html`, `forgot-password.html` | `myaccount/form-login.php`, `form-lost-password.php`, `form-reset-password.php` | WP auth, email verification plugin |
| `pages/about.html`, `contact.html` | `page.php` / Elementor pages | Contact form plugin (Gravity Forms / CF7 / WPForms) |
| `pages/help.html` | `page-help.php` or a `help_article` CPT with `help_topic` taxonomy | CPT + taxonomy |
| `pages/legal.html` | `page.php` (one page per policy) with a shared legal sidebar template part | WP pages; privacy page via `wp_page_for_privacy_policy` |
| `404.html` | `404.php` | — |

## Template parts and components

| Component (CSS class) | Template part | Notes |
|---|---|---|
| Announcement bar (`.announcement`) | `template-parts/announcement.php` | Customizer or options-page field; dismissal stored in a cookie |
| Header (`.site-header`, `.catnav`) | `header.php` | Menus via `wp_nav_menu` locations: `primary`, `categories` |
| Mega menu (`.mega`) | `template-parts/mega-menu.php` | Custom walker or ACF menu fields for descriptions |
| Mobile drawer (`.drawer`) | `template-parts/mobile-drawer.php` | Same menus |
| Search combobox (`.search-field`, `.suggest`) | `searchform.php` + REST endpoint | Suggestions from `/wp-json/wc/store/products?search=` |
| Footer (`.site-footer`) | `footer.php` | Footer menus + newsletter integration (Mailchimp/ConvertKit) |
| Product card (`.product-card`) | `woocommerce/content-product.php` | Badges from sale/featured/tags; wishlist button via plugin hook |
| Category card (`.category-card`) | `template-parts/category-card.php` | `get_term_meta` thumbnail; count from term |
| Seller card / summary (`.seller-card`, `.seller-summary`) | `template-parts/seller-card.php` | Vendor API |
| Rating (`.rating`) | `wc_get_rating_html` wrapper | Only show aggregate when enough real reviews exist |
| Price (`.price`) | `woocommerce/loop/price.php` | `get_price_html()` |
| Tech badges (`.tech-badges`) | Product attribute `pa_technology` | Independent of categories |
| Breadcrumbs (`.breadcrumbs`) | `woocommerce_breadcrumb()` / Yoast breadcrumbs | |
| Filters (`.filters`, `.filter-group`, `.chip--removable`) | `sidebar-shop.php` + layered nav / FacetWP / WOOF | Facets: `product_cat` children, `pa_technology`, `pa_tools`, `pa_features`, license variations, rating, vendor |
| Pagination / load more (`.pagination`, `.pager`) | `woocommerce/loop/pagination.php` | Load more via Store API |
| Tabs (`.tabs`) | `woocommerce/single-product/tabs/tabs.php` | Filter `woocommerce_product_tabs` to add Pages, Components, Compatibility… |
| Gallery (`.gallery`) | `woocommerce/single-product/product-image.php` | Device images as product meta (tablet/mobile) |
| License selector (`.option-card`) | Variable product with `pa_license` attribute | One variation per license |
| Dashboard shell (`.app-shell`, `.app-nav`) | `myaccount/navigation.php` and vendor dashboard nav | |
| Charts (`.chart`) | Vendor analytics (plugin data) rendered server-side or via the same SVG helper | |
| Toast / dialog / empty / skeleton | Small JS module enqueued globally | Unchanged |

## Data model (`js/data.js` → WooCommerce)

| Prototype field | WooCommerce / WordPress |
|---|---|
| `id`, `slug`, `name`, `summary`, `description` | Product ID, `post_name`, title, short description, content |
| `category`, `subcategory` | `product_cat` (parent `html`, child terms) |
| `tech`, `tools`, `features` | Global attributes `pa_technology`, `pa_tools`, `pa_features` |
| `price`, `originalPrice` | Regular / sale price |
| `licenses[]` | Variations of `pa_license` (personal / commercial / extended) |
| `seller` | Product author / vendor ID |
| `rating`, `reviewCount` | `_wc_average_rating`, `_wc_review_count` |
| `sales`, `views` | `total_sales`; views from analytics plugin |
| `images.gallery`, `images.tablet`, `images.mobile` | Product gallery + custom meta for device previews |
| `demoUrl` | Meta `_demo_url` |
| `version`, `updated`, changelog | Meta `_version`, modified date, repeater/meta `_changelog` |
| `status` (`published`/`pending`/`draft`/`rejected`) | Post status `publish`/`pending`/`draft` + meta for rejection reason |
| `flags.featured/trending/new/bestseller` | Featured flag, `product_tag`, or computed queries |

## Conversion notes

1. Enqueue `design-tokens.css`, `components.css`, `custom.css` and the compiled Tailwind file. Point the Tailwind `content` paths at the theme's PHP files.
2. Render the header, footer, cards and filters in PHP. Keep `js/*.js` only for the interactive behaviour:
   - combobox
   - tabs
   - dialogs
   - drawers
   - toasts
   - client-side filtering where AJAX is used
3. Replace the `Market.store` (localStorage) calls in `wishlist.js` and `cart.js` with WooCommerce Store API / AJAX calls. Their public methods stay the same.
4. For Elementor: each section on the homepage is a self-contained block with its own class, so it maps to a widget or saved section. Use the tokens as Elementor global colours and fonts.
5. Never port the simulations (auth, checkout outcome toggle, uploads, payouts). They exist only to show UI states.
