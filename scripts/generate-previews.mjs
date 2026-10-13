/**
 * Generates the template-preview mockups used by the prototype.
 *
 * Real seller screenshots will replace these files in production. Until then we
 * render recognisable website layouts (not stock photography) as lightweight SVGs.
 *
 * Usage: node scripts/generate-previews.mjs
 * Output: assets/images/products/{slug}-{desktop|inner|tablet|mobile}.svg
 *         assets/images/sellers/{slug}.svg
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productDir = join(root, 'assets/images/products');
const sellerDir = join(root, 'assets/images/sellers');
mkdirSync(productDir, { recursive: true });
mkdirSync(sellerDir, { recursive: true });

const FONT = "Poppins, 'Segoe UI', Arial, sans-serif";

const PRODUCTS = [
  { slug: 'nova', name: 'Nova', kind: 'saas', headline: ['Ship your SaaS', 'faster than ever'], p: { bg: '#FFFFFF', ink: '#0F172A', accent: '#4F46E5', soft: '#EEF2FF', muted: '#CBD5E1' } },
  { slug: 'agencypro', name: 'AgencyPro', kind: 'agency', headline: ['We build brands', 'that move people.'], p: { bg: '#111111', ink: '#F5F5F0', accent: '#D9F24A', soft: '#1F1F1F', muted: '#3A3A3A' } },
  { slug: 'portfoliox', name: 'PortfolioX', kind: 'devfolio', headline: ['Hi, I build', 'fast web apps_'], p: { bg: '#0B1020', ink: '#E2E8F0', accent: '#22D3EE', soft: '#131A2E', muted: '#334155' } },
  { slug: 'shoplite', name: 'ShopLite', kind: 'shop', headline: ['New season,', 'new essentials'], p: { bg: '#FFFDF8', ink: '#1F2937', accent: '#C2410C', soft: '#FDF0E1', muted: '#E7DCCB' } },
  { slug: 'dashflow', name: 'DashFlow', kind: 'dashboard', headline: ['Overview'], p: { bg: '#F5F7FB', ink: '#111827', accent: '#2563EB', soft: '#E0E7FF', muted: '#D7DCE5' } },
  { slug: 'launchkit', name: 'LaunchKit', kind: 'startup', headline: ['Launch your idea', 'this weekend'], p: { bg: '#FFF7F2', ink: '#1C1917', accent: '#EA580C', soft: '#FFE4D2', muted: '#EBD9CC' } },
  { slug: 'studiogrid', name: 'StudioGrid', kind: 'gallery', headline: ['Selected work', '2019 — 2026'], p: { bg: '#F4F1EC', ink: '#1A1A1A', accent: '#B4532A', soft: '#E8E1D6', muted: '#D5CCBE' } },
  { slug: 'clouddesk', name: 'CloudDesk', kind: 'saas', headline: ['Your helpdesk,', 'in the cloud'], p: { bg: '#F0FDFA', ink: '#042F2E', accent: '#0D9488', soft: '#CCFBF1', muted: '#B5E3DC' } },
  { slug: 'realtyspace', name: 'RealtySpace', kind: 'realestate', headline: ['Find a home', 'you will love'], p: { bg: '#FFFFFF', ink: '#14213D', accent: '#B7791F', soft: '#F6EFE2', muted: '#E2E6EE' } },
  { slug: 'edunova', name: 'EduNova', kind: 'education', headline: ['Learn skills that', 'shape your future'], p: { bg: '#FAFAFF', ink: '#1E1B4B', accent: '#7C3AED', soft: '#EDE9FE', muted: '#DDD8F5' } },
  { slug: 'mediq', name: 'Mediq', kind: 'health', headline: ['Care that puts', 'you first'], p: { bg: '#F7FBFF', ink: '#0C2A43', accent: '#0284C7', soft: '#E0F2FE', muted: '#D3E4F2' } },
  { slug: 'savora', name: 'Savora', kind: 'restaurant', headline: ['Seasonal plates,', 'slow evenings'], p: { bg: '#1C1410', ink: '#F7EEE3', accent: '#E3A44B', soft: '#2A1F18', muted: '#4A3A2E' } },
  { slug: 'inkwell', name: 'Inkwell', kind: 'magazine', headline: ['The future of', 'independent media'], p: { bg: '#FFFFFF', ink: '#111111', accent: '#DC2626', soft: '#F4F4F4', muted: '#E2E2E2' } },
  { slug: 'solo', name: 'Solo', kind: 'personal', headline: ['Writer, designer,', 'occasional runner'], p: { bg: '#FCFCF9', ink: '#222222', accent: '#15803D', soft: '#E7F5EC', muted: '#E3E3DC' } },
];

const SELLERS = [
  { slug: 'pixelforge', initials: 'PF', bg: '#1E293B', fg: '#FFFFFF', accent: '#60A5FA' },
  { slug: 'northwind-ui', initials: 'NW', bg: '#0F766E', fg: '#FFFFFF', accent: '#99F6E4' },
  { slug: 'lumen-labs', initials: 'LL', bg: '#7C2D12', fg: '#FFFFFF', accent: '#FDBA74' },
  { slug: 'grid-and-grain', initials: 'GG', bg: '#F4F1EC', fg: '#1A1A1A', accent: '#B4532A' },
  { slug: 'byteframe', initials: 'BF', bg: '#312E81', fg: '#FFFFFF', accent: '#C4B5FD' },
];

/* ---------- primitives ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const text = (x, y, str, size, fill, weight = 600, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(str)}</text>`;
/** Grey "copy" lines. */
const lines = (x, y, w, n, fill, gap = 14, h = 7) => {
  let out = '';
  for (let i = 0; i < n; i++) out += rect(x, y + i * gap, i === n - 1 ? w * 0.62 : w, h, fill, h / 2);
  return out;
};
const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
/** Abstract "photo" placeholder so mockups never pretend to contain real photography. */
const art = (x, y, w, h, p, seed = 0, r = 10) => {
  const id = `g${Math.round(x)}_${Math.round(y)}_${seed}`;
  const shapes = [
    circle(x + w * (0.25 + 0.1 * (seed % 3)), y + h * 0.4, Math.min(w, h) * 0.28, alpha(p.accent, 0.55)),
    rect(x + w * 0.45, y + h * 0.35, w * 0.45, h * 0.5, alpha(p.ink, 0.12), 8),
    circle(x + w * 0.8, y + h * 0.25, Math.min(w, h) * 0.12, alpha(p.bg, 0.6)),
  ].join('');
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.soft}"/><stop offset="1" stop-color="${alpha(p.accent, 0.35)}"/></linearGradient><clipPath id="c${id}">${rect(x, y, w, h, '#000', r)}</clipPath></defs>
<g clip-path="url(#c${id})">${rect(x, y, w, h, `url(#${id})`)}${shapes}</g>`;
};
const button = (x, y, w, h, fill, label, color, size = 13) =>
  rect(x, y, w, h, fill, h / 2) + text(x + w / 2, y + h / 2 + size * 0.36, label, size, color, 600, 'middle');

function nav(p, name, w, { dark = false, compact = false, cart = false } = {}) {
  const h = compact ? 56 : 64;
  let out = rect(0, 0, w, h, p.bg) + rect(0, h - 1, w, 1, alpha(p.ink, 0.08));
  out += rect(24, h / 2 - 10, 20, 20, p.accent, 6) + text(52, h / 2 + 6, name, compact ? 15 : 17, p.ink, 700);
  if (compact) {
    out += rect(w - 44, h / 2 - 7, 20, 2.5, p.ink, 1) + rect(w - 44, h / 2 - 1, 20, 2.5, p.ink, 1) + rect(w - 44, h / 2 + 5, 20, 2.5, p.ink, 1);
    return { svg: out, h };
  }
  const links = ['Product', 'Features', 'Pricing', 'Company'];
  links.forEach((l, i) => (out += text(w / 2 - 150 + i * 90, h / 2 + 5, l, 13, alpha(p.ink, 0.7), 500)));
  if (cart) out += circle(w - 170, h / 2, 9, 'none') + rect(w - 180, h / 2 - 8, 18, 16, alpha(p.ink, 0.15), 4);
  out += button(w - 140, h / 2 - 17, 116, 34, dark ? p.accent : p.ink, 'Get started', dark ? p.bg : p.bg);
  return { svg: out, h };
}

/* ---------- section builders: return { svg, h } ---------- */
function heroCentered(p, hl, w, y, { ui = 'app' } = {}) {
  const small = w < 600;
  const size = small ? 30 : 46;
  let out = '';
  let cy = y + (small ? 48 : 70);
  out += button(w / 2 - 90, cy - 22, 180, 26, p.soft, 'New · v2 is here', p.accent, 11);
  cy += 34;
  hl.forEach((l, i) => (out += text(w / 2, cy + i * (size + 8), l, size, p.ink, 700, 'middle')));
  cy += hl.length * (size + 8) + 6;
  out += lines(w / 2 - (small ? 130 : 210), cy, small ? 260 : 420, 2, alpha(p.ink, 0.15));
  cy += 44;
  out += button(w / 2 - (small ? 130 : 150), cy, small ? 124 : 140, 42, p.accent, 'Start free', '#FFFFFF');
  out += button(w / 2 + (small ? 6 : 10), cy, small ? 124 : 140, 42, alpha(p.ink, 0.07), 'See demo', p.ink);
  cy += 72;
  const pw = Math.min(w - 48, 920);
  const px = (w - pw) / 2;
  const ph = small ? 220 : 330;
  out += rect(px, cy, pw, ph, '#FFFFFF', 14, `stroke="${alpha(p.ink, 0.1)}"`);
  if (ui === 'app') {
    out += rect(px, cy, small ? 0 : 170, ph, alpha(p.accent, 0.06), 14);
    if (!small) for (let i = 0; i < 6; i++) out += rect(px + 20, cy + 26 + i * 30, 120 - (i % 3) * 18, 9, alpha(p.ink, i === 1 ? 0.5 : 0.14), 4);
    const ix = px + (small ? 18 : 196);
    const iw = pw - (small ? 36 : 220);
    for (let i = 0; i < 3; i++) {
      const cw = (iw - 32) / 3;
      out += rect(ix + i * (cw + 16), cy + 22, cw, 66, i === 0 ? p.soft : alpha(p.ink, 0.04), 10);
      out += rect(ix + i * (cw + 16) + 14, cy + 38, cw * 0.4, 7, alpha(p.ink, 0.3), 3) + rect(ix + i * (cw + 16) + 14, cy + 56, cw * 0.55, 14, p.ink, 4);
    }
    const chartY = cy + 108;
    const chartH = ph - 130;
    let d = `M${ix} ${chartY + chartH * 0.7}`;
    const pts = [0.62, 0.7, 0.48, 0.52, 0.3, 0.38, 0.18, 0.22];
    pts.forEach((v, i) => (d += ` L${ix + ((i + 1) * iw) / pts.length} ${chartY + chartH * v}`));
    out += `<path d="${d} L${ix + iw} ${chartY + chartH} L${ix} ${chartY + chartH} Z" fill="${alpha(p.accent, 0.12)}"/>`;
    out += `<path d="${d}" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return { svg: out, h: cy - y + ph + 40 };
}

