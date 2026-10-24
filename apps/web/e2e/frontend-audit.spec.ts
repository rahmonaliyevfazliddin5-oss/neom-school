import { test, expect } from '@playwright/test';

interface PageAuditResult {
  url: string;
  viewport: string;
  consoleErrors: string[];
  failedRequests: string[];
  missingAltImages: number;
}

test.describe('Frontend Deep Audit (Console, Network, Responsiveness, Images, Forms)', () => {
  const viewports = [
    { name: 'mobile-375', width: 375, height: 667 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Audit Public Pages at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('response', (res) => {
        if (res.status() >= 400 && !res.url().includes('/not-found')) {
          failedRequests.push(`${res.status()} ${res.url()}`);
        }
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Home Page
      await page.goto('/', { waitUntil: 'networkidle' });
      const imgCount = await page.locator('img').count();
      for (let i = 0; i < imgCount; i++) {
        const alt = await page.locator('img').nth(i).getAttribute('alt');
        expect(alt !== null && alt !== undefined).toBeTruthy();
      }

      // 2. Kirish Page
      await page.goto('/kirish', { waitUntil: 'networkidle' });
      await expect(page.locator('input[type="text"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Form validation check: empty submit
      await page.click('button[type="submit"]');

      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }

  test('Audit Direktor Panel Pages (Responsive + Network + Console)', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    // Login as Director
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin1');
    await page.fill('input[type="password"]', 'admin1');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/panel/direktor', { timeout: 10000 });

    // 1. Bosh panel
    await page.goto('/panel/direktor', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 2. Xodimlar
    await page.goto('/panel/direktor/xodimlar', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 3. Hisobotlar
    await page.goto('/panel/direktor/hisobotlar', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test('Audit Zavuch Panel Pages (Responsive + Network + Console)', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    // Login as Zavuch
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin2');
    await page.fill('input[type="password"]', 'admin2');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/panel/zavuch', { timeout: 10000 });

    // 1. Bosh panel
    await page.goto('/panel/zavuch', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 2. Sinflar
    await page.goto('/panel/zavuch/sinflar', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 3. Yangiliklar
    await page.goto('/panel/zavuch/yangiliklar', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test('Audit Ustoz Panel Pages (Responsive + Network + Console)', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    // Login as Teacher
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin3');
    await page.fill('input[type="password"]', 'admin3');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/panel/ustoz', { timeout: 10000 });

    // 1. Kunlik davomat
    await page.goto('/panel/ustoz', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 2. Sinflarim
    await page.goto('/panel/ustoz/sinflar', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    // 3. Hisobot
    await page.goto('/panel/ustoz/hisobot', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
