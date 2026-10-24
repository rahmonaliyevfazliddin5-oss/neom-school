import { test, expect } from '@playwright/test';

test.describe('Super Admin Secret Panel & Real-time Presence Monitoring', () => {
  test('1. Unauthenticated request to /panel/super-admin returns 404', async ({ page }) => {
    const res = await page.goto('/panel/super-admin');
    // Status should be 404 because middleware rewrites to /not-found
    expect(res?.status()).toBe(404);
  });

  test('2. Director (admin1) cannot access /panel/super-admin (returns 404)', async ({ page }) => {
    // Login as Director
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin1');
    await page.fill('input[type="password"]', 'admin1');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/panel/direktor');

    // Attempt to open secret super admin panel
    const res = await page.goto('/panel/super-admin');
    expect(res?.status()).toBe(404);
  });

  test('3. Super Admin (admin0727) logs in and sees 3-panel monitor', async ({ browser }) => {
    // Context A: Super Admin
    const superContext = await browser.newContext();
    const superPage = await superContext.newPage();

    await superPage.goto('/kirish');
    await superPage.fill('input[type="text"]', 'admin0727');
    await superPage.fill('input[type="password"]', 'admin0727');
    await superPage.click('button[type="submit"]');
    await superPage.waitForURL('**/panel/super-admin', { timeout: 10000 });

    // Check header and cards
    await expect(superPage.locator('h1')).toContainText('Nazoratchi Boshqaruv Markazi');
    await expect(superPage.getByRole('heading', { name: 'Direktor Paneli' })).toBeVisible();
    await expect(superPage.getByRole('heading', { name: 'Zavuch Paneli' })).toBeVisible();
    await expect(superPage.getByRole('heading', { name: 'Ustoz Paneli' })).toBeVisible();

    // Context B: Director logs in
    const directorContext = await browser.newContext();
    const directorPage = await directorContext.newPage();

    await directorPage.goto('/kirish');
    await directorPage.fill('input[type="text"]', 'admin1');
    await directorPage.fill('input[type="password"]', 'admin1');
    await directorPage.click('button[type="submit"]');
    await directorPage.waitForURL('**/panel/direktor');

    // Wait a moment for presence heartbeat
    await superPage.waitForTimeout(1000);

    // Verify presence monitor API directly
    const monitorRes = await superPage.request.get('/api/presence/monitor');
    expect(monitorRes.ok()).toBeTruthy();
    const monitorJson = await monitorRes.json();

    expect(monitorJson.success).toBe(true);
    expect(monitorJson.data.panels.DIRECTOR.isOnline).toBe(true);
    expect(monitorJson.data.panels.DIRECTOR.lastLoginTime).not.toBe('—');
    expect(monitorJson.data.panels.DIRECTOR.lastPath).toContain('/panel/direktor');

    // Director navigates to reports
    await directorPage.goto('/panel/direktor/hisobotlar');
    await superPage.waitForTimeout(1000);

    const updatedRes = await superPage.request.get('/api/presence/monitor');
    const updatedJson = await updatedRes.json();
    expect(updatedJson.data.panels.DIRECTOR.lastPath).toContain('/panel/direktor/hisobotlar');

    // Director logs out
    await directorPage.click('text=Chiqish');
    await superPage.waitForTimeout(1000);

    const afterLogoutRes = await superPage.request.get('/api/presence/monitor');
    const afterLogoutJson = await afterLogoutRes.json();
    expect(afterLogoutJson.data.panels.DIRECTOR.isOnline).toBe(false);

    // Clean up
    await directorContext.close();
    await superContext.close();
  });
});
