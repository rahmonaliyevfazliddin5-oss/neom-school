import { test, expect } from '@playwright/test';

test.describe('NEOM School 3 ta panel va xavfsizlik tizimi E2E testlari', () => {
  test('1. Direktor login: admin1 / parol: admin1 -> /panel/direktor ochiladi', async ({ page }) => {
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin1');
    await page.fill('input[type="password"]', 'admin1');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/panel/direktor', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Maktab nazorati');
  });

  test('2. Zamdirektor login: admin2 / parol: admin2 -> Bosh panel, Sinflar va Yangiliklar to‘liq ishlaydi', async ({ page }) => {
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin2');
    await page.fill('input[type="password"]', 'admin2');
    await page.click('button[type="submit"]');

    // 1. Bosh panel
    await page.waitForURL('**/panel/zavuch', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Bugungi davomat');

    // 2. Sinflar bo'limi
    await page.click('aside a[href="/panel/zavuch/sinflar"]');
    await page.waitForURL('**/panel/zavuch/sinflar');
    await expect(page.locator('h1')).toContainText('Maktab sinflari');
    await expect(page.locator('text=Jami sinflar')).toBeVisible();
    await expect(page.getByText('1-A sinf', { exact: true })).toBeVisible();

    // 3. Yangilik va tadbirlar bo'limi
    await page.click('aside a[href="/panel/zavuch/yangiliklar"]');
    await page.waitForURL('**/panel/zavuch/yangiliklar');
    await expect(page.locator('h1')).toContainText('Yangilik va tadbirlar');
    await expect(page.locator('text=Jami e’lonlar')).toBeVisible();

    // 4. Qayta Bosh panelga qaytish
    await page.click('aside a[href="/panel/zavuch"]');
    await page.waitForURL('**/panel/zavuch');
    await expect(page.locator('h1')).toContainText('Bugungi davomat');
  });

  test('3. O‘qituvchi login: admin3 / parol: admin3 -> /panel/ustoz ochiladi', async ({ page }) => {
    await page.goto('/kirish');
    await page.fill('input[type="text"]', 'admin3');
    await page.fill('input[type="password"]', 'admin3');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/panel/ustoz', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Kunlik davomat');
  });

  test('4. XAVFSIZLIK: Ruxsatsiz /panel/* ga kirish 404 sahifa qaytaradi (panel mavjud emasdek ko‘rinadi)', async ({ page }) => {
    // Brauzer kuki tozalanadi
    await page.context().clearCookies();

    // /panel/direktor ga ruxsatsiz kirish -> 404 sahifasi
    const resDirektor = await page.goto('/panel/direktor');
    expect(resDirektor?.status()).toBe(404);
    await expect(page.locator('text=404')).toBeVisible();

    // /panel/zavuch ga ruxsatsiz kirish -> 404 sahifasi
    const resZavuch = await page.goto('/panel/zavuch');
    expect(resZavuch?.status()).toBe(404);

    // /panel/ustoz ga ruxsatsiz kirish -> 404 sahifasi
    const resUstoz = await page.goto('/panel/ustoz');
    expect(resUstoz?.status()).toBe(404);
  });

  test('5. XAVFSIZLIK: Faqat shu 3 ta panel mavjud, boshqa hech qanday panel yo‘q (/panel/admin, /panel/super, /panel)', async ({ page }) => {
    // /panel bare URL -> 404
    const resPanel = await page.goto('/panel');
    expect(resPanel?.status()).toBe(404);

    // /panel/admin -> 404
    const resAdmin = await page.goto('/panel/admin');
    expect(resAdmin?.status()).toBe(404);

    // /panel/superadmin -> 404
    const resSuper = await page.goto('/panel/superadmin');
    expect(resSuper?.status()).toBe(404);
  });

  test('6. XAVFSIZLIK: Mehmon sahifasi manbasida panellar mavjudligi haqida hech qanday belgi yo‘q', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const html = (await res.text()).toLowerCase();

    expect(html).not.toContain('/panel/direktor');
    expect(html).not.toContain('/panel/zavuch');
    expect(html).not.toContain('/panel/ustoz');
    expect(html).not.toContain('direktor paneli');
    expect(html).not.toContain('zavuch paneli');
    expect(html).not.toContain('o\'qituvchi paneli');
  });
});