function heroSplit(p, hl, w, y, { dark = false, artSeed = 1, search = false } = {}) {
  const small = w < 600;
  if (small) {
    let out = '';
    let cy = y + 40;
    hl.forEach((l, i) => (out += text(24, cy + i * 38, l, 30, p.ink, 700)));
    cy += hl.length * 38 + 4;
    out += lines(24, cy, w - 80, 3, alpha(p.ink, 0.15));
    cy += 56;
    out += button(24, cy, 150, 42, p.accent, search ? 'Search homes' : 'Get started', dark ? p.bg : '#FFFFFF');
    cy += 64;
    out += art(24, cy, w - 48, 240, p, artSeed, 16);
    return { svg: out, h: cy - y + 270 };
  }
  let out = '';
  const colW = w * 0.46;
  let cy = y + 96;
  out += rect(48, cy - 62, 120, 22, alpha(p.accent, 0.15), 11) + rect(60, cy - 54, 96, 6, p.accent, 3);
  hl.forEach((l, i) => (out += text(48, cy + 20 + i * 58, l, 50, p.ink, 700)));
  cy += hl.length * 58 + 30;
  out += lines(48, cy, colW - 60, 3, alpha(p.ink, 0.16), 16, 8);
  cy += 70;
  if (search) {
    out += rect(48, cy, colW - 20, 56, '#FFFFFF', 12, `stroke="${alpha(p.ink, 0.12)}"`);
    out += rect(66, cy + 24, 120, 8, alpha(p.ink, 0.2), 4) + rect(206, cy + 24, 90, 8, alpha(p.ink, 0.2), 4);
    out += button(48 + colW - 20 - 128, cy + 8, 118, 40, p.accent, 'Search', '#FFFFFF');
  } else {
    out += button(48, cy, 150, 46, p.accent, 'Get started', dark ? p.bg : '#FFFFFF', 14);
    out += button(214, cy, 140, 46, alpha(p.ink, 0.08), 'Learn more', p.ink, 14);
  }
  const ax = w * 0.52;
  out += art(ax, y + 40, w - ax - 48, 420, p, artSeed, 20);
  return { svg: out, h: 500 };
}

