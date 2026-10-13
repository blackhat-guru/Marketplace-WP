# QA checklist

Automated: `npm run qa` (see README) covers console errors, exceptions, failed local requests, horizontal overflow at 1440/1024/768/390/360px, and broken internal links across 33 page states. The manual checks below cover behaviour.

## Functional

- [ ] Header links, category nav, mega menu (click, ↓ to enter, ↑/↓ between links, Esc closes and returns focus, click outside closes)
- [ ] Header search suggestions (focus shows popular searches; typing shows products; ↑/↓ + Enter; Esc), `/` shortcut focuses search
- [ ] Mobile: menu drawer opens and closes (Esc, backdrop, focus trap), search overlay, cart count visible
- [ ] Category: sub-category chips, every filter group, active chips remove individually, **Clear all filters**, sort changes order, pagination pages, URL reflects state and reloads correctly
- [ ] Mobile filter drawer: opens, applies live, "Show N results" closes, focus returns to the Filters button
- [ ] Search: query results, related searches, load more, empty state for a nonsense query, `?cat=react` coming-soon note
- [ ] Product cards open the correct product; seller link opens the storefront; Live demo opens the demo frame
- [ ] Product page: gallery arrows/thumbs/keyboard, device toggle, full-screen lightbox (←/→, Esc), license switch updates price, Add to cart, Buy now goes to checkout, wishlist toggle, tabs (←/→/Home/End), FAQ accordion, "Write a review" gating, related and recently viewed, mobile sticky buy bar
- [ ] Wishlist: toggle from any card updates every instance + header count; wishlist page remove, clear (confirm dialog), add to cart, empty state
- [ ] Cart: license change, quantity −/+/typed (1–10), remove, coupon empty error + invalid-code error, "unavailable item" demo state blocks checkout, empty cart
- [ ] Checkout: empty submit shows error summary + inline errors, simulated failure state, processing state (button disabled), success → confirmation, cart cleared
- [ ] Confirmation: demo labelling, download buttons explain production behaviour, links to downloads/account
- [ ] Auth: login validation + simulated failure (`error@example.com`), password visibility toggle, register strength meter + match validation + verify-email state, forgot → check inbox → reset → success, expired link state, logout
- [ ] Account: every section via sidebar and via URL hash, order details dialog, invoice placeholder, downloads (refunded disabled), review form validation + submission, new support request dialog, profile/password validation, delete-request confirm
- [ ] Become a seller: validation, submission, every onboarding state via prototype controls, more-info form, approved → dashboard
- [ ] Seller dashboard: section nav, product status filters + search, preview (published vs. unpublished), view sales → filtered orders, delete draft confirm, payout request validation (min/max) + history, payout settings, reply dialog decreases unread badge, store settings live preview + image validation
- [ ] Add product: slug auto-generation, character counters, license toggles enable price fields, screenshot upload (type/size/count errors, remove, cover), ZIP progress + errors, TOC completion ticks, save draft, preview listing, submit-for-review validation + success state, `?edit=nova` prefill
- [ ] Contact form validation + success; Help search filters articles; Legal doc switching with back/forward
- [ ] Toasts appear for every important action and can be dismissed

## Visual

- [ ] Header and footer identical across public pages; seller workspace intentionally distinct (dark sidebar)
- [ ] Typography scale consistent (Poppins); one accent colour
- [ ] Product cards aligned with a stable 16:10 image ratio; footers aligned at the bottom
- [ ] Buttons, inputs, chips and badges consistent everywhere
- [ ] Empty, loading (skeleton) and error states match the design system
- [ ] Dashboards readable; tables stack on phones
- [ ] No overlap or clipping at 360px

## Accessibility

- [ ] Keyboard-only run through buyer and seller journeys; visible focus at every step
- [ ] Screen-reader names for icon buttons (wishlist, cart, close, remove, pagination)
- [ ] Form errors announced and linked through `aria-describedby`; error summary links focus their fields
- [ ] Statuses include text (never colour alone); ratings include numeric value
- [ ] `prefers-reduced-motion`: no GSAP or Lenis motion, instant transitions
- [ ] Dialogs trap focus, close on Esc, and return focus to the opener

## Honesty and safety

- [ ] All prices, ratings, sales, orders, payouts and reviews are labelled sample/demo where shown
- [ ] No card-number fields; no claim that payment, upload or email succeeded for real
- [ ] No invented commission rates, coupon codes, verification badges or testimonials
