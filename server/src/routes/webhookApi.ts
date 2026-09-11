import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { db } from '../db/database.js';

export async function webhookApiRoutes(fastify: FastifyInstance): Promise<void> {
  // Create a new webhook bin
  fastify.post('/api/bin/create', async (req: FastifyRequest, reply: FastifyReply) => {
    const binId = 'bin_' + crypto.randomBytes(4).toString('hex');
    return reply.status(201).send({
      binId,
      endpointUrl: `/api/bin/${binId}`,
      createdAt: new Date().toISOString(),
    });
  });

  // Get captured events for a bin
  fastify.get('/api/bin/:binId/events', async (req: FastifyRequest, reply: FastifyReply) => {
    const { binId } = req.params as { binId: string };
    const events = db.getWebhookEvents(binId);
    return reply.send(events);
  });

  // Clear events for a bin
  fastify.delete('/api/bin/:binId/events', async (req: FastifyRequest, reply: FastifyReply) => {
    const { binId } = req.params as { binId: string };
    const cleared = db.clearWebhookEvents(binId);
    return reply.send({ success: cleared });
  });

  // Catch-all handler for incoming webhooks on /api/bin/:binId
  const handleIncomingWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const { binId } = req.params as { binId: string };
    const method = req.method;
    const path = req.url;
    const headers = req.headers;
    const query = (req.query as Record<string, any>) || {};

    let bodyRaw: string | undefined;
    if (req.body) {
      bodyRaw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
    }

    const recorded = db.saveWebhookEvent(binId, method, path, headers, query, bodyRaw);

    return reply.status(200).send({
      status: 'received',
      binId,
      eventId: recorded.id,
      timestamp: recorded.created_at,
    });
  };

  // Support all HTTP methods for incoming webhooks
  const methods: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'> = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ];

  fastify.route({
    method: methods,
    url: '/api/bin/:binId',
    handler: handleIncomingWebhook,
  });

  fastify.route({
    method: methods,
    url: '/api/bin/:binId/*',
    handler: handleIncomingWebhook,
  });
}
