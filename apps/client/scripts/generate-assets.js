import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const htmlFile = `file://${path.join(__dirname, 'asset-generator.html')}`;

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log(`Navigating to ${htmlFile}...`);
  await page.goto(htmlFile);

  const assets = [
    { id: 'icon-standard', name: 'icon-512.png' },
    { id: 'icon-192', name: 'icon-192.png' },
    { id: 'icon-180', name: 'apple-touch-icon.png' },
    { id: 'icon-32', name: 'favicon.png' },
    { id: 'icon-maskable', name: 'maskable-icon.png' },
    { id: 'screenshot-wide', name: 'screenshot-wide.png' },
    { id: 'screenshot-narrow', name: 'screenshot-narrow.png' },
  ];

  for (const asset of assets) {
    const element = await page.locator(`#${asset.id}`);
    await element.screenshot({ path: path.join(publicDir, asset.name) });
    console.log(`Generated ${asset.name}`);
  }

  // Handle favicon.ico (copy favicon.png)
  fs.copyFileSync(
    path.join(publicDir, 'favicon.png'),
    path.join(publicDir, 'favicon.ico'),
  );
  console.log('Generated favicon.ico');

  await browser.close();
  console.log('Done.');
})();
