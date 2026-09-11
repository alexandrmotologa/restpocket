import { describe, it, expect } from 'vitest';
import { executeHttpRequest } from '../src/proxy/executor.js';

describe('HTTP Executor', () => {
  it('should execute a real GET request and measure latency and payload size', async () => {
    const result = await executeHttpRequest({
      method: 'GET',
      url: 'https://httpbin.org/get',
      headers: {
        'User-Agent': 'RestPocket-Test/1.0',
      },
    });

    expect(result.status).toBe(200);
    expect(result.statusText).toBe('OK');
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(result.data).toBeDefined();
    expect(result.data.headers['User-Agent']).toBe('RestPocket-Test/1.0');
    expect(result.isBinary).toBe(false);
  });

  it('should reject requests targeting SSRF loopback addresses', async () => {
    await expect(
      executeHttpRequest({
        method: 'GET',
        url: 'http://127.0.0.1:9999/secret',
      })
    ).rejects.toThrow('SSRF_BLOCKED');
  });
});
