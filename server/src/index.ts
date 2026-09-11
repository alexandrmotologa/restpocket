import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { config } from './config.js';
import { seedDefaultCollections } from './db/seed.js';
import { executeApiRoutes } from './routes/executeApi.js';
import { collectionsApiRoutes } from './routes/collectionsApi.js';
import { historyApiRoutes } from './routes/historyApi.js';
import { initTelegramBot, stopTelegramBot } from './bot/bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const fastify = Fastify({
    logger: {
      level: config.isDev ? 'info' : 'warn',
    },
  });

  // Enable CORS for development frontend
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
  });

  // Initialize and seed database
  try {
    seedDefaultCollections();
    fastify.log.info('Database initialized with default collections.');
  } catch (err: any) {
    fastify.log.error({ err }, 'Database initialization failed');
  }

  // Register API routes
  await fastify.register(executeApiRoutes);
  await fastify.register(collectionsApiRoutes);
  await fastify.register(historyApiRoutes);

  // Health check endpoint
  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'restpocket-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  // Serve static assets if web/dist exists (production mode)
  const webDistPath = path.resolve(__dirname, '../../web/dist');
  if (fs.existsSync(webDistPath)) {
    await fastify.register(fastifyStatic, {
      root: webDistPath,
      prefix: '/',
    });

    // Fallback for SPA client-side routing
    fastify.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'NOT_FOUND', message: 'API endpoint not found' });
      }
      return reply.sendFile('index.html');
    });
  } else {
    fastify.get('/', async (req, reply) => {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head><title>RestPocket API Server</title></head>
          <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
            <h1>⚡ RestPocket Backend Server</h1>
            <p>API Server is running on port ${config.port}.</p>
            <p>Run <code>npm run dev</code> inside <code>web/</code> to launch the frontend, or build with <code>npm run build</code> in <code>web/</code> for production static hosting.</p>
            <p><a href="/api/health" style="color: #38bdf8;">/api/health</a> | <a href="/api/collections" style="color: #38bdf8;">/api/collections</a></p>
          </body>
        </html>
      `);
    });
  }

  // Initialize Telegram Bot
  initTelegramBot();

  // Start HTTP Server
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`\n🚀 RestPocket Server listening at http://${config.host}:${config.port}`);
  } catch (err: any) {
    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down RestPocket server...');
    stopTelegramBot();
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
