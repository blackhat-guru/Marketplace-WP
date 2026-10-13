/* ==========================================================================
   Product gallery — main stage, thumbnails, previous/next, device previews
   (desktop / tablet / mobile when those assets exist) and a full-screen
   lightbox with keyboard support.
   ========================================================================== */
(function (M) {
  'use strict';
  const { esc, url } = M.util;

  M.gallery = function (root, p) {
    const slides = (p.images.gallery || []).map((src, i) => ({ src: url(src), alt: p.shortName + ' — ' + (i === 0 ? 'homepage' : 'inner page') + ' preview (desktop)' }));
    if (!slides.length) {
      root.innerHTML = '<div class="gallery__stage"><div class="gallery__frame"><img src="' + M.PLACEHOLDER_IMG + '" alt="No preview available yet" width="320" height="200"></div></div>';
      return;
    }
    const devices = [['desktop', 'Desktop', 'monitor']];
    if (p.images.tablet) devices.push(['tablet', 'Tablet', 'tablet']);
    if (p.images.mobile) devices.push(['mobile', 'Mobile', 'smartphone']);
    let index = 0;
    let device = 'desktop';

    root.innerHTML =
      '<div class="gallery__stage" data-device="desktop" aria-roledescription="carousel" aria-label="' + esc(p.shortName) + ' screenshots">' +
        '<div class="gallery__frame"><img data-stage src="' + slides[0].src + '" alt="' + esc(slides[0].alt) + '" width="1440" height="900" fetchpriority="high"></div>' +
        (slides.length > 1 ? '<button type="button" class="gallery__nav gallery__nav--prev" data-prev aria-label="Previous screenshot">' + M.icon('chevron-left') + '</button><button type="button" class="gallery__nav gallery__nav--next" data-next aria-label="Next screenshot">' + M.icon('chevron-right') + '</button>' : '') +
        '<span class="gallery__counter" data-counter aria-live="polite">1 / ' + slides.length + '</span>' +
        '<div class="gallery__tools"><button type="button" class="btn btn--sm" data-fullscreen>' + M.icon('maximize', 'icon--sm') + 'Full screen</button></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px">' +
        '<div class="gallery__thumbs" role="group" aria-label="Choose screenshot" style="margin:0">' + slides.map((s, i) => '<button type="button" class="gallery__thumb" data-thumb="' + i + '" aria-current="' + (i === 0) + '" aria-label="Show screenshot ' + (i + 1) + ': ' + esc(s.alt) + '"><img src="' + s.src + '" alt="" width="1440" height="900" loading="lazy"></button>').join('') + '</div>' +
        (devices.length > 1 ? '<div class="device-toggle" role="group" aria-label="Preview device">' + devices.map(([k, l, ic]) => '<button type="button" data-device-btn="' + k + '" aria-pressed="' + (k === 'desktop') + '">' + M.icon(ic) + l + '</button>').join('') + '</div>' : '') +
      '</div>';

    const stage = root.querySelector('.gallery__stage');
    const img = root.querySelector('[data-stage]');
    const counter = root.querySelector('[data-counter]');

    function show(i) {
      index = (i + slides.length) % slides.length;
      if (device !== 'desktop') setDevice('desktop');
      img.src = slides[index].src;
      img.alt = slides[index].alt;
      counter.textContent = index + 1 + ' / ' + slides.length;
      root.querySelectorAll('[data-thumb]').forEach((t) => t.setAttribute('aria-current', String(+t.dataset.thumb === index)));
    }
    function setDevice(d) {
      device = d;
      stage.dataset.device = d;
      root.querySelectorAll('[data-device-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deviceBtn === d)));
      if (d === 'desktop') { img.src = slides[index].src; img.alt = slides[index].alt; counter.hidden = false; }
      else { img.src = url(p.images[d]); img.alt = p.shortName + ' homepage preview on ' + d; counter.hidden = true; }
    }

    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-prev]')) show(index - 1);
      if (e.target.closest('[data-next]')) show(index + 1);
      const t = e.target.closest('[data-thumb]');
      if (t) show(+t.dataset.thumb);
      const d = e.target.closest('[data-device-btn]');
      if (d) setDevice(d.dataset.deviceBtn);
      if (e.target.closest('[data-fullscreen]')) openLightbox();
    });
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    function openLightbox() {
      const all = slides.concat(p.images.tablet ? [{ src: url(p.images.tablet), alt: p.shortName + ' tablet preview' }] : [], p.images.mobile ? [{ src: url(p.images.mobile), alt: p.shortName + ' mobile preview' }] : []);
      let li = device === 'desktop' ? index : device === 'tablet' ? slides.length : all.length - 1;
      const body = '<div style="display:flex;flex-direction:column;gap:16px;height:100%"><div style="flex:1;display:grid;place-items:center;min-height:0;position:relative">' +
        '<img class="lightbox__img" data-lb-img src="' + all[li].src + '" alt="' + esc(all[li].alt) + '">' +
        '<button type="button" class="gallery__nav gallery__nav--prev" data-lb="-1" aria-label="Previous image">' + M.icon('chevron-left') + '</button><button type="button" class="gallery__nav gallery__nav--next" data-lb="1" aria-label="Next image">' + M.icon('chevron-right') + '</button></div>' +
        '<p style="text-align:center;color:#a9b1bf;font-size:13px" data-lb-cap aria-live="polite">' + (li + 1) + ' of ' + all.length + ' — ' + esc(all[li].alt) + '</p></div>';
      const d = M.dialog({
        title: p.shortName + ' — preview', body, size: 'full', desc: false,
        onKey: (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); },
        onOpen: (wrap) => {
          const dlg = wrap.querySelector('.modal__dialog');
          dlg.querySelector('.modal__title').style.color = '#fff';
          dlg.querySelector('.modal__body').style.cssText = 'flex:1;min-height:0;padding:16px 24px 24px';
          dlg.querySelector('.icon-btn').style.color = '#fff';
          wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-lb]'); if (b) step(+b.dataset.lb); });
        },
      });
      function step(n) {
        li = (li + n + all.length) % all.length;
        const im = d.el.querySelector('[data-lb-img]');
        im.src = all[li].src; im.alt = all[li].alt;
        d.el.querySelector('[data-lb-cap]').textContent = li + 1 + ' of ' + all.length + ' — ' + all[li].alt;
      }
    }
    return { show, setDevice };
  };
})((window.Market = window.Market || {}));
