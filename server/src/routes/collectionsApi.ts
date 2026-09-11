import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractAuthContext } from '../security/auth.js';
import { db } from '../db/database.js';

export async function collectionsApiRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/collections
  fastify.get('/api/collections', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const collections = db.getCollections(auth.userId);
    return reply.send(collections);
  });

  // POST /api/collections
  fastify.post('/api/collections', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const { name } = req.body as { name?: string };

    if (!name || typeof name !== 'string' || !name.trim()) {
      return reply.status(400).send({
        error: 'INVALID_NAME',
        message: 'Collection name is required.',
      });
    }

    const created = db.createCollection(name.trim(), auth.userId);
    return reply.status(201).send(created);
  });

  // DELETE /api/collections/:id
  fastify.delete('/api/collections/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const { id } = req.params as { id: string };
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return reply.status(400).send({ error: 'INVALID_ID', message: 'Collection ID must be a number.' });
    }

    const deleted = db.deleteCollection(numId, auth.userId);
    if (!deleted) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Collection not found or access denied.' });
    }

    return reply.send({ success: true, id: numId });
  });

  // POST /api/collections/:id/requests
  fastify.post('/api/collections/:id/requests', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return reply.status(400).send({ error: 'INVALID_ID', message: 'Collection ID must be a number.' });
    }

    const body = req.body as {
      name: string;
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: string;
    };

    if (!body.name || !body.method || !body.url) {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'Fields "name", "method", and "url" are required.',
      });
    }

    const saved = db.saveRequest(
      numId,
      body.name,
      body.method.toUpperCase(),
      body.url,
      body.headers || {},
      body.body
    );

    return reply.status(201).send(saved);
  });

  // DELETE /api/saved-requests/:id
  fastify.delete('/api/saved-requests/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return reply.status(400).send({ error: 'INVALID_ID', message: 'Request ID must be a number.' });
    }

    const deleted = db.deleteSavedRequest(numId);
    return reply.send({ success: deleted, id: numId });
  });

  // GET /api/environments
  fastify.get('/api/environments', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const envs = db.getEnvironments(auth.userId);
    return reply.send(envs);
  });

  // POST /api/environments
  fastify.post('/api/environments', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = extractAuthContext(req.headers['x-telegram-init-data'] as string | undefined);
    const { name, variables, isActive = 0 } = req.body as {
      name: string;
      variables: Record<string, string>;
      isActive?: number;
    };

    if (!name || typeof name !== 'string') {
      return reply.status(400).send({ error: 'INVALID_NAME', message: 'Environment name is required.' });
    }

    const saved = db.saveEnvironment(name.trim(), variables || {}, isActive, auth.userId);
    return reply.status(201).send(saved);
  });
}
