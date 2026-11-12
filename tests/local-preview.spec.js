const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');

test('standalone preview renders and responds without external files or network', async ({ page }) => {
  execFileSync(process.execPath, ['scripts/build-preview.cjs']);
  const html = readFileSync('preview.html', 'utf8');
  const requests = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.context().setOffline(true);
  await page.setViewportSize({ width: 375, height: 800 });
  // Managed Chromium blocks file:// URLs. Render the standalone document in
  // about:blank, offline and with no base URL, so missing assets cannot be hidden.
  await page.setContent(html);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 242, 236)');
  expect(await page.locator('script[src], link[rel="stylesheet"]').count()).toBe(0);
  await page.getByRole('button', { name: 'Меню' }).click();
  await expect(page.getByRole('button', { name: 'Меню' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'На связи' }).click();
  await expect(page.locator('#contact')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
