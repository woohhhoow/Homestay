(function () {
  const data = window.siteData;
  const utils = window.siteUtils;
  if (!data || !utils) return;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  let activeFilter = "all";
  let query = "";

  const contactPath = `${document.body.dataset.root || ""}contact/`;
  const roomsPath = `${document.body.dataset.root || ""}rooms/`;

  const roomTemplate = (room, compact = false) => `
    <article class="room-card ${compact ? "room-card-compact" : "room-card-list"} reveal" data-room-card="${room.id}">
      <figure>
        <img src="${utils.asset(room.cover)}" alt="${room.title}" loading="lazy" decoding="async" width="900" height="680" sizes="${compact ? "(max-width: 760px) 82vw, (max-width: 1100px) 42vw, 310px" : "(max-width: 760px) 92vw, (max-width: 1100px) 38vw, 340px"}" />
      </figure>
      <div class="room-card-body">
        <div class="room-card-top">
          <div>
            <span class="room-no">${room.roomNumber}</span>
            <h3>${room.title}</h3>
          </div>
          <span data-icon="bed"></span>
        </div>
        <div class="card-meta"><span>${room.view}</span><span>${room.capacity}</span></div>
        ${compact ? "" : `<p>${room.description}</p>`}
        <div class="room-tags">${room.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <div class="room-actions">
          ${compact ? `<a class="btn soft" href="${roomsPath}">查看详情</a>` : `<button class="btn soft" type="button" data-room-detail="${room.id}">查看详情</button>`}
          <a class="btn primary" href="${contactPath}">微信咨询</a>
        </div>
      </div>
    </article>
  `;

  const matches = (room) => {
    const text = `${room.roomNumber} ${room.title} ${room.view} ${room.capacity} ${room.tags.join(" ")} ${room.description}`.toLowerCase();
    const okFilter = activeFilter === "all" || room.filters.includes(activeFilter);
    const okQuery = !query || text.includes(query.toLowerCase());
    return okFilter && okQuery;
  };

  const renderPreview = () => {
    qsa("[data-room-preview]").forEach((list) => {
      const limit = Number(list.dataset.limit || 2);
      list.innerHTML = data.rooms.slice(0, limit).map((room) => roomTemplate(room, true)).join("");
    });
  };

  const renderFilters = () => {
    const wrap = qs("[data-room-filters]");
    if (!wrap) return;
    wrap.innerHTML = data.roomFilters.map((filter) => `<button class="${filter.value === activeFilter ? "active" : ""}" type="button" data-room-filter="${filter.value}">${filter.label}</button>`).join("");
  };

  const renderList = () => {
    const list = qs("[data-room-list]");
    if (!list) return;
    const rooms = data.rooms.filter(matches);
    list.innerHTML = rooms.length ? rooms.map((room) => roomTemplate(room)).join("") : `<div class="search-card"><h3>没有匹配房间</h3><p>可以换一个筛选，或直接微信沟通入住需求。</p></div>`;
    qsa(".room-card .reveal, .room-card").forEach((item) => requestAnimationFrame(() => item.classList.add("visible")));
  };

  const openDrawer = (id) => {
    const drawer = qs("[data-room-drawer]");
    const room = data.rooms.find((item) => item.id === id);
    if (!drawer || !room) return;
    drawer.innerHTML = `
      <button class="btn soft" type="button" data-drawer-close>关闭</button>
      <div class="drawer-card">
        <figure><img src="${utils.asset(room.images[0] || room.cover)}" alt="${room.title}" loading="lazy" decoding="async" width="900" height="680" /></figure>
        <span class="room-no">${room.roomNumber}</span>
        <h2>${room.title}</h2>
        <p>${room.description}</p>
        <div class="card-meta"><span>${room.view}</span><span>${room.capacity}</span></div>
        <div class="room-tags">${room.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <a class="btn primary" href="${contactPath}">带需求咨询</a>
      </div>
    `;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
  };

  document.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-room-filter]");
    if (filter) {
      activeFilter = filter.dataset.roomFilter;
      renderFilters();
      renderList();
      utils.toast(`已筛选：${filter.textContent}`);
    }
    const detail = event.target.closest("[data-room-detail]");
    if (detail) openDrawer(detail.dataset.roomDetail);
    if (event.target.closest("[data-drawer-close]")) {
      const drawer = qs("[data-room-drawer]");
      drawer?.classList.remove("open");
      drawer?.setAttribute("aria-hidden", "true");
      document.body.classList.remove("drawer-open");
    }
  });

  qs("[data-room-search]")?.addEventListener("input", (event) => {
    query = event.target.value;
    renderList();
  });

  renderPreview();
  renderFilters();
  renderList();
  window.siteUtils.hydrateIcons();
})();
