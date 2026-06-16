(function () {
  function initInteractions() {
    const Banna = window.Banna;
    if (!Banna) return;

    const { qs, qsa, data } = Banna;
    const header = qs("[data-header]");
    const nav = qs(".site-nav");
    const toggle = qs("[data-nav-toggle]");
    const backTop = qs("[data-back-top]");
    const hero = qs("[data-hero]");
    const toast = qs("[data-toast]");

    const closeNav = () => {
      nav?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    toggle?.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    nav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    qsa("[data-nav-item]").forEach((link) => {
      link.classList.toggle("active", link.dataset.navItem === document.body.dataset.page);
    });

    const onScroll = () => {
      header?.classList.toggle("scrolled", window.scrollY > 24);
      backTop?.classList.toggle("visible", window.scrollY > 680);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeNav();
    });

    backTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3);
        const y = ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3);
        hero.style.setProperty("--mx", x);
        hero.style.setProperty("--my", y);
      });
    }

    const showToast = (message) => {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(toast._timer);
      toast._timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
    };

    document.addEventListener("click", async (event) => {
      const copyButton = event.target.closest("[data-copy-wechat]");
      if (!copyButton) return;
      try {
        await navigator.clipboard.writeText(data.contact.wechat);
        showToast(`已复制微信号：${data.contact.wechat}`);
      } catch (error) {
        showToast(`微信号：${data.contact.wechat}`);
      }
    });

    const revealItems = () => qsa(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealItems().forEach((item) => item.classList.add("visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealItems().forEach((item) => observer.observe(item));
      document.addEventListener("banna:rendered", () => {
        revealItems()
          .filter((item) => !item.classList.contains("visible"))
          .forEach((item) => observer.observe(item));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initInteractions);
})();
