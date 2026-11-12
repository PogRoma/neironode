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
  window
    .matchMedia("(min-width: 761px)")
    .addEventListener("change", () => setMenu(false));
})();