function logoStrip(p, w, y) {
  let out = '';
  const n = w < 600 ? 3 : 6;
  const gap = (w - 96) / n;
  for (let i = 0; i < n; i++) out += rect(48 + i * gap + gap * 0.15, y + 24, gap * 0.6, 14, alpha(p.ink, 0.13), 7);
  return { svg: out, h: 70 };
}

function cardsGrid(p, w, y, { cols = 3, n = 3, title = 'Features', kind = 'feature', dark = false } = {}) {
  const small = w < 600;
  if (small) cols = 1;
  if (w >= 600 && w < 900) cols = Math.min(cols, 2);
  const pad = small ? 24 : 48;
  let out = text(pad, y + 44, title, small ? 22 : 28, p.ink, 700);
  out += lines(pad, y + 60, Math.min(360, w - pad * 2), 1, alpha(p.ink, 0.14));
  const gap = 20;
  const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
  let cy = y + 96;
  const rows = Math.ceil(n / cols);
  const ch = kind === 'product' ? cw * 1.15 + 60 : kind === 'property' ? cw * 0.62 + 92 : kind === 'course' ? cw * 0.56 + 96 : 150;
  for (let i = 0; i < n; i++) {
    const cx = pad + (i % cols) * (cw + gap);
    const ry = cy + Math.floor(i / cols) * (ch + gap);
    if (kind === 'feature') {
      out += rect(cx, ry, cw, ch, dark ? p.soft : '#FFFFFF', 14, `stroke="${alpha(p.ink, 0.08)}"`);
      out += rect(cx + 20, ry + 20, 38, 38, alpha(p.accent, 0.15), 10) + rect(cx + 31, ry + 31, 16, 16, p.accent, 4);
      out += rect(cx + 20, ry + 76, cw * 0.5, 10, alpha(p.ink, 0.7), 5) + lines(cx + 20, ry + 98, cw - 40, 2, alpha(p.ink, 0.13));
    } else if (kind === 'product') {
      out += art(cx, ry, cw, cw * 1.15, p, i + 2, 12);
      out += rect(cx, ry + cw * 1.15 + 14, cw * 0.6, 9, alpha(p.ink, 0.6), 4) + text(cx, ry + cw * 1.15 + 48, `$${[48, 72, 36, 95, 54, 28][i % 6]}.00`, 15, p.accent, 600);
    } else if (kind === 'property' || kind === 'course') {
      const ih = kind === 'property' ? cw * 0.62 : cw * 0.56;
      out += rect(cx, ry, cw, ch, '#FFFFFF', 14, `stroke="${alpha(p.ink, 0.08)}"`);
      out += art(cx, ry, cw, ih, p, i + 4, 14);
      out += rect(cx + 16, ry + ih + 18, cw * 0.6, 10, alpha(p.ink, 0.7), 5) + lines(cx + 16, ry + ih + 40, cw * 0.7, 1, alpha(p.ink, 0.15));
      out += text(cx + 16, ry + ih + 78, kind === 'property' ? `$${[640, 1250, 890][i % 3]},000` : `${[12, 8, 20][i % 3]} lessons`, 14, p.accent, 700);
    }
  }
  return { svg: out, h: 96 + rows * (ch + gap) + 20 };
}

