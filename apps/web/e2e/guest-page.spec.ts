import { test, expect } from '@playwright/test';

test.describe('NEOM School Guest Home Page', () => {
  test('1. Bosh sahifa ochiladi va asosiy elementlar ko‘rinadi', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/NEOM SCHOOL/i);

    // Check hero headline
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText(/Neom School/i);

    // Check stats card
    const statsCard = page.locator('[aria-label="Maktab statistikasi"]');
    await expect(statsCard).toBeVisible();

    // Check sections exist by ID
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#haqida')).toBeVisible();
    await expect(page.locator('#afzalliklar')).toBeVisible();
    await expect(page.locator('#yangiliklar')).toBeVisible();
    await expect(page.locator('#qabul')).toBeVisible();
    await expect(page.locator('#aloqa')).toBeVisible();
  });

  test('2. Barcha anchor navigatsiya havolalari mavjud', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav[aria-label="Asosiy navigatsiya"]');
    await expect(nav.locator('a[href="#hero"]')).toHaveCount(1);
    await expect(nav.locator('a[href="#haqida"]')).toHaveCount(1);
    await expect(nav.locator('a[href="#afzalliklar"]')).toHaveCount(1);
    await expect(nav.locator('a[href="#yangiliklar"]')).toHaveCount(1);
    await expect(nav.locator('a[href="#qabul"]')).toHaveCount(1);
    await expect(nav.locator('a[href="#aloqa"]')).toHaveCount(1);
  });

  test('3. "Kirish" tugmasi bosilganda /kirish ga olib boradi', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.locator('header a[href="/kirish"]');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page).toHaveURL(/\/kirish/);
  });

  test('4. Yangiliklar bo‘limida filtr tugmalari ishlaydi', async ({ page }) => {
    await page.goto('/');

    const newsSection = page.locator('#yangiliklar');
    await expect(newsSection).toBeVisible();

    const allTab = newsSection.locator('button[role="tab"]:has-text("Hammasi")');
    const newsTab = newsSection.locator('button[role="tab"]:has-text("Yangilik")');
    const eventTab = newsSection.locator('button[role="tab"]:has-text("Tadbir")');
    const planTab = newsSection.locator('button[role="tab"]:has-text("Reja")');

    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    // Click Yangilik
    await newsTab.click();
    await expect(newsTab).toHaveAttribute('aria-selected', 'true');
    await expect(allTab).toHaveAttribute('aria-selected', 'false');

    // Click Tadbir
    await eventTab.click();
    await expect(eventTab).toHaveAttribute('aria-selected', 'true');

    // Click Reja
    await planTab.click();
    await expect(planTab).toHaveAttribute('aria-selected', 'true');
  });

  test('5. Tungi rejim (Dark mode) yoqiladi va localStorage da saqlanadi', async ({ page }) => {
    await page.goto('/');

    const darkToggle = page.locator('button[aria-label="Tungi rejim"]').first();
    await expect(darkToggle).toBeVisible();

    // Toggle on
    await darkToggle.click();

    // Verify html tag has 'dark' class
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Verify localStorage
    const savedTheme = await page.evaluate(() => localStorage.getItem('neom_theme'));
    expect(savedTheme).toBe('dark');

    // Reload page and check persistence
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test('6. Mobilda hamburger menyu ochiladi va navigatsiya havolalari ko‘rinadi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Hamburger button should be visible on mobile
    const menuButton = page.locator('header button[aria-label="Menyu"]');
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();

    // Mobile nav links should appear
    const mobileLink = page.locator('header a[href="#qabul"]').last();
    await expect(mobileLink).toBeVisible();

    // Close menu
    await menuButton.click();
    await expect(mobileLink).not.toBeVisible();
  });

  test('7. XAVFSIZLIK: HTML manbasida "panel", "zavuch", "direktor" so‘zlari yo‘q', async ({ request }) => {
    const res = await request.get('http://localhost:3000/');
    expect(res.status()).toBe(200);

    const html = await res.text();
    const lowerHtml = html.toLowerCase();

    // 1. Strict check: No internal role mentions in guest HTML source
    expect(lowerHtml).not.toContain('zavuch');
    expect(lowerHtml).not.toContain('direktor');

    // 2. Strict check: No mentions of internal management panels
    expect(lowerHtml).not.toContain('direktor paneli');
    expect(lowerHtml).not.toContain('zavuch paneli');
    expect(lowerHtml).not.toContain('o\'qituvchi paneli');
    expect(lowerHtml).not.toContain('/panel');

    // 3. Robots.txt check: Must NOT leak internal routes
    const robotsRes = await request.get('http://localhost:3000/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).not.toContain('/kirish');
    expect(robotsTxt).not.toContain('/panel');
  });
});
