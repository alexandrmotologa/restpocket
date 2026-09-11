export interface DiagnosticInfo {
  category: 'success' | 'client-error' | 'server-error' | 'network-error' | 'redirect';
  title: string;
  tip: string;
}

export function getDiagnostic(status: number, errorMessage?: string): DiagnosticInfo {
  if (errorMessage && errorMessage.includes('SSRF_BLOCKED')) {
    return {
      category: 'network-error',
      title: 'SSRF Protection Blocked Request',
      tip: 'The target IP or resolved domain belongs to a private network (RFC1918) or loopback address. Enable ALLOW_PRIVATE_NETWORK in your environment if testing local networks.',
    };
  }

  if (errorMessage && errorMessage.includes('timed out')) {
    return {
      category: 'network-error',
      title: 'Connection Timed Out',
      tip: 'The remote server did not respond within the timeout limit. Verify the host is online and accepting incoming connections.',
    };
  }

  if (status >= 200 && status < 300) {
    return {
      category: 'success',
      title: 'Successful Execution',
      tip: 'The server received, understood, and accepted the request.',
    };
  }

  if (status >= 300 && status < 400) {
    return {
      category: 'redirect',
      title: 'Redirection Response',
      tip: 'The requested resource has been redirected to another URI specified in the Location header.',
    };
  }

  switch (status) {
    case 400:
      return {
        category: 'client-error',
        title: '400 Bad Request',
        tip: 'The server could not understand the request due to malformed syntax. Check your query parameters and request body JSON structure.',
      };
    case 401:
      return {
        category: 'client-error',
        title: '401 Unauthorized',
        tip: 'Authentication is required. Make sure to provide a valid Bearer token or Basic Auth credentials in the Auth tab.',
      };
    case 403:
      return {
        category: 'client-error',
        title: '403 Forbidden',
        tip: 'The server understood the request but refuses to authorize it. Check if your API key or token has sufficient permissions.',
      };
    case 404:
      return {
        category: 'client-error',
        title: '404 Not Found',
        tip: 'The requested endpoint does not exist. Verify the URL spelling and check for missing path variables or unwanted trailing slashes.',
      };
    case 405:
      return {
        category: 'client-error',
        title: '405 Method Not Allowed',
        tip: 'The target resource does not support this HTTP method. For example, you may have used POST on an endpoint that only allows GET.',
      };
    case 415:
      return {
        category: 'client-error',
        title: '415 Unsupported Media Type',
        tip: 'The target server rejected the payload format. Verify that your Content-Type header matches the body (e.g. application/json).',
      };
    case 422:
      return {
        category: 'client-error',
        title: '422 Unprocessable Entity',
        tip: 'The request syntax is valid, but the server could not process the contained instructions. Often caused by validation errors in request body fields.',
      };
    case 429:
      return {
        category: 'client-error',
        title: '429 Too Many Requests',
        tip: 'You have exceeded the rate limits set by the remote API. Inspect the response headers for Retry-After or X-RateLimit indicators.',
      };
    case 500:
      return {
        category: 'server-error',
        title: '500 Internal Server Error',
        tip: 'An unexpected condition was encountered on the remote server. The problem is on the server side, not your client configuration.',
      };
    case 502:
      return {
        category: 'server-error',
        title: '502 Bad Gateway',
        tip: 'The remote server, while acting as a gateway or proxy, received an invalid response from the upstream server.',
      };
    case 503:
      return {
        category: 'server-error',
        title: '503 Service Unavailable',
        tip: 'The remote server is currently unable to handle the request due to temporary overloading or maintenance.',
      };
    case 504:
      return {
        category: 'server-error',
        title: '504 Gateway Timeout',
        tip: 'The remote gateway did not receive a timely response from an upstream server. Check if the remote service is experiencing downtime.',
      };
    default:
      return {
        category: status >= 500 ? 'server-error' : 'client-error',
        title: `HTTP ${status}`,
        tip: 'Review response body and headers for specific API error payloads.',
      };
  }
}
