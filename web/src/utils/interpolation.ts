/**
 * Replaces {{variableName}} templates in input strings with values from the variables map
 * and dynamic built-in tokens ($uuid, $timestamp, $randomInt, $isoDate).
 */
export function interpolateString(input: string, variables: Record<string, string>): string {
  if (!input) return '';

  return input.replace(/\{\{([^{}]+)\}\}/g, (match, varName) => {
    const trimmed = varName.trim();

    // Built-in dynamic variables
    if (trimmed === '$uuid') {
      return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
    }

    if (trimmed === '$timestamp') {
      return String(Date.now());
    }

    if (trimmed === '$isoDate') {
      return new Date().toISOString();
    }

    if (trimmed === '$randomInt') {
      return String(Math.floor(Math.random() * 1000) + 1);
    }

    // User environment variables
    if (Object.prototype.hasOwnProperty.call(variables, trimmed)) {
      return variables[trimmed];
    }

    return match; // Return unchanged if variable is missing
  });
}

/**
 * Finds all variable tokens in a string like {{baseUrl}} or {{$uuid}}.
 */
export function extractVariables(input: string): string[] {
  if (!input) return [];
  const matches = input.match(/\{\{([^{}]+)\}\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(2, -2).trim());
}
