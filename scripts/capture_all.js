import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '../docs/images');
const BASE_URL = 'http://127.0.0.1:8095';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=2',
    ],
  });

  const page = await browser.newPage();

  // Helper to click Send button
  async function triggerSend() {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Send')) {
        console.log('🎯 Found Send button. Clicking...');
        await btn.click();
        return true;
      }
    }
    return false;
  }

  // 1. Desktop Interface
  console.log('📸 1. Capturing app_desktop.png...');
  await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Send request
  await triggerSend();
  await sleep(3000); // wait for proxy & httpbin response

  await page.screenshot({
    path: path.join(IMAGES_DIR, 'app_desktop.png'),
    fullPage: false,
  });
  console.log('✅ app_desktop.png captured.');

  // 2. Visual Form-to-JSON Builder
  console.log('📸 2. Capturing request_builder.png...');
  // Click Body tab
  const tabButtons = await page.$$('div > button');
  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.trim().startsWith('Body')) {
      await btn.click();
      break;
    }
  }
  await sleep(600);

  // Select "json" from body type select
  const select = await page.$('select');
  if (select) {
    await page.select('select', 'json');
    await sleep(400);
  }

  // Toggle "Form Builder" mode
  const modeButtons = await page.$$('button');
  for (const btn of modeButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Code Mode')) {
      await btn.click();
      break;
    }
  }
  await sleep(500);

  // Fill in form rows
  const keyInputs = await page.$$('input[placeholder="Field name"]');
  const valInputs = await page.$$('input[placeholder="Value"]');
  if (keyInputs.length > 0 && valInputs.length > 0) {
    await keyInputs[0].type('service_name');
    await valInputs[0].type('RestPocket Gateway');
  }

  // Add more fields
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Add Field')) {
      await btn.click();
      await sleep(200);
      await btn.click();
      await sleep(200);
      await btn.click();
      await sleep(200);
      break;
    }
  }

  const updatedKeyInputs = await page.$$('input[placeholder="Field name"]');
  const updatedValInputs = await page.$$('input[placeholder="Value"]');
  if (updatedKeyInputs.length >= 4 && updatedValInputs.length >= 4) {
    await updatedKeyInputs[1].type('environment');
    await updatedValInputs[1].type('production');
    await updatedKeyInputs[2].type('rate_limit_per_min');
    await updatedValInputs[2].type('1200');
    await updatedKeyInputs[3].type('auto_retry_enabled');
    await updatedValInputs[3].type('true');
  }
  await sleep(600);

  await page.screenshot({
    path: path.join(IMAGES_DIR, 'request_builder.png'),
    fullPage: false,
  });
  console.log('✅ request_builder.png captured.');

  // 3. Webhook Catcher / RequestBin
  console.log('📸 3. Capturing webhook_catcher.png...');
  // Create a webhook bin via API
  const createBinRes = await fetch(`${BASE_URL}/api/bin/create`, { method: 'POST' });
  const binData = await createBinRes.json();
  const binId = binData.binId;
  console.log('Created bin for screenshot:', binId);

  // Send sample webhooks to this bin
  await fetch(`${BASE_URL}/api/bin/${binId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push',
      'User-Agent': 'GitHub-Hookshot/f31c0a1',
    },
    body: JSON.stringify({
      ref: 'refs/heads/main',
      repository: { name: 'restpocket', full_name: 'alexandrmotologa/restpocket' },
      pusher: { name: 'alexandrmotologa' },
      commits: [
        { id: '40eaf87', message: 'feat(branding): redesign logo with clean supersonic rocket' }
      ]
    }),
  });

  await fetch(`${BASE_URL}/api/bin/${binId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 't=1789209600,v1=9f8e8a7c2b5d4e1',
    },
    body: JSON.stringify({
      id: 'evt_3MtwadLkdIwHu7ix28a3tqSd',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3MtwadLkdIwHu7ix28a3tqSd',
          amount: 4900,
          currency: 'usd',
          status: 'succeeded'
        }
      }
    }),
  });
  await sleep(500);

  // Set bin in localStorage and reload page
  await page.evaluate((id) => {
    localStorage.setItem('restpocket_bin_id', id);
  }, binId);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(800);

  // Trigger Send on desktop first so background looks awesome
  await triggerSend();
  await sleep(2500);

  // Click Webhook Catcher button in header (title="Webhook Catcher / RequestBin")
  const webhookBtn = await page.$('button[title*="Webhook"]');
  if (webhookBtn) {
    console.log('🎯 Clicking Webhook Catcher button...');
    await webhookBtn.click();
    await sleep(1200);
  }

  // Expand the first webhook event to reveal payload
  const eventRows = await page.$$('div.cursor-pointer, div[class*="cursor-pointer"]');
  for (const row of eventRows) {
    const text = await page.evaluate((el) => el.textContent, row);
    if (text && (text.includes('payment_intent') || text.includes('POST') || text.includes('push'))) {
      await row.click();
      break;
    }
  }
  await sleep(600);

  await page.screenshot({
    path: path.join(IMAGES_DIR, 'webhook_catcher.png'),
    fullPage: false,
  });
  console.log('✅ webhook_catcher.png captured.');

  // 4. Mobile Mini App
  console.log('📸 4. Capturing app_mobile.png...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Send request on mobile
  await triggerSend();
  await sleep(3000);

  await page.screenshot({
    path: path.join(IMAGES_DIR, 'app_mobile.png'),
    fullPage: false,
  });
  console.log('✅ app_mobile.png captured.');

  await browser.close();
  console.log('🎉 All 4 screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
