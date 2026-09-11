import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractAuthContext } from '../security/auth.js';
import { db } from '../db/database.js';

export async function monitorsApiRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/monitors
  fastify.get('/api/monitors', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const monitors = db.getMonitors(auth.userId);
    return reply.send(monitors);
  });

  // POST /api/monitors
  fastify.post('/api/monitors', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const { name, method = 'GET', url, intervalMinutes = 15, expectedStatus = 200 } = req.body as {
      name: string;
      method?: string;
      url: string;
      intervalMinutes?: number;
      expectedStatus?: number;
    };

    if (!name || !url) {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'Fields "name" and "url" are required.',
      });
    }

    const created = db.createMonitor(
      auth.userId,
      name.trim(),
      method.toUpperCase(),
      url.trim(),
      intervalMinutes,
      expectedStatus
    );

    return reply.status(201).send(created);
  });

  // DELETE /api/monitors/:id
  fastify.delete('/api/monitors/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const { id } = req.params as { id: string };
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return reply.status(400).send({ error: 'INVALID_ID', message: 'Monitor ID must be a number.' });
    }

    const deleted = db.deleteMonitor(numId, auth.userId);
    return reply.send({ success: deleted, id: numId });
  });
}
