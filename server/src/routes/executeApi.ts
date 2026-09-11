import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { executeHttpRequest, ExecutePayload } from '../proxy/executor.js';
import { parseCurlCommand } from '../proxy/curlParser.js';
import { extractAuthContext } from '../security/auth.js';
import { db } from '../db/database.js';
import { config } from '../config.js';

export async function executeApiRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /api/execute
  fastify.post('/api/execute', async (req: FastifyRequest, reply: FastifyReply) => {
    const rawInitData = req.headers['x-telegram-init-data'] as string | undefined;
    const auth = extractAuthContext(rawInitData);

    const payload = req.body as ExecutePayload;
    if (!payload || !payload.url || !payload.method) {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'The fields "method" and "url" are required.',
      });
    }

    try {
      const result = await executeHttpRequest(payload, config.allowPrivateNetwork);

      // Record to history
      try {
        db.addHistory(
          auth.userId,
          payload.method,
          payload.url,
          result.status,
          result.latencyMs,
          result.sizeBytes
        );
      } catch (dbErr: any) {
        req.log.warn({ err: dbErr }, 'Failed to record history entry');
      }

      return reply.send(result);
    } catch (error: any) {
      if (error.message && error.message.startsWith('SSRF_BLOCKED')) {
        return reply.status(403).send({
          error: 'SSRF_BLOCKED',
          message: error.message,
        });
      }

      return reply.status(502).send({
        error: 'REQUEST_FAILED',
        message: error.message || 'Failed to dispatch request to destination host',
        latencyMs: error.latencyMs || 0,
      });
    }
  });

  // POST /api/parse-curl
  fastify.post('/api/parse-curl', async (req: FastifyRequest, reply: FastifyReply) => {
    const { curl } = req.body as { curl?: string };
    if (!curl || typeof curl !== 'string') {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'The "curl" string field is required.',
      });
    }

    try {
      const parsed = parseCurlCommand(curl);
      return reply.send(parsed);
    } catch (error: any) {
      return reply.status(400).send({
        error: 'PARSE_FAILED',
        message: `Failed to parse cURL command: ${error.message}`,
      });
    }
  });
}
