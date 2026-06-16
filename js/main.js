(function () {
  const data = window.BannaData;
  const root = document.body.dataset.root || "";
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const icons = {
    key: "M7 14a5 5 0 1 1 4.4 2.5L9 19H6v-3H3v-2h4Z",
    spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
    quiet: "M5 13c5-8 10-8 14 0-4 5-9 6-14 0Z",
    chat: "M5 17l.7-3A6 6 0 1 1 9 18l-4 2v-3Z",
    guide: "M5 6l5-2 4 2 5-2v14l-5 2-4-2-5 2V6Z",
    bag: "M7 8h10l1 11H6L7 8Zm3 0V6a2 2 0 0 1 4 0v2",
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeMediaPath(src) {
    if (!src || src.startsWith("placeholder:") || src.startsWith("http") || src.startsWith("data:") || src.startsWith("/")) {
      return src;
    }
    return `${root}${src.replace(/^(\.\/|\.\.\/)+/, "")}`;
  }

  function placeholderName(src) {
    return src.replace("placeholder:", "") || "rainforest";
  }

  function mediaMarkup(src, label, lazy = true) {
    if (!src || src.startsWith("placeholder:")) {
      const visual = placeholderName(src || "placeholder:rainforest");
      return `<div class="visual-placeholder" data-visual="${escapeHtml(visual)}" role="img" aria-label="${escapeHtml(label)}"><span>${escapeHtml(label)}</span></div>`;
    }

    const loading = lazy ? ' loading="lazy"' : "";
    const path = normalizeMediaPath(src);
    return `<picture class="media-image"><img src="${escapeHtml(path)}" alt="${escapeHtml(label)}"${loading} decoding="async" /></picture>`;
  }

  function iconMarkup(name) {
    const path = icons[name] || icons.spark;
    return `<span class="line-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  }

  function renderContact() {
    qsa("[data-contact-wechat]").forEach((node) => {
      node.textContent = data.contact.wechat;
    });
    qsa("[data-contact-phone]").forEach((node) => {
      node.textContent = data.contact.phone;
    });
    qsa("[data-contact-phone-link]").forEach((node) => {
      node.setAttribute("href", `tel:${data.contact.phone}`);
    });
    qsa("[data-inquiry-prompt]").forEach((node) => {
      node.textContent = data.contact.inquiryPrompt;
    });
  }

  function roomCard(room, featured = false) {
    const tags = room.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const highlights = room.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `
      <article class="room-card reveal" data-room-card="${escapeHtml(room.id)}">
        ${mediaMarkup(room.cover, `${room.title} 氛围视觉`, !featured)}
        <div class="room-card-body">
          <span class="room-number">Room ${escapeHtml(room.roomNumber)}</span>
          <h3>${escapeHtml(room.title)}</h3>
          <p>${escapeHtml(room.description)}</p>
          <dl class="room-meta">
            <div><dt>面积</dt><dd>${escapeHtml(room.area)}</dd></div>
            <div><dt>人数</dt><dd>${escapeHtml(room.capacity)}</dd></div>
            <div><dt>景观</dt><dd>${escapeHtml(room.view)}</dd></div>
          </dl>
          <div class="tag-row">${tags}</div>
          <div class="room-card-actions">
            <span>${escapeHtml(room.stayFit)}</span>
            <button class="link-button" type="button" data-room-open="${escapeHtml(room.id)}">查看详情</button>
          </div>
          <template data-room-template="${escapeHtml(room.id)}">
            <div class="modal-content">
              ${mediaMarkup(room.images[0] || room.cover, `${room.title} 详情视觉`, false)}
              <div class="modal-copy">
                <span class="room-number">Room ${escapeHtml(room.roomNumber)}</span>
                <h2>${escapeHtml(room.title)}</h2>
                <p>${escapeHtml(room.description)}</p>
                <dl class="room-meta">
                  <div><dt>面积</dt><dd>${escapeHtml(room.area)}</dd></div>
                  <div><dt>人数</dt><dd>${escapeHtml(room.capacity)}</dd></div>
                  <div><dt>景观</dt><dd>${escapeHtml(room.view)}</dd></div>
                </dl>
                <ul>${highlights}</ul>
                <div class="tag-row">${tags}</div>
                <button class="btn btn-primary" type="button" data-copy-wechat>复制微信咨询</button>
              </div>
            </div>
          </template>
        </div>
      </article>
    `;
  }

  function renderRooms() {
    const featured = qs("[data-featured-rooms]");
    const fullList = qs("[data-room-list]");
    if (featured) {
      featured.innerHTML = data.rooms.slice(0, 3).map((room) => roomCard(room, true)).join("");
    }
    if (fullList) {
      fullList.innerHTML = data.rooms.map((room) => roomCard(room)).join("");
    }
  }

  function renderExperiences() {
    const preview = qs("[data-experience-preview]");
    if (!preview) return;
    preview.innerHTML = data.experiences
      .map(
        (item) => `
          <article class="experience-card reveal">
            ${iconMarkup(item.icon)}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  }

  function galleryPiece(item, index, compact = false) {
    return `
      <button class="gallery-piece ${escapeHtml(item.size || "regular")}" type="button" data-gallery-index="${index}" data-category="${escapeHtml(item.category)}">
        ${mediaMarkup(item.src, `${item.title} 氛围视觉`, !compact && index > 1)}
        <span class="gallery-piece-caption">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.caption)}</small>
        </span>
      </button>
    `;
  }

  function renderGalleryPreview() {
    const preview = qs("[data-gallery-preview]");
    if (!preview) return;
    preview.innerHTML = data.gallery.slice(0, 5).map((item, index) => galleryPiece(item, index, true)).join("");
  }

  function renderLocation() {
    const list = qs("[data-location-points]");
    if (list) {
      list.innerHTML = data.locationPoints
        .map(
          (item) => `
            <article class="location-point">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.text)}</p>
            </article>
          `
        )
        .join("");
    }

    const timeline = qs("[data-location-timeline]");
    if (timeline) {
      timeline.innerHTML = data.locationTimeline
        .map((item) => `<div class="timeline-item">${escapeHtml(item)}</div>`)
        .join("");
    }
  }

  function renderFaq() {
    const list = qs("[data-faq-list]");
    if (!list) return;
    list.innerHTML = data.faq
      .map(
        (item) => `
          <article class="faq-item">
            <h3>${escapeHtml(item.question)}</h3>
            <p>${escapeHtml(item.answer)}</p>
          </article>
        `
      )
      .join("");
  }

  function initRoomModal() {
    const modal = qs("[data-room-modal]");
    const content = qs("[data-room-modal-content]");
    if (!modal || !content) return;

    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-room-open]");
      if (!opener) return;
      const template = qs(`[data-room-template="${opener.dataset.roomOpen}"]`);
      if (!template) return;
      content.innerHTML = template.innerHTML;
      modal.showModal();
      document.body.classList.add("modal-open");
    });

    qsa("[data-room-modal-close]").forEach((button) => {
      button.addEventListener("click", () => modal.close());
    });

    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      content.innerHTML = "";
    });
  }

  function renderAll() {
    renderContact();
    renderRooms();
    renderExperiences();
    renderGalleryPreview();
    renderLocation();
    renderFaq();
    initRoomModal();
    document.dispatchEvent(new CustomEvent("banna:rendered"));
  }

  window.Banna = {
    data,
    qs,
    qsa,
    escapeHtml,
    mediaMarkup,
    galleryPiece,
    normalizeMediaPath,
  };

  document.addEventListener("DOMContentLoaded", renderAll);
})();
