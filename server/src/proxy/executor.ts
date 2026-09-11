import { request } from 'undici';
import { validateTargetUrl } from './guard.js';

export interface ExecutePayload {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface ExecuteResult {
  status: number;
  statusText: string;
  latencyMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: any;
  isBinary: boolean;
  contentType?: string;
}

export async function executeHttpRequest(
  payload: ExecutePayload,
  allowPrivateNetwork = false
): Promise<ExecuteResult> {
  const { method, url, headers = {}, body, timeoutMs = 15000 } = payload;

  // Validate URL with SSRF Guard
  const guard = await validateTargetUrl(url, allowPrivateNetwork);
  if (!guard.allowed) {
    throw new Error(`SSRF_BLOCKED: ${guard.reason}`);
  }

  const cleanHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key && value !== undefined && value !== null) {
      cleanHeaders[key] = String(value);
    }
  }

  // Ensure Host header is not conflicting if user specified
  delete cleanHeaders['host'];

  const startTime = process.hrtime.bigint();

  try {
    const res = await request(url, {
      method,
      headers: cleanHeaders,
      body: body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? body : undefined,
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
    });

    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1_000_000;

    // Convert Undici incoming headers to plain key-value map
    const responseHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(res.headers)) {
      if (Array.isArray(v)) {
        responseHeaders[k] = v.join(', ');
      } else if (v !== undefined) {
        responseHeaders[k] = String(v);
      }
    }

    const contentType = responseHeaders['content-type'] || '';
    const isJson = contentType.includes('application/json') || contentType.includes('+json');
    const isText =
      contentType.startsWith('text/') ||
      contentType.includes('application/xml') ||
      contentType.includes('application/javascript') ||
      contentType.includes('application/x-yaml');

    const buffer = Buffer.from(await res.body.arrayBuffer());
    const sizeBytes = buffer.byteLength;

    let responseData: any;
    let isBinary = false;

    if (isJson) {
      const text = buffer.toString('utf-8');
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    } else if (isText) {
      responseData = buffer.toString('utf-8');
    } else if (contentType.startsWith('image/') || contentType.startsWith('audio/') || contentType === 'application/pdf') {
      isBinary = true;
      responseData = `data:${contentType};base64,${buffer.toString('base64')}`;
    } else {
      // Default to attempting UTF-8 text, fallback to base64 if binary null bytes found
      const text = buffer.toString('utf-8');
      if (text.includes('\u0000')) {
        isBinary = true;
        responseData = `data:application/octet-stream;base64,${buffer.toString('base64')}`;
      } else {
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      }
    }

    const statusTextMap: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      408: 'Request Timeout',
      418: "I'm a teapot",
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return {
      status: res.statusCode,
      statusText: statusTextMap[res.statusCode] || `HTTP ${res.statusCode}`,
      latencyMs: Math.round(latencyMs * 100) / 100,
      sizeBytes,
      headers: responseHeaders,
      data: responseData,
      isBinary,
      contentType,
    };
  } catch (error: any) {
    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1_000_000;

    throw {
      message: error.message || 'Request failed',
      code: error.code || 'REQUEST_FAILED',
      latencyMs: Math.round(latencyMs * 100) / 100,
    };
  }
}