function pricing(p, w, y) {
  const small = w < 600;
  const pad = small ? 24 : 48;
  let out = text(w / 2, y + 48, 'Simple pricing', small ? 22 : 30, p.ink, 700, 'middle');
  const cols = small ? 1 : 3;
  const gap = 20;
  const cw = small ? w - pad * 2 : Math.min(300, (w - pad * 2 - gap * 2) / 3);
  const start = (w - (cw * cols + gap * (cols - 1))) / 2;
  const ch = 260;
  for (let i = 0; i < cols; i++) {
    const x = start + i * (cw + gap);
    const hl = i === 1 || small;
    out += rect(x, y + 84, cw, ch, hl ? p.ink : p.bg, 16, hl ? '' : `stroke="${alpha(p.ink, 0.1)}"`);
    const fg = hl ? p.bg : p.ink;
    out += rect(x + 24, y + 112, 70, 8, alpha(fg, 0.5), 4) + text(x + 24, y + 164, ['$0', '$29', '$79'][small ? 1 : i], 34, fg, 700);
    for (let j = 0; j < 4; j++) out += circle(x + 30, y + 196 + j * 22, 4, p.accent) + rect(x + 42, y + 192 + j * 22, cw * 0.55, 7, alpha(fg, 0.25), 3);
    out += button(x + 24, y + 84 + ch - 60, cw - 48, 38, hl ? p.accent : alpha(p.ink, 0.07), 'Choose plan', hl ? '#FFFFFF' : p.ink);
  }
  return { svg: out, h: 84 + ch + 40 };
}

