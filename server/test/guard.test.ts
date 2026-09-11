import { describe, it, expect } from 'vitest';
import { validateTargetUrl } from '../src/proxy/guard.js';

describe('SSRF Guard', () => {
  it('should block localhost and 127.0.0.1 by default', async () => {
    const res1 = await validateTargetUrl('http://127.0.0.1:8080/secret');
    expect(res1.allowed).toBe(false);
    expect(res1.reason).toContain('SSRF protection');

    const res2 = await validateTargetUrl('http://localhost:3000/api');
    expect(res2.allowed).toBe(false);
  });

  it('should block private RFC 1918 addresses', async () => {
    const res10 = await validateTargetUrl('http://10.0.0.5/admin');
    expect(res10.allowed).toBe(false);

    const res172 = await validateTargetUrl('http://172.16.0.10/admin');
    expect(res172.allowed).toBe(false);

    const res192 = await validateTargetUrl('http://192.168.1.1/router');
    expect(res192.allowed).toBe(false);
  });

  it('should block cloud metadata addresses (169.254.169.254)', async () => {
    const resMeta = await validateTargetUrl('http://169.254.169.254/latest/meta-data/');
    expect(resMeta.allowed).toBe(false);
  });

  it('should reject non-HTTP protocols', async () => {
    const resFtp = await validateTargetUrl('ftp://example.com/file.txt');
    expect(resFtp.allowed).toBe(false);
    expect(resFtp.reason).toContain('Unsupported protocol');

    const resFile = await validateTargetUrl('file:///etc/passwd');
    expect(resFile.allowed).toBe(false);
  });

  it('should allow public domains', async () => {
    const res = await validateTargetUrl('https://httpbin.org/get');
    expect(res.allowed).toBe(true);
  });

  it('should allow private network if explicitly configured', async () => {
    const res = await validateTargetUrl('http://127.0.0.1:8080/api', true);
    expect(res.allowed).toBe(true);
  });
});
