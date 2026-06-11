(function () {
  const data = window.siteData;
  const list = document.querySelector("[data-gallery-list]");
  const filter = document.querySelector("[data-gallery-filter]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const prevButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  let activeIndex = 0;
  let visible = data.gallery;

  const labels = { all: "全部", rooms: "房间", views: "景观", family: "家庭", details: "细节" };

  const renderFilters = () => {
    if (!filter) return;
    const categories = ["all", ...new Set(data.gallery.map((item) => item.category))];
    filter.innerHTML = categories
      .map((category) => `<button class="${category === "all" ? "active" : ""}" type="button" data-category="${category}">${labels[category] || category}</button>`)
      .join("");
  };

  const open = (index) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    activeIndex = index;
    const item = visible[activeIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;
    lightboxCaption.textContent = `${item.title} · ${item.caption}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  };

  const step = (direction) => {
    if (!visible.length) return;
    activeIndex = (activeIndex + direction + visible.length) % visible.length;
    open(activeIndex);
  };

  const renderGallery = (category = "all") => {
    if (!list) return;
    visible = category === "all" ? data.gallery : data.gallery.filter((item) => item.category === category);
    list.innerHTML = visible
      .map(
        (item, index) => `
          <button class="gallery-item ${item.size || "regular"} reveal" type="button" data-gallery-index="${index}">
            <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" width="920" height="700" sizes="(max-width: 760px) 92vw, (max-width: 1060px) 46vw, 420px" />
            <span class="gallery-caption"><strong>${item.title}</strong><span>${item.caption}</span></span>
          </button>
        `
      )
      .join("");
    list.querySelectorAll("[data-gallery-index]").forEach((button) => {
      button.addEventListener("click", () => open(Number(button.dataset.galleryIndex)));
    });
    list.querySelectorAll(".reveal").forEach((item) => requestAnimationFrame(() => item.classList.add("visible")));
  };

  renderFilters();
  renderGallery();

  filter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    filter.querySelectorAll("button").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    renderGallery(button.dataset.category);
  });
  closeButton?.addEventListener("click", close);
  prevButton?.addEventListener("click", () => step(-1));
  nextButton?.addEventListener("click", () => step(1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  window.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
})();
