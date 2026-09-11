import { db, MonitorRecord } from '../db/database.js';
import { executeHttpRequest } from '../proxy/executor.js';
import { getTelegramBot } from '../bot/bot.js';
import { config } from '../config.js';

let intervalTimer: NodeJS.Timeout | null = null;
const lastCheckMap = new Map<number, number>();

async function checkMonitor(monitor: MonitorRecord): Promise<void> {
  const bot = getTelegramBot();
  let status = 0;
  let latencyMs = 0;
  let isDown = false;
  let errorMessage = '';

  try {
    const result = await executeHttpRequest(
      {
        method: monitor.method as any,
        url: monitor.url,
        timeoutMs: 10000,
      },
      config.allowPrivateNetwork
    );

    status = result.status;
    latencyMs = result.latencyMs;

    if (status !== monitor.expected_status) {
      isDown = true;
      errorMessage = `Expected HTTP ${monitor.expected_status} but received HTTP ${status}.`;
    }
  } catch (err: any) {
    isDown = true;
    status = 0;
    latencyMs = err.latencyMs || 0;
    errorMessage = err.message || 'Connection failed or timed out.';
  }

  db.updateMonitorCheck(monitor.id, status, latencyMs);

  // If endpoint is down and user is not guest, send alert via Telegram Bot
  if (isDown && bot && monitor.user_id && monitor.user_id !== 'guest') {
    try {
      const msg =
        `🚨 *RestPocket Alert: Endpoint Down!*\n\n` +
        `*Monitor:* ${monitor.name}\n` +
        `*Target:* \`${monitor.method} ${monitor.url}\`\n` +
        `*Status:* ${status === 0 ? 'CONNECTION FAILED' : status}\n` +
        `*Latency:* ${latencyMs} ms\n` +
        `*Detail:* ${errorMessage}\n\n` +
        `_Checked at: ${new Date().toLocaleTimeString()}_`;

      await bot.api.sendMessage(monitor.user_id, msg, { parse_mode: 'Markdown' });
    } catch (sendErr: any) {
      console.warn(`[Monitor] Failed to send Telegram alert to ${monitor.user_id}: ${sendErr.message}`);
    }
  }
}

async function runMonitorCycle(): Promise<void> {
  const monitors = db.getAllActiveMonitors();
  const now = Date.now();

  for (const monitor of monitors) {
    const lastTime = lastCheckMap.get(monitor.id) || 0;
    const intervalMs = (monitor.interval_minutes || 15) * 60 * 1000;

    if (now - lastTime >= intervalMs) {
      lastCheckMap.set(monitor.id, now);
      checkMonitor(monitor).catch((err) => {
        console.error(`[Monitor] Check error for monitor ${monitor.id}:`, err);
      });
    }
  }
}

export function startMonitorService(): void {
  if (intervalTimer) return;
  // Run check every 30 seconds
  intervalTimer = setInterval(runMonitorCycle, 30000);
  // Also run immediately on startup
  setTimeout(runMonitorCycle, 5000);
}

export function stopMonitorService(): void {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}
