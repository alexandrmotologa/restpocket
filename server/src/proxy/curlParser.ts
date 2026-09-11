export interface ParsedCurl {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Tokenizes a command line string respecting single and double quotes.
 */
function tokenizeCommandLine(cmd: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  // Clean multiline continuations (\ at end of line)
  const normalized = cmd.replace(/\\\r?\n/g, ' ').trim();

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\' && !inSingleQuote) {
      escapeNext = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if ((char === ' ' || char === '\t') && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Parses a cURL command string into structured request components.
 */
export function parseCurlCommand(rawCommand: string): ParsedCurl {
  const tokens = tokenizeCommandLine(rawCommand);

  let method: ParsedCurl['method'] = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  const bodyChunks: string[] = [];

  let methodExplicit = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === 'curl') {
      continue;
    }

    // Method flag: -X or --request
    if (token === '-X' || token === '--request') {
      if (i + 1 < tokens.length) {
        const parsedMethod = tokens[++i].toUpperCase() as ParsedCurl['method'];
        method = parsedMethod;
        methodExplicit = true;
      }
      continue;
    }

    // Header flag: -H or --header
    if (token === '-H' || token === '--header') {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const colonIndex = headerStr.indexOf(':');
        if (colonIndex > 0) {
          const headerKey = headerStr.slice(0, colonIndex).trim();
          const headerValue = headerStr.slice(colonIndex + 1).trim();
          headers[headerKey] = headerValue;
        }
      }
      continue;
    }

    // Body data flags: -d, --data, --data-raw, --data-binary, --data-urlencode
    if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-urlencode'
    ) {
      if (i + 1 < tokens.length) {
        bodyChunks.push(tokens[++i]);
        if (!methodExplicit) {
          method = 'POST';
        }
      }
      continue;
    }

    // If token starts with http:// or https:// or looks like a URL
    if (
      !url &&
      (token.startsWith('http://') ||
        token.startsWith('https://') ||
        (token.includes('.') && !token.startsWith('-')))
    ) {
      url = token.startsWith('http://') || token.startsWith('https://') ? token : `http://${token}`;
      continue;
    }
  }

  const finalBody = bodyChunks.length > 0 ? bodyChunks.join('&') : undefined;

  return {
    method,
    url,
    headers,
    body: finalBody,
  };
}
