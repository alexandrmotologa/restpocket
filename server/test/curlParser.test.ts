import { describe, it, expect } from 'vitest';
import { parseCurlCommand } from '../src/proxy/curlParser.js';

describe('cURL Parser', () => {
  it('should parse simple GET request', () => {
    const cmd = 'curl https://httpbin.org/get';
    const result = parseCurlCommand(cmd);

    expect(result.method).toBe('GET');
    expect(result.url).toBe('https://httpbin.org/get');
    expect(Object.keys(result.headers).length).toBe(0);
    expect(result.body).toBeUndefined();
  });

  it('should parse POST request with headers and data', () => {
    const cmd = `curl -X POST https://httpbin.org/post -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"hello":"world"}'`;
    const result = parseCurlCommand(cmd);

    expect(result.method).toBe('POST');
    expect(result.url).toBe('https://httpbin.org/post');
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers['Authorization']).toBe('Bearer test-token');
    expect(result.body).toBe('{"hello":"world"}');
  });

  it('should infer POST method when -d is used without explicit -X', () => {
    const cmd = 'curl https://example.com/api --data "param1=val1&param2=val2"';
    const result = parseCurlCommand(cmd);

    expect(result.method).toBe('POST');
    expect(result.url).toBe('https://example.com/api');
    expect(result.body).toBe('param1=val1&param2=val2');
  });

  it('should handle multiline curl commands with line breaks', () => {
    const cmd = `curl --location 'https://api.github.com/user' \\
      --header 'Accept: application/vnd.github.v3+json' \\
      --header 'User-Agent: Awesome-Octocat-App'`;

    const result = parseCurlCommand(cmd);
    expect(result.method).toBe('GET');
    expect(result.url).toBe('https://api.github.com/user');
    expect(result.headers['Accept']).toBe('application/vnd.github.v3+json');
    expect(result.headers['User-Agent']).toBe('Awesome-Octocat-App');
  });
});
