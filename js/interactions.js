(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const heroImage = document.querySelector(".hero-image img");
  const floatItems = document.querySelectorAll(".mist, .leaf-shadow");

  if (heroImage) {
    window.addEventListener(
      "scroll",
      () => {
        const progress = Math.min(window.scrollY / window.innerHeight, 1);
        heroImage.style.transform = `scale(${1.04 + progress * 0.04}) translate3d(0, ${progress * 18}px, 0)`;
      },
      { passive: true }
    );
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 16;
      const y = (event.clientY / window.innerHeight - 0.5) * 16;
      floatItems.forEach((item, index) => {
        const depth = index + 1.6;
        item.style.translate = `${x / depth}px ${y / depth}px`;
      });
    },
    { passive: true }
  );

  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".room-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${y * -4}deg`);
    card.style.setProperty("--tilt-y", `${x * 5}deg`);
  });

  document.addEventListener("pointerleave", (event) => {
    const card = event.target.closest?.(".room-card");
    if (!card) return;
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  }, true);
})();
