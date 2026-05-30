const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const filterButtons = document.querySelectorAll("[data-filter]");
const roomCards = document.querySelectorAll(".room-card");
const revealItems = document.querySelectorAll(".reveal");
const bookingForm = document.querySelector(".booking-form");
const formNote = document.querySelector("[data-form-note]");

const syncHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeNav = () => {
  nav.classList.remove("open");
  header.classList.remove("menu-open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "打开导航");
};

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  header.classList.toggle("menu-open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    roomCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formNote.textContent = "已收到预订意向。正式接入后可在这里连接表单、邮箱或民宿管理系统。";
  bookingForm.reset();
});

window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    closeNav();
  }
});

syncHeader();
