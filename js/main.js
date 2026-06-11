(function () {
  const data = window.siteData;
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const setText = (selector, value) => {
    qsa(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const renderNav = () => {
    const nav = qs("[data-nav]");
    if (!nav) return;
    nav.innerHTML = data.nav.map((item) => `<a href="${item.target}" data-nav-link="${item.target}">${item.label}</a>`).join("");
  };

  const renderBrand = () => {
    setText("[data-brand-name]", data.brand.name);
    setText("[data-brand-en]", data.brand.englishName);
    setText("[data-brand-tagline]", data.brand.tagline);
    setText("[data-brand-location]", data.brand.location);
    setText("[data-brand-description]", data.brand.description);
    setText("[data-contact-wechat]", data.contact.wechat);
    setText("[data-contact-phone]", data.contact.phone);
    setText("[data-inquiry-prompt]", data.contact.inquiryPrompt);
    qsa("[data-phone-link]").forEach((link) => {
      link.href = `tel:${data.contact.phone}`;
    });
    const hero = qs("[data-hero-image]");
    if (hero) hero.src = data.brand.heroImage;
  };

  const renderRooms = () => {
    const list = qs("[data-room-list]");
    if (!list) return;
    list.innerHTML = data.rooms
      .map(
        (room, index) => `
          <article class="room-card ${index === 0 ? "featured" : ""} reveal">
            <span class="room-number">${room.roomNumber}</span>
            <figure>
              <img src="${room.cover}" alt="${room.title}" loading="lazy" decoding="async" width="900" height="680" sizes="(max-width: 760px) 92vw, (max-width: 1060px) 88vw, ${index === 0 ? "640px" : "420px"}" />
            </figure>
            <div class="room-card-content">
              <h3>${room.title}</h3>
              <p>${room.description}</p>
              <div class="room-meta"><span>${room.view}</span><span>${room.capacity}</span></div>
              <div class="room-tags">${room.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
            </div>
          </article>
        `
      )
      .join("");
  };

  const renderLandscape = () => {
    const list = qs("[data-landscape-list]");
    if (!list) return;
    list.innerHTML = data.landscape
      .map(
        (item) => `
          <article class="landscape-tile reveal">
            <span>${item.title}</span>
            <h3>${item.label}</h3>
            <p>${item.text}</p>
          </article>
        `
      )
      .join("");
  };

  const renderExperience = () => {
    const list = qs("[data-experience-list]");
    if (!list) return;
    list.innerHTML = data.experiences
      .map(
        (item) => `
          <article class="experience-card reveal">
            <span>${item.icon}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>
        `
      )
      .join("");
  };

  const initHeader = () => {
    const header = qs("[data-header]");
    const nav = qs("[data-nav]");
    const toggle = qs("[data-nav-toggle]");
    if (!header || !nav || !toggle) return;
    const close = () => {
      nav.classList.remove("open");
      header.classList.remove("menu-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开导航");
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      header.classList.toggle("menu-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) close();
    });
  };

  const initReveal = () => {
    const items = qsa(".reveal, .image-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((item) => observer.observe(item));
  };

  const initActiveNav = () => {
    if (!("IntersectionObserver" in window)) return;
    const links = qsa("[data-nav-link]");
    const sections = links.map((link) => qs(link.dataset.navLink)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.toggle("active", link.dataset.navLink === `#${entry.target.id}`));
        });
      },
      { threshold: 0.32, rootMargin: "-18% 0px -56% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  };

  const initCopy = () => {
    const button = qs("[data-copy-wechat]");
    const note = qs("[data-copy-note]");
    if (!button || !note) return;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.contact.wechat);
        note.textContent = "已复制微信号。";
      } catch (error) {
        note.textContent = `微信号：${data.contact.wechat}`;
      }
    });
  };

  const initBackTop = () => {
    const button = qs("[data-back-top]");
    if (!button) return;
    window.addEventListener("scroll", () => button.classList.toggle("visible", window.scrollY > 520), { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const initImageHints = () => {
    qsa("img").forEach((image) => {
      image.decoding = image.decoding || "async";
      if (!image.closest(".hero-image") && !image.hasAttribute("loading")) image.loading = "lazy";
    });
  };

  renderNav();
  renderBrand();
  renderRooms();
  renderLandscape();
  renderExperience();
  initHeader();
  initCopy();
  initBackTop();
  initImageHints();
  initReveal();
  initActiveNav();
})();
