import { test, expect } from '@playwright/test';

test.describe('Direktor paneli va funksiyalari E2E testlari', () => {
  test('1. Direktor tizimga kiradi, Nazorat, Xodimlar va Hisobotlar tugmalari ishlaydi', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Kirish sahifasiga o'tish
    await page.goto('/kirish');
    await expect(page).toHaveTitle(/Kirish/i);

    // 2. Direktor login va parolini kiritish
    await page.fill('input[type="text"]', 'direktor');
    await page.fill('input[type="password"]', 'direktor123');
    await page.click('button[type="submit"]');

    // 3. /panel/direktor sahifasiga yo'naltirilganini tekshirish
    await page.waitForURL('**/panel/direktor', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Maktab nazorati');

    // 4. "Xodimlar" tugmasini bosish va sahifani tekshirish
    await page.click('a[href="/panel/direktor/xodimlar"]');
    await page.waitForURL('**/panel/direktor/xodimlar');
    await expect(page.locator('h1')).toContainText('Maktab xodimlari va ustozlar');
    await expect(page.locator('text=Jami xodimlar')).toBeVisible();

    // Qidiruv va Yangi xodim qo'shish modalini tekshirish
    await page.click('button:has-text("Yangi xodim qo‘shish")');
    await expect(page.locator('h2:has-text("Yangi xodim qo‘shish")')).toBeVisible();
    await expect(page.locator('text=To‘liq ism (F.I.SH)')).toBeVisible();
    await page.click('button:has-text("Bekor qilish")');

    // 5. "Hisobotlar" tugmasini bosish va sahifani tekshirish
    await page.click('a[href="/panel/direktor/hisobotlar"]');
    await page.waitForURL('**/panel/direktor/hisobotlar');
    await expect(page.locator('h1')).toContainText('Davomat va ta’lim hisobotlari');
    await expect(page.locator('button:has-text("Excel yuklab olish")')).toBeVisible();
    await expect(page.locator('button:has-text("Chop etish")')).toBeVisible();

    // 6. Qayta "Nazorat" tugmasini bosib boshqaruvga qaytish
    await page.locator('aside a[href="/panel/direktor"]').click();
    await page.waitForURL('**/panel/direktor');
    await expect(page.locator('h1')).toContainText('Maktab nazorati');
  });
});
