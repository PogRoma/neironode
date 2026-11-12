(() => {
  "use strict";
  const config = window.SITE_CONFIG || {};
  const brand =
    typeof config.brandName === "string" ? config.brandName.trim() : "";
  if (brand) {
    document.querySelectorAll("[data-brand]").forEach((element) => {
      element.textContent = brand;
    });
    document.title = `${brand} — разработка под вашу задачу`;
  }

  // Only Telegram public usernames are accepted; arbitrary URLs cannot be injected.
  const username =
    typeof config.telegramUsername === "string"
      ? config.telegramUsername.trim()
      : "";
  if (/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)) {
    const link = document.querySelector("[data-telegram]");
    link.href = `https://t.me/${username}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
    document.querySelector("[data-contact-pending]").hidden = true;
    document.querySelector("[data-contact-note]").textContent =
      "Откроется Telegram. Напишите в свободной форме — начнём с сути задачи.";
  }

  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation");
  toggle.hidden = false;
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      toggle.focus();
    }
  });
  // Close on outside interaction or when keyboard focus leaves the header.
  const header = document.querySelector(".header");
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  header.addEventListener("focusout", (event) => {
    if (!header.contains(event.relatedTarget)) setMenu(false);
  });
  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  updateHeader();
  // No layout reads or navigation hiding: links stay available while scrolling.
  window.addEventListener("scroll", updateHeader, { passive: true });

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !motion.matches) {
    const sections = [...document.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px 40px 0px" });
    // Never hide content already visible, focused, or reached by a direct hash.
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top > innerHeight &&
          `#${section.id}` !== location.hash && !section.contains(document.activeElement)) {
        section.classList.add("reveal-pending");
        observer.observe(section);
      }
    });
    const revealAll = () => {
      sections.forEach((section) => section.classList.remove("reveal-pending"));
      observer.disconnect();
    };
    motion.addEventListener("change", (event) => { if (event.matches) revealAll(); });
    document.addEventListener("focusin", (event) => {
      event.target.closest("[data-reveal]")?.classList.remove("reveal-pending");
    });
    // Anchor navigation must never wait for a reveal animation.
    document.addEventListener("click", (event) => {
      const href = event.target.closest('a[href^="#"]')?.getAttribute("href");
      if (href && href.length > 1) document.getElementById(href.slice(1))?.classList.remove("reveal-pending");
    });
  }
  window
    .matchMedia("(min-width: 761px)")
    .addEventListener("change", () => setMenu(false));
})();
