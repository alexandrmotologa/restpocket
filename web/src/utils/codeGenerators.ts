import { HttpMethod } from '../types/index.js';

export function generateCurl(
  method: HttpMethod,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): string {
  const parts: string[] = ['curl'];

  if (method !== 'GET') {
    parts.push(`-X ${method}`);
  }

  parts.push(`"${url}"`);

  for (const [key, value] of Object.entries(headers)) {
    parts.push(`-H "${key}: ${value}"`);
  }

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const escapedBody = body.replace(/"/g, '\\"');
    parts.push(`-d "${escapedBody}"`);
  }

  return parts.join(' \\\n  ');
}

export function generateFetch(
  method: HttpMethod,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): string {
  const options: Record<string, any> = {
    method,
    headers,
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      options.body = JSON.parse(body);
    } catch {
      options.body = body;
    }
  }

  return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},
  ${body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? `body: JSON.stringify(${body.trim()})` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
}

export function generatePython(
  method: HttpMethod,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): string {
  return `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
${body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? `payload = ${body.trim()}` : 'payload = None'}

response = requests.${method.toLowerCase()}(
    url,
    headers=headers,
    ${body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? 'json=payload' : ''}
)

print("Status:", response.status_code)
print(response.text)
`;
}

export function generateGo(
  method: HttpMethod,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): string {
  return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)

func main() {
\tclient := &http.Client{}
\t${body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? `body := strings.NewReader(\`${body}\`)` : 'var body io.Reader = nil'}
\treq, err := http.NewRequest("${method}", "${url}", body)
\tif err != nil {
\t\tpanic(err)
\t}

${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
  .join('\n')}

\tres, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbodyBytes, _ := io.ReadAll(res.Body)
\tfmt.Printf("Status: %d\\nResponse: %s\\n", res.StatusCode, string(bodyBytes))
}
`;
}