function footer(p, w, y, h) {
  const small = w < 600;
  let out = rect(0, y, w, h, p.ink === '#F5F5F0' || p.bg.startsWith('#1') || p.bg.startsWith('#0') ? p.soft : p.ink);
  const fg = p.bg.startsWith('#1') || p.bg.startsWith('#0') ? p.ink : p.bg;
  out += rect(small ? 24 : 48, y + 36, 90, 12, alpha(fg, 0.8), 6);
  const cols = small ? 2 : 4;
  for (let i = 0; i < cols; i++) out += lines((small ? 24 : w * 0.4) + i * (small ? 150 : w * 0.14), y + (small ? 76 : 36), 70, 4, alpha(fg, 0.25), 16, 6);
  return out;
}

function dashboardPage(p, w, h, { inner = false } = {}) {
  const small = w < 600;
  const sb = small ? 0 : w < 900 ? 72 : 220;
  let out = rect(0, 0, w, h, p.bg);
  if (sb) {
    out += rect(0, 0, sb, h, '#111827');
    out += rect(20, 22, 24, 24, p.accent, 7);
    if (sb > 100) out += text(54, 40, 'DashFlow', 16, '#FFFFFF', 700);
    for (let i = 0; i < 8; i++) {
      out += rect(14, 82 + i * 42, sb - 28, 32, i === (inner ? 3 : 0) ? alpha(p.accent, 0.35) : 'none', 8);
      out += rect(26, 93 + i * 42, 12, 10, alpha('#FFFFFF', 0.6), 3);
      if (sb > 100) out += rect(48, 94 + i * 42, 90 - (i % 3) * 14, 8, alpha('#FFFFFF', i === (inner ? 3 : 0) ? 0.9 : 0.4), 4);
    }
  }
  const x0 = sb + (small ? 16 : 28);
  const cw = w - x0 - (small ? 16 : 28);
  out += rect(sb, 0, w - sb, 60, '#FFFFFF') + rect(sb, 59, w - sb, 1, alpha(p.ink, 0.08));
  out += rect(x0, 20, small ? cw - 60 : 280, 20, alpha(p.ink, 0.05), 10) + circle(w - 36, 30, 14, p.soft);
  let y = 92;
  out += text(x0, y, inner ? 'Orders' : 'Overview', small ? 20 : 24, p.ink, 700);
  y += 24;
  if (!inner) {
    const cols = small ? 2 : 4;
    const g = 16;
    const sw = (cw - g * (cols - 1)) / cols;
    const vals = ['$48.2k', '2,931', '18.4%', '642'];
    for (let i = 0; i < (small ? 4 : 4); i++) {
      const sx = x0 + (i % cols) * (sw + g);
      const sy = y + Math.floor(i / cols) * 104;
      out += rect(sx, sy, sw, 90, '#FFFFFF', 12, `stroke="${alpha(p.ink, 0.07)}"`);
      out += rect(sx + 16, sy + 18, sw * 0.45, 8, alpha(p.ink, 0.3), 4) + text(sx + 16, sy + 60, vals[i], small ? 20 : 24, p.ink, 700);
      out += rect(sx + sw - 56, sy + 48, 40, 16, i === 2 ? '#FEE2E2' : '#DCFCE7', 8);
    }
    y += small ? 220 : 116;
    const chartW = small ? cw : cw * 0.64;
    const chartH = small ? 200 : 270;
    out += rect(x0, y, chartW, chartH, '#FFFFFF', 12, `stroke="${alpha(p.ink, 0.07)}"`);
    out += rect(x0 + 18, y + 20, 120, 9, alpha(p.ink, 0.6), 4);
    const bars = [0.4, 0.55, 0.45, 0.7, 0.62, 0.8, 0.58, 0.9, 0.74, 0.66, 0.85, 0.95];
    const bw = (chartW - 36) / bars.length;
    bars.forEach((v, i) => (out += rect(x0 + 18 + i * bw + bw * 0.2, y + chartH - 20 - v * (chartH - 70), bw * 0.6, v * (chartH - 70), i === bars.length - 1 ? p.accent : alpha(p.accent, 0.3), 4)));
    if (!small) {
      const dx = x0 + chartW + 16;
      const dw = cw - chartW - 16;
      out += rect(dx, y, dw, chartH, '#FFFFFF', 12, `stroke="${alpha(p.ink, 0.07)}"`);
      const cx = dx + dw / 2;
      const cyy = y + chartH / 2 + 10;
      out += `<circle cx="${cx}" cy="${cyy}" r="64" fill="none" stroke="${p.soft}" stroke-width="22"/>`;
      out += `<circle cx="${cx}" cy="${cyy}" r="64" fill="none" stroke="${p.accent}" stroke-width="22" stroke-dasharray="260 402" transform="rotate(-90 ${cx} ${cyy})"/>`;
      out += rect(dx + 18, y + 20, 90, 9, alpha(p.ink, 0.6), 4);
    }
    y += chartH + 20;
  }
  const rows = inner ? 12 : 5;
  const th = 46;
  out += rect(x0, y, cw, 48 + rows * th, '#FFFFFF', 12, `stroke="${alpha(p.ink, 0.07)}"`);
  const colsX = small ? [0.06, 0.6] : [0.04, 0.3, 0.52, 0.7, 0.86];
  colsX.forEach((c) => (out += rect(x0 + cw * c, y + 20, 60, 8, alpha(p.ink, 0.35), 4)));
  for (let r = 0; r < rows; r++) {
    const ry = y + 48 + r * th;
    out += rect(x0, ry, cw, 1, alpha(p.ink, 0.06));
    colsX.forEach((c, j) => {
      if (j === colsX.length - 1 && !small) out += rect(x0 + cw * c, ry + 15, 64, 18, ['#DCFCE7', '#FEF3C7', '#E0E7FF'][r % 3], 9);
      else out += rect(x0 + cw * c, ry + 19, j === 0 ? 110 : 70, 8, alpha(p.ink, j === 0 ? 0.55 : 0.2), 4);
    });
  }
  return out;
}

