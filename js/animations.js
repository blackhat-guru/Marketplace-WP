/* ==========================================================================
   Motion — restrained GSAP + ScrollTrigger + (optional) Lenis.
   - Everything is progressive enhancement: content is visible without JS,
     without the libraries and with prefers-reduced-motion.
   - Initialised once per page (guarded), reveals run once per element.
   - Lenis is opt-in per page via <body data-smooth> and disabled on touch
     devices and for reduced motion.
   ========================================================================== */
(function (M) {
  'use strict';
  const reduce = () => M.util.prefersReducedMotion();
  const has = () => typeof window.gsap !== 'undefined' && !reduce();
  let lenis = null;
  let started = false;

  const motion = {
    init() {
      if (started) return; // never double-initialise timelines
      started = true;
      if (!has()) return;
      const gsap = window.gsap;
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

      // Hero entrance
      const hero = document.querySelectorAll('[data-hero] > *');
      if (hero.length) gsap.from(hero, { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' });
      const heroArt = document.querySelectorAll('[data-hero-art] > *');
      if (heroArt.length) gsap.from(heroArt, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.15, clearProps: 'transform,opacity' });

      // Section reveals — batched, once.
      if (window.ScrollTrigger) {
        const items = gsap.utils.toArray('[data-reveal]').filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
        if (items.length) {
          gsap.set(items, { opacity: 0, y: 20 });
          window.ScrollTrigger.batch(items, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.06, overwrite: true, clearProps: 'transform' }),
          });
        }
      }

      // Smooth scrolling (opt-in)
      if (document.body.hasAttribute('data-smooth') && window.Lenis && window.matchMedia('(pointer: fine)').matches) {
        lenis = new window.Lenis({ duration: 1.0, smoothWheel: true });
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
        gsap.ticker.add((t) => lenis && lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        // In-page anchors: respect the sticky header and keep focus behaviour.
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a[href^="#"]');
          if (!a || a.getAttribute('href').length < 2) return;
          const target = document.querySelector(a.getAttribute('href'));
          if (!target) return;
          e.preventDefault();
          const header = document.getElementById('site-header');
          lenis.scrollTo(target, { offset: -((header ? header.offsetHeight : 0) + 16) });
          history.pushState(null, '', a.getAttribute('href'));
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        });
      }
    },
    pause() { if (lenis) lenis.stop(); },
    resume() { if (lenis) lenis.start(); },
    dialogIn(el) { if (has()) window.gsap.from(el, { y: 12, scale: 0.98, opacity: 0, duration: 0.22, ease: 'power2.out', clearProps: 'transform,opacity' }); },
    dropdownIn(el) { if (has() && el) window.gsap.from(el, { y: -6, opacity: 0, duration: 0.2, ease: 'power2.out', clearProps: 'transform,opacity' }); },
    pop(el) { if (has() && el && el.isConnected) window.gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', clearProps: 'transform' }); },
    grid(container) {
      if (!has() || !container) return;
      const cards = Array.from(container.children).slice(0, 12);
      if (!cards.length) return;
      window.gsap.from(cards, { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out', stagger: 0.03, clearProps: 'transform,opacity' });
    },
  };
  M.motion = motion;
})((window.Market = window.Market || {}));
