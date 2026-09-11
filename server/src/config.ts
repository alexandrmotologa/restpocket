import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env from project root or server dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/restpocket.db'),
  allowPrivateNetwork: process.env.ALLOW_PRIVATE_NETWORK === 'true',
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
};