/* ---------- page compositions ---------- */
function compose(prod, w, h, variant) {
  const { p, name, headline, kind } = prod;
  if (kind === 'dashboard') return dashboardPage(p, w, h, { inner: variant === 'inner' });
  const small = w < 600;
  const dark = ['agency', 'devfolio', 'restaurant'].includes(kind);
  let body = rect(0, 0, w, h, p.bg);
  const n = nav(p, name, w, { dark, compact: small, cart: kind === 'shop' });
  let y = n.h;
  const sections = [];
  const add = (s) => {
    sections.push(`<g transform="translate(0 0)">${s.svg}</g>`);
    y += s.h;
  };
  if (variant === 'inner') {
    // Secondary page: features + pricing / listing depending on type.
    const t = { saas: 'Everything you need', startup: 'How it works', agency: 'Services', devfolio: 'Projects', shop: 'Shop all', gallery: 'Case studies', realestate: 'Featured listings', education: 'Popular courses', health: 'Our departments', restaurant: 'Tonight’s menu', magazine: 'Latest stories', personal: 'Writing' }[kind];
    const gk = kind === 'shop' ? 'product' : kind === 'realestate' ? 'property' : ['education', 'magazine', 'gallery', 'devfolio', 'restaurant'].includes(kind) ? 'course' : 'feature';
    add(cardsGrid(p, w, y, { title: t, cols: 3, n: small ? 3 : 6, kind: gk, dark }));
    if (['saas', 'startup', 'health', 'agency'].includes(kind)) add(pricing(p, w, y));
  } else {
    switch (kind) {
      case 'saas':
      case 'startup':
        add(heroCentered(p, headline, w, y));
        add(logoStrip(p, w, y));
        add(cardsGrid(p, w, y, { title: 'Built for modern teams', n: small ? 2 : 3 }));
        break;
      case 'agency':
      case 'devfolio':
      case 'personal':
      case 'health':
        add(heroSplit(p, headline, w, y, { dark, artSeed: 2 }));
        add(cardsGrid(p, w, y, { title: kind === 'devfolio' ? 'Selected projects' : kind === 'health' ? 'Our services' : 'What we do', n: small ? 2 : 3, kind: kind === 'devfolio' ? 'course' : 'feature', dark }));
        break;
      case 'shop':
        add(heroSplit(p, headline, w, y, { artSeed: 3 }));
        add(cardsGrid(p, w, y, { title: 'Best sellers', cols: 4, n: small ? 2 : 4, kind: 'product' }));
        break;
      case 'gallery':
      case 'magazine': {
        let s = '';
        const pad = small ? 24 : 48;
        headline.forEach((l, i) => (s += text(pad, y + (small ? 60 : 90) + i * (small ? 36 : 56), l, small ? 30 : 50, p.ink, 700)));
        const top = y + (small ? 150 : 220);
        const cols = small ? 1 : 3;
        const gw = (w - pad * 2 - 16 * (cols - 1)) / cols;
        const heights = [260, 180, 320, 200, 240, 300];
        const colY = Array(cols).fill(top);
        for (let i = 0; i < (small ? 3 : 7); i++) {
          const c = colY.indexOf(Math.min(...colY));
          const hh = kind === 'magazine' ? 210 : heights[i % heights.length];
          s += art(pad + c * (gw + 16), colY[c], gw, hh, p, i + 1, 6);
          if (kind === 'magazine') s += rect(pad + c * (gw + 16), colY[c] + hh + 14, gw * 0.85, 10, alpha(p.ink, 0.7), 5) + lines(pad + c * (gw + 16), colY[c] + hh + 34, gw * 0.9, 2, alpha(p.ink, 0.14));
          colY[c] += hh + (kind === 'magazine' ? 84 : 16);
        }
        add({ svg: s, h: Math.max(...colY) - y + 20 });
        break;
      }
      case 'realestate':
        add(heroSplit(p, headline, w, y, { artSeed: 4, search: true }));
        add(cardsGrid(p, w, y, { title: 'Featured homes', n: 3, kind: 'property' }));
        break;
      case 'education':
        add(heroSplit(p, headline, w, y, { artSeed: 5 }));
        add(cardsGrid(p, w, y, { title: 'Popular courses', n: 3, kind: 'course' }));
        break;
      case 'restaurant': {
        let s = art(0, y, w, small ? 300 : 440, p, 6, 0);
        s += rect(0, y, w, small ? 300 : 440, alpha('#000000', 0.35));
        headline.forEach((l, i) => (s += text(w / 2, y + (small ? 130 : 190) + i * (small ? 38 : 60), l, small ? 30 : 52, '#FFFFFF', 600, 'middle')));
        s += button(w / 2 - 80, y + (small ? 220 : 330), 160, 44, p.accent, 'Book a table', p.bg);
        add({ svg: s, h: small ? 300 : 440 });
        add(cardsGrid(p, w, y, { title: 'On the menu', n: 3, kind: 'course', dark: true }));
        break;
      }
      default:
        add(heroCentered(p, headline, w, y));
    }
  }
  const footerY = Math.max(y + 20, h - 150);
  return body + sections.join('') + n.svg + (footerY < h ? footer(p, w, footerY, h - footerY) : '');
}

