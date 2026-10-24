const { chromium } = require('../apps/web/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, step = 30, delay = 20) {
  const currentY = await page.evaluate(() => window.scrollY);
  const distance = targetY - currentY;
  const steps = Math.max(1, Math.abs(Math.round(distance / step)));
  const stepAmount = distance / steps;

  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), stepAmount);
    await sleep(delay);
  }
}

async function runTour(page, context) {
  // SAHNA 1: Landing Page & Hero
  console.log('📌 Sahna 1: Bosh sahifa va Hero taqdimoti...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await sleep(1500);

  // Scroll down to advantages & stats
  console.log('📌 Sahna 1: Afzalliklar va statistika...');
  await smoothScroll(page, 750, 25, 20);
  await sleep(1200);

  await smoothScroll(page, 1550, 25, 20);
  await sleep(1200);

  // Scroll back to top
  await smoothScroll(page, 0, 50, 15);
  await sleep(800);

  // SAHNA 2: Direktor Paneli
  console.log('📌 Sahna 2: Direktor paneli (Statistika & Moliya)...');
  await context.clearCookies();
  await page.goto('http://localhost:3000/kirish', { waitUntil: 'domcontentloaded' });
  await sleep(600);

  await page.locator('input[type="text"]').fill('admin1');
  await sleep(200);
  await page.locator('input[type="password"]').fill('admin1');
  await sleep(200);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/panel/direktor', { timeout: 10000 });
  await sleep(1200);

  // Direktor dashboard scroll
  await smoothScroll(page, 450, 20, 20);
  await sleep(1000);

  // Direktor Xodimlar
  console.log('📌 Sahna 2b: Xodimlar va ustozlar nazorati...');
  await page.goto('http://localhost:3000/panel/direktor/xodimlar', { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await smoothScroll(page, 300, 20, 20);
  await sleep(800);

  // Direktor Hisobotlar
  console.log('📌 Sahna 2c: Hisobotlar va analitika...');
  await page.goto('http://localhost:3000/panel/direktor/hisobotlar', { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await smoothScroll(page, 350, 20, 20);
  await sleep(800);

  // SAHNA 3: Zavuch Paneli
  console.log('📌 Sahna 3: Zavuch paneli va sinflar boshqaruvi...');
  await context.clearCookies();
  await page.goto('http://localhost:3000/kirish', { waitUntil: 'domcontentloaded' });
  await sleep(500);

  await page.locator('input[type="text"]').fill('admin2');
  await page.locator('input[type="password"]').fill('admin2');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/panel/zavuch', { timeout: 10000 });
  await sleep(1000);

  await page.goto('http://localhost:3000/panel/zavuch/sinflar', { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await smoothScroll(page, 300, 20, 20);
  await sleep(800);

  // SAHNA 4: Ustoz Paneli
  console.log('📌 Sahna 4: O‘qituvchi paneli — tezkor davomat...');
  await context.clearCookies();
  await page.goto('http://localhost:3000/kirish', { waitUntil: 'domcontentloaded' });
  await sleep(500);

  await page.locator('input[type="text"]').fill('admin3');
  await page.locator('input[type="password"]').fill('admin3');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/panel/ustoz', { timeout: 10000 });
  await sleep(1000);

  await smoothScroll(page, 350, 20, 20);
  await sleep(1200);

  // SAHNA 5: Final
  console.log('📌 Sahna 5: Final brending...');
  await context.clearCookies();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await sleep(1500);
}

async function recordPromo() {
  console.log('🎬 Professional Promo Video yozish boshlanmoqda...');
  const outputDir = path.resolve(__dirname, 'raw-recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  // --- 1. Full HD (1920x1080) Desktop Tour ---
  console.log('📹 1/1: Full HD 1080p Widescreen yozilmoqda...');
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await runTour(page, context);
  } catch (e) {
    console.error('Xatolik:', e.message);
  }

  const videoObj = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (videoObj) {
    const rawVideoPath = await videoObj.path();
    console.log('✅ Xom video saqlandi:', rawVideoPath);

    const mp4Path = path.resolve(__dirname, 'neom-school-promo-1080p.mp4');
    console.log('🔄 MP4 formatiga o‘girilmoqda (H.264 FastStart)...');
    try {
      execSync(`ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -movflags +faststart "${mp4Path}"`, {
        stdio: 'inherit',
      });
      console.log('🎉 TAYYOR! Full HD video fayl:', mp4Path);
    } catch (e) {
      console.error('FFmpeg xatosi:', e.message);
    }
  }
}

recordPromo();
