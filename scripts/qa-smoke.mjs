/**
 * QA smoke test for the prototype.
 * - Loads every page at 1440 / 1024 / 768 / 390 / 360 px
 * - Fails on console errors, uncaught exceptions, failed local requests,
 *   horizontal overflow, and internal links that point to missing files.
 *
 * Usage:  npm run serve   (in another terminal)
 *         npm i -D playwright && npx playwright install chromium
 *         npm run qa       [BASE_URL=http://localhost:8080]
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const WIDTHS = [1440, 1024, 768, 390, 360];
const PAGES = [
  'index.html', '404.html',
  'pages/html-templates.html', 'pages/html-templates.html?sub=saas&sort=price-asc', 'pages/search.html?q=tailwind', 'pages/search.html?q=zzzz', 'pages/search.html?cat=react',
  'pages/product-detail.html?slug=nova', 'pages/product-detail.html?slug=solo', 'pages/product-detail.html?slug=missing',
  'pages/seller-storefront.html?seller=pixelforge', 'pages/demo.html?slug=dashflow',
  'pages/wishlist.html', 'pages/cart.html', 'pages/checkout.html', 'pages/order-confirmation.html',
  'pages/account.html', 'pages/account.html#downloads', 'pages/account.html#profile',
  'pages/seller-onboarding.html', 'pages/seller-dashboard.html', 'pages/seller-dashboard.html#analytics', 'pages/seller-dashboard.html#settings', 'pages/add-product.html', 'pages/add-product.html?edit=nova',
  'pages/login.html', 'pages/register.html', 'pages/forgot-password.html', 'pages/forgot-password.html?step=reset',
  'pages/about.html', 'pages/contact.html', 'pages/help.html', 'pages/legal.html?doc=license',
];

const browser = await chromium.launch();
const problems = [];
const links = new Set();
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // Seed a cart + wishlist so stateful pages render their populated states.
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('templora.cart')) localStorage.setItem('templora.cart', JSON.stringify([{ key: 'p-1001::personal', id: 'p-1001', license: 'personal', qty: 1 }]));
    if (!localStorage.getItem('templora.wishlist')) localStorage.setItem('templora.wishlist', JSON.stringify(['p-1005', 'p-1003']));
  });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errs.push('exception: ' + e.message));
    page.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) errs.push('request failed: ' + r.url()); });
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errs.push('horizontal overflow: ' + overflow + 'px');
    if (width === 1440) {
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      hrefs.filter((h) => h.startsWith(BASE)).forEach((h) => links.add(h.split('#')[0].split('?')[0]));
    }
    errs.forEach((e) => problems.push(`[${width}] ${path} — ${e}`));
    await page.close();
  }
  await ctx.close();
}
for (const l of links) {
  const file = join(ROOT, decodeURIComponent(l.slice(BASE.length)) || 'index.html');
  if (!existsSync(file)) problems.push('broken internal link: ' + l);
}
await browser.close();
console.log(`Checked ${PAGES.length} pages × ${WIDTHS.length} widths, ${links.size} internal link targets.`);
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
console.log('No console errors, overflow or broken internal links found.');
