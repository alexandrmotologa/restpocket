import { describe, it, expect, beforeAll } from 'vitest';
import { db, getDatabase } from '../src/db/database.js';

describe('Advanced Server Features (Webhooks & Monitors)', () => {
  beforeAll(() => {
    getDatabase();
  });

  it('should capture and retrieve incoming webhook events', () => {
    const binId = 'test_bin_42';
    const recorded = db.saveWebhookEvent(
      binId,
      'POST',
      `/api/bin/${binId}/stripe/charge`,
      { 'content-type': 'application/json' },
      { source: 'stripe' },
      JSON.stringify({ id: 'evt_123', amount: 5000 })
    );

    expect(recorded.id).toBeDefined();
    expect(recorded.bin_id).toBe(binId);

    const events = db.getWebhookEvents(binId);
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].method).toBe('POST');
    expect(events[0].body_raw).toContain('evt_123');

    const cleared = db.clearWebhookEvents(binId);
    expect(cleared).toBe(true);

    const empty = db.getWebhookEvents(binId);
    expect(empty.length).toBe(0);
  });

  it('should manage health check monitors', () => {
    const monitor = db.createMonitor(
      'user_mon_1',
      'Production API Health',
      'GET',
      'https://httpbin.org/status/200',
      5,
      200
    );

    expect(monitor.id).toBeDefined();
    expect(monitor.name).toBe('Production API Health');
    expect(monitor.interval_minutes).toBe(5);

    const activeList = db.getAllActiveMonitors();
    expect(activeList.some((m) => m.id === monitor.id)).toBe(true);

    db.updateMonitorCheck(monitor.id, 200, 45.2);

    const userMonitors = db.getMonitors('user_mon_1');
    const updated = userMonitors.find((m) => m.id === monitor.id);
    expect(updated?.last_status).toBe(200);
    expect(updated?.last_latency_ms).toBe(45.2);

    const deleted = db.deleteMonitor(monitor.id, 'user_mon_1');
    expect(deleted).toBe(true);
  });
});
