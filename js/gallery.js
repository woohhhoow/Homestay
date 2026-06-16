(function () {
  function initGallery() {
    const Banna = window.Banna;
    if (!Banna) return;

    const { qs, qsa, data, galleryPiece, mediaMarkup, escapeHtml } = Banna;
    const grid = qs("[data-gallery-grid]");
    const filters = qs("[data-gallery-filters]");
    const lightbox = qs("[data-lightbox]");
    const lightboxMedia = qs("[data-lightbox-media]");
    const caption = qs("[data-lightbox-caption]");
    const close = qs("[data-lightbox-close]");
    const prev = qs("[data-lightbox-prev]");
    const next = qs("[data-lightbox-next]");
    let activeItems = [...data.gallery];
    let currentIndex = 0;

    function renderGrid(category = "all") {
      activeItems = category === "all" ? [...data.gallery] : data.gallery.filter((item) => item.category === category);
      if (grid) {
        grid.innerHTML = activeItems.map((item, index) => galleryPiece(item, index, false)).join("");
      }
    }

    function renderFilters() {
      if (!filters) return;
      filters.innerHTML = data.galleryCategories
        .map((item, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-filter="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`)
        .join("");
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");
        if (!button) return;
        qsa("[data-filter]", filters).forEach((item) => item.classList.toggle("active", item === button));
        renderGrid(button.dataset.filter);
      });
    }

    function openLightbox(index) {
      if (!lightbox || !lightboxMedia || !caption || !activeItems[index]) return;
      currentIndex = index;
      const item = activeItems[currentIndex];
      lightboxMedia.innerHTML = mediaMarkup(item.src, `${item.title} 放大浏览`, false);
      caption.textContent = `${item.title} / ${item.caption}`;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      close?.focus();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      if (lightboxMedia) lightboxMedia.innerHTML = "";
    }

    function stepLightbox(direction) {
      if (!lightbox?.classList.contains("open")) return;
      const total = activeItems.length;
      currentIndex = (currentIndex + direction + total) % total;
      openLightbox(currentIndex);
    }

    document.addEventListener("click", (event) => {
      const piece = event.target.closest("[data-gallery-index]");
      if (!piece) return;
      openLightbox(Number(piece.dataset.galleryIndex));
    });

    close?.addEventListener("click", closeLightbox);
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    prev?.addEventListener("click", () => stepLightbox(-1));
    next?.addEventListener("click", () => stepLightbox(1));

    document.addEventListener("keydown", (event) => {
      if (!lightbox?.classList.contains("open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") stepLightbox(-1);
      if (event.key === "ArrowRight") stepLightbox(1);
    });

    renderFilters();
    renderGrid("all");
  }

  document.addEventListener("DOMContentLoaded", initGallery);
})();