function svgDoc(w, h, inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${inner}</svg>\n`;
}

const SIZES = {
  desktop: [1440, 900],
  inner: [1440, 900],
  tablet: [768, 1024],
  mobile: [390, 844],
};

for (const prod of PRODUCTS) {
  for (const [variant, [w, h]] of Object.entries(SIZES)) {
    const inner = compose(prod, w, h, variant === 'inner' ? 'inner' : 'home');
    const label = `${prod.name} template preview — ${variant === 'inner' ? 'inner page' : variant + ' homepage'} (demo mockup)`;
    writeFileSync(join(productDir, `${prod.slug}-${variant}.svg`), svgDoc(w, h, inner, label));
  }
}

for (const s of SELLERS) {
  const inner = `${rect(0, 0, 160, 160, s.bg, 36)}${circle(128, 34, 16, s.accent)}${text(80, 98, s.initials, 52, s.fg, 700, 'middle')}`;
  writeFileSync(join(sellerDir, `${s.slug}.svg`), svgDoc(160, 160, inner, `${s.initials} store logo (demo)`));
  const banner = `${rect(0, 0, 1600, 360, s.bg)}${circle(1350, 80, 220, alpha(s.accent, 0.25))}${circle(1180, 330, 140, alpha(s.accent, 0.18))}${rect(0, 0, 1600, 360, 'url(#fade)')}`;
  writeFileSync(
    join(sellerDir, `${s.slug}-banner.svg`),
    svgDoc(1600, 360, `<defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${s.bg}"/><stop offset="1" stop-color="${s.bg}" stop-opacity="0"/></linearGradient></defs>${banner}`, 'Store banner (demo)')
  );
}

console.log(`Generated ${PRODUCTS.length * 4} product previews and ${SELLERS.length * 2} seller images.`);
