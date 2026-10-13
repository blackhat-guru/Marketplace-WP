/* ==========================================================================
   Dashboards — hash-routed section navigation for the customer account and
   seller workspace, plus lightweight inline-SVG charts (no chart library).
   Charts: single accent hue, thin marks, recessive grid, hover tooltip and a
   "view as table" alternative for accessibility. All figures are demo data.
   ========================================================================== */
(function (M) {
  'use strict';
  const { $, $$, esc } = M.util;

  /** Section switcher: links a.app-nav__link[href="#key"] ↔ [data-section="key"]. */
  M.appNav = function (opts) {
    const links = $$('.app-nav__link[href*="#"]');
    const keyOf = (l) => l.getAttribute('href').split('#')[1];
    const sections = $$('[data-section]');
    const keys = sections.map((s) => s.dataset.section);
    function show(key, focus) {
      if (!keys.includes(key)) key = opts.default || keys[0];
      sections.forEach((s) => (s.hidden = s.dataset.section !== key));
      links.forEach((l) => { if (keyOf(l) === key) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current'); });
      const sec = sections.find((s) => s.dataset.section === key);
      const title = sec && sec.querySelector('h1, h2');
      if (title && opts.titlePrefix) document.title = title.textContent + ' · ' + opts.titlePrefix;
      if (opts.onShow) opts.onShow(key, sec);
      if (focus && title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
      const active = links.find((l) => l.getAttribute('aria-current'));
      if (active && active.scrollIntoView && window.innerWidth < 1024) active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
    window.addEventListener('hashchange', () => show(location.hash.slice(1), true));
    show(location.hash.slice(1) || opts.default, false);
    return { show: (k) => { location.hash = k; } };
  };

  /* ---------------- Charts ---------------- */
  const W = 640;
  const H = 240;
  const PAD = { t: 16, r: 12, b: 28, l: 48 };

  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    return Math.ceil(v / p) * p;
  }
  function frame(container, labels, max, fmt) {
    const iw = W - PAD.l - PAD.r;
    const ih = H - PAD.t - PAD.b;
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const y = PAD.t + ih - (ih * i) / 4;
      g += '<line class="chart__grid" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + y + '" y2="' + y + '"/>';
      g += '<text x="' + (PAD.l - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(fmt((max * i) / 4, true)) + '</text>';
    }
    const step = iw / labels.length;
    labels.forEach((l, i) => (g += '<text x="' + (PAD.l + step * i + step / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(l) + '</text>'));
    return { g, iw, ih, step };
  }
  function attachHover(container, svg, labels, step, describe, onIndex) {
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    container.style.position = 'relative';
    container.appendChild(tip);
    svg.addEventListener('mousemove', (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const i = Math.max(0, Math.min(labels.length - 1, Math.floor((x - PAD.l) / step)));
      tip.hidden = false;
      tip.innerHTML = describe(i);
      tip.style.left = ((PAD.l + step * i + step / 2) / W) * 100 + '%';
      tip.style.top = (e.clientY - r.top) + 'px';
      if (onIndex) onIndex(i);
    });
    svg.addEventListener('mouseleave', () => { tip.hidden = true; if (onIndex) onIndex(-1); });
  }
  function tableHTML(labels, series, fmt, caption) {
    return '<div class="table-wrap" style="margin-top:12px"><table class="data-table"><caption class="sr-only">' + esc(caption) + '</caption><thead><tr><th scope="col">Period</th>' +
      series.map((s) => '<th scope="col" class="num">' + esc(s.name) + '</th>').join('') + '</tr></thead><tbody>' +
      labels.map((l, i) => '<tr><th scope="row" style="font-weight:500;color:var(--color-text);background:none;text-transform:none;letter-spacing:0;font-size:var(--text-sm)">' + esc(l) + '</th>' + series.map((s) => '<td class="num">' + esc(fmt(s.values[i])) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
  }
  function wrapChart(container, o, svgInner, series) {
    const id = M.util.uid('chart');
    container.innerHTML =
      '<figure style="margin:0"><figcaption class="sr-only">' + esc(o.title) + ' — ' + esc(o.summary || '') + '</figcaption>' +
      (series.length > 1 ? '<div class="chart-legend" style="margin-bottom:8px">' + series.map((s) => '<span><i class="' + (s.secondary ? 'is-secondary' : '') + '"></i>' + esc(s.name) + '</span>').join('') + '</div>' : '') +
      '<div data-plot><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title + '. ' + (o.summary || '')) + '">' + svgInner + '</svg></div>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-disclosure aria-expanded="false" aria-controls="' + id + '-t" style="margin-top:8px">' + M.icon('list', 'icon--sm') + 'View as table</button>' +
      '<div id="' + id + '-t" hidden>' + tableHTML(o.labels, series, o.format, o.title) + '</div></figure>';
    return container.querySelector('svg');
  }

  M.charts = {
    line(container, o) {
      const series = o.series;
      const max = niceMax(Math.max.apply(null, series.flatMap((s) => s.values)) * 1.08);
      const f = frame(container, o.labels, max, o.format);
      const pt = (v, i) => [PAD.l + f.step * i + f.step / 2, PAD.t + f.ih - (v / max) * f.ih];
      let inner = f.g;
      series.slice().reverse().forEach((s) => {
        const pts = s.values.map(pt);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        if (!s.secondary) inner += '<path class="chart__area" d="' + d + ' L' + pts[pts.length - 1][0] + ' ' + (PAD.t + f.ih) + ' L' + pts[0][0] + ' ' + (PAD.t + f.ih) + ' Z"/>';
        inner += '<path class="chart__line' + (s.secondary ? ' chart__line--secondary' : '') + '" d="' + d + '"/>';
        if (!s.secondary) {
          const last = pts[pts.length - 1];
          inner += '<circle class="chart__dot" cx="' + last[0] + '" cy="' + last[1] + '" r="4.5"/>';
        }
      });
      inner += '<line data-cross class="chart__grid" x1="0" x2="0" y1="' + PAD.t + '" y2="' + (PAD.t + f.ih) + '" style="stroke:var(--color-text-muted);stroke-dasharray:3 3" visibility="hidden"/>';
      const svg = wrapChart(container, o, inner, series);
      const cross = svg.querySelector('[data-cross]');
      attachHover(container.querySelector('[data-plot]'), svg, o.labels, f.step,
        (i) => '<strong>' + esc(o.labels[i]) + '</strong><br>' + series.map((s) => esc(s.name) + ': ' + esc(o.format(s.values[i]))).join('<br>'),
        (i) => { if (i < 0) return cross.setAttribute('visibility', 'hidden'); const x = PAD.l + f.step * i + f.step / 2; cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('visibility', 'visible'); });
    },
    bars(container, o) {
      const values = o.values;
      const max = niceMax(Math.max.apply(null, values) * 1.08);
      const f = frame(container, o.labels, max, o.format);
      const bw = Math.min(28, f.step * 0.56);
      let inner = f.g;
      values.forEach((v, i) => {
        const h = (v / max) * f.ih;
        const x = PAD.l + f.step * i + (f.step - bw) / 2;
        const y = PAD.t + f.ih - h;
        const r = Math.min(4, h);
        // rounded data-end, square baseline
        inner += '<path data-bar="' + i + '" class="chart__bar' + (i === values.length - 1 ? '' : ' chart__bar--muted') + '" d="M' + x + ' ' + (PAD.t + f.ih) + ' V' + (y + r) + ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + ' H' + (x + bw - r) + ' Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + r) + ' V' + (PAD.t + f.ih) + ' Z"/>';
      });
      const svg = wrapChart(container, o, inner, [{ name: o.seriesName || o.title, values }]);
      const bars = $$('[data-bar]', svg);
      attachHover(container.querySelector('[data-plot]'), svg, o.labels, f.step,
        (i) => '<strong>' + esc(o.labels[i]) + '</strong><br>' + esc(o.format(values[i])),
        (i) => bars.forEach((b, j) => b.style.opacity = i < 0 || i === j ? '1' : '.55'));
    },
  };
})((window.Market = window.Market || {}));
