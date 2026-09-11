import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractAuthContext } from '../security/auth.js';
import { db } from '../db/database.js';

export async function historyApiRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/history
  fastify.get('/api/history', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const query = req.query as { limit?: string };
    const limit = query.limit ? Math.min(parseInt(query.limit, 10), 200) : 50;

    const history = db.getHistory(auth.userId, limit);
    return reply.send(history);
  });

  // DELETE /api/history
  fastify.delete('/api/history', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const cleared = db.clearHistory(auth.userId);
    return reply.send({ success: cleared });
  });
}
