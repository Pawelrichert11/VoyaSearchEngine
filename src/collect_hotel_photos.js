const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const inputPath = process.argv[2] || 'output/offers.json';
const outputDir = process.argv[3] || 'output/photo_sheets';

function safeName(value) {
  return String(value || 'hotel')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);
}

function flattenItems(data) {
  if (!Array.isArray(data)) return [];
  const flat = [];
  for (const item of data) {
    if (item.hotel_link) {
      flat.push(item);
    } else if (Array.isArray(item.hotels)) {
      for (const hotel of item.hotels) flat.push({ ...hotel, flight: item.flight });
    }
  }
  return flat;
}

(async () => {
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const items = flattenItems(raw).filter((item) => item.hotel_link);
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    locale: 'pl-PL',
    viewport: { width: 1400, height: 1200 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
  });

  const manifest = [];
  for (const item of items) {
    const page = await context.newPage();
    let imageUrls = [];
    try {
      await page.goto(item.hotel_link, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500);
      for (let i = 0; i < 5; i += 1) {
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(500);
      }
      imageUrls = await page.evaluate(() => {
        const seen = new Set();
        return Array.from(document.images)
          .map((img) => ({
            src: img.currentSrc || img.src,
            w: img.naturalWidth || img.width || 0,
            h: img.naturalHeight || img.height || 0,
            alt: img.alt || ''
          }))
          .filter((img) => img.src && img.w >= 250 && img.h >= 150)
          .filter((img) => /agoda|pix/i.test(img.src))
          .filter((img) => {
            const clean = img.src.split('?')[0];
            if (seen.has(clean)) return false;
            seen.add(clean);
            return true;
          })
          .slice(0, 24);
      });
    } catch (error) {
      item.error = error.message;
    } finally {
      await page.close().catch(() => {});
    }

    const sheet = await context.newPage();
    const title = `${item.id || item.row || ''} ${item.hotel_name || item.name || ''}`;
    const html = `<!doctype html>
      <html><head><meta charset="utf-8">
      <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #f4f4f4; color: #111; }
        header { padding: 12px 16px; background: white; border-bottom: 1px solid #ddd; font-size: 18px; font-weight: 700; }
        .meta { font-size: 13px; font-weight: 400; color: #333; margin-top: 4px; word-break: break-all; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; }
        .tile { background: white; border: 1px solid #ddd; min-height: 220px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        img { width: 100%; height: 260px; object-fit: cover; display: block; }
      </style></head><body>
      <header>${title}<div class="meta">${item.hotel_link || ''}</div></header>
      <main class="grid">${imageUrls.map((img) => `<div class="tile"><img src="${img.src.replace(/"/g, '&quot;')}"></div>`).join('')}</main>
      </body></html>`;
    await sheet.setContent(html, { waitUntil: 'domcontentloaded' });
    await sheet.waitForTimeout(3000);
    const filename = `${safeName(item.id || item.row || item.hotel_name || item.name)}.png`;
    const outputPath = path.join(outputDir, filename);
    await sheet.screenshot({ path: outputPath, fullPage: true });
    await sheet.close();
    console.log(`${item.id || item.row || ''} ${item.hotel_name || item.name || ''}: ${imageUrls.length} images -> ${outputPath}`);
    manifest.push({ ...item, image_count: imageUrls.length, screenshot: outputPath });
  }

  await browser.close();
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
})();
