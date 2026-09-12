import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '../docs/images');
const FRAMES_DIR = path.resolve(__dirname, '../.frames');
const BASE_URL = 'http://127.0.0.1:8095';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('🚀 Launching Puppeteer for GIF demo recording...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 680, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1000);

  let frameCount = 0;
  let recording = true;

  const captureLoop = async () => {
    while (recording) {
      const frameNum = String(frameCount++).padStart(5, '0');
      try {
        await page.screenshot({
          path: path.join(FRAMES_DIR, `frame_${frameNum}.png`),
          fullPage: false,
        });
      } catch {}
      await sleep(100); // 10 fps
    }
  };

  const recordingPromise = captureLoop();

  // Action 1: Initial idle
  await sleep(800);

  // Action 2: Click Send on default GET request
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Send')) {
      await btn.click();
      break;
    }
  }
  await sleep(2500); // wait for 200 OK response

  // Action 3: Switch to Body tab
  const tabButtons = await page.$$('div > button');
  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.trim().startsWith('Body')) {
      await btn.click();
      break;
    }
  }
  await sleep(1200);

  // Action 4: Open Webhook Catcher drawer
  const webhookBtn = await page.$('button[title*="Webhook"]');
  if (webhookBtn) {
    await webhookBtn.click();
    await sleep(2000);
  }

  // Stop recording
  recording = false;
  await recordingPromise;
  await browser.close();

  console.log(`🎬 Captured ${frameCount} frames. Converting with FFmpeg...`);
  const gifOutput = path.join(IMAGES_DIR, 'restpocket_demo.gif');

  const ffmpegCmd = `ffmpeg -y -framerate 10 -i "${path.join(FRAMES_DIR, 'frame_%05d.png')}" -vf "scale=880:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:reserve_transparent=0[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" -loop 0 "${gifOutput}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log('✅ restpocket_demo.gif generated successfully!');

  // Cleanup frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}

run().catch((err) => {
  console.error('GIF generation failed:', err);
  process.exit(1);
});
