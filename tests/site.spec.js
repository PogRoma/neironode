const { test, expect } = require("@playwright/test");

for (const width of [320, 375, 768, 1440]) {
  test(`layout and contact flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("link", { name: "Обсудить проект" }).click();
    await expect(page.locator("#contact")).toBeInViewport();
    await expect(page.locator("[data-contact-pending]")).toBeVisible();
    await expect(page.locator("[data-telegram]")).toBeHidden();
    expect(await page.locator('a[href*="t.me"]').count()).toBe(0);
    await page.locator("details").nth(1).locator("summary").click();
    await expect(page.locator("details").nth(1)).toHaveAttribute("open", "");
    if (width <= 760) {
      const menu = page.getByRole("button", { name: "Меню" });
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
      await menu.click();
      await page.getByRole("link", { name: "Подход", exact: true }).click();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
    expect(errors).toEqual([]);
    await page.goto("/");
    await page.screenshot({
      path: `test-results/site-${width}.png`,
      fullPage: true,
    });
  });
}

test("configured brand and Telegram are applied safely", async ({ page }) => {
  await page.route("**/assets/js/config.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'window.SITE_CONFIG = { brandName: "Тестовая команда", telegramUsername: "test_contact" };',
    }),
  );
  await page.goto("/");
  await expect(page).toHaveTitle(
    "Тестовая команда — разработка под вашу задачу",
  );
  await expect(page.locator("[data-brand]").first()).toHaveText(
    "Тестовая команда",
  );
  await expect(page.locator("[data-telegram]")).toHaveAttribute(
    "href",
    "https://t.me/test_contact",
  );
  await expect(page.locator("[data-telegram]")).toBeVisible();
  await expect(page.locator("[data-contact-pending]")).toBeHidden();
});

test("invalid contact does not create an external link", async ({ page }) => {
  await page.route("**/assets/js/config.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'window.SITE_CONFIG = { telegramUsername: "javascript:alert(1)" };',
    }),
  );
  await page.goto("/");
  await expect(page.locator("[data-telegram]")).not.toHaveAttribute("href");
  await expect(page.locator("[data-contact-pending]")).toBeVisible();
});

test("content and navigation work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: "Что делаем" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
