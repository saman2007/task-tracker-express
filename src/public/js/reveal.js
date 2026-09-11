/**
 * Scroll Reveal — sections fade up as they enter the viewport.
 * Auto-attaches to landing sections & cards (no Pug changes needed).
 */
(function () {
  "use strict";

  const SECTIONS = ".features-section, .steps-section, .cta-section";
  const CARDS = ".feature-card, .step-card";

  document.addEventListener("DOMContentLoaded", () => {
    const nodes = document.querySelectorAll(SECTIONS + ", " + CARDS);
    if (!nodes.length) return;

    // No IO support → just show everything
    if (!("IntersectionObserver" in window)) return;

    nodes.forEach((el, i) => {
      el.classList.add("reveal");
      // Stagger the cards inside each grid
      if (el.matches(CARDS)) {
        el.style.transitionDelay = (i % 3) * 90 + "ms";
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((el) => io.observe(el));
  });
})();