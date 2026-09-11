import { CollectionItem, SavedRequestItem, HttpMethod } from '../types/index.js';

export interface PostmanImportResult {
  collectionName: string;
  requests: Array<{
    name: string;
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }>;
}

/**
 * Parses Postman Collection v2.1 JSON into RestPocket request items.
 */
export function parsePostmanCollection(jsonString: string): PostmanImportResult {
  const data = JSON.parse(jsonString);

  const collectionName = data.info?.name || 'Imported Postman Collection';
  const requests: PostmanImportResult['requests'] = [];

  function processItems(items: any[]) {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (item.request) {
        const req = item.request;
        const method = (req.method || 'GET').toUpperCase() as HttpMethod;

        let url = '';
        if (typeof req.url === 'string') {
          url = req.url;
        } else if (req.url && req.url.raw) {
          url = req.url.raw;
        }

        const headers: Record<string, string> = {};
        if (Array.isArray(req.header)) {
          for (const h of req.header) {
            if (h.key && h.value && !h.disabled) {
              headers[h.key] = h.value;
            }
          }
        }

        let body: string | undefined;
        if (req.body?.raw) {
          body = req.body.raw;
        }

        requests.push({
          name: item.name || `${method} ${url}`,
          method,
          url,
          headers,
          body,
        });
      } else if (item.item) {
        processItems(item.item);
      }
    }
  }

  if (Array.isArray(data.item)) {
    processItems(data.item);
  }

  return {
    collectionName,
    requests,
  };
}

/**
 * Exports a RestPocket collection into standard Postman v2.1 format.
 */
export function exportToPostmanCollection(collection: CollectionItem): string {
  const postmanObj = {
    info: {
      _postman_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c_' + Date.now(),
      name: collection.name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: collection.requests.map((r: SavedRequestItem) => {
      let headersParsed: Record<string, string> = {};
      try {
        headersParsed = JSON.parse(r.headers_json || '{}');
      } catch {
        // Ignored
      }

      return {
        name: r.name,
        request: {
          method: r.method,
          header: Object.entries(headersParsed).map(([k, v]) => ({
            key: k,
            value: v,
            type: 'text',
          })),
          url: {
            raw: r.url,
          },
          body: r.body_json
            ? {
                mode: 'raw',
                raw: r.body_json,
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              }
            : undefined,
        },
      };
    }),
  };

  return JSON.stringify(postmanObj, null, 2);
}
