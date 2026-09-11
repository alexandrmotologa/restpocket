import crypto from 'node:crypto';
import { config } from '../config.js';

export interface TelegramUser {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface AuthContext {
  userId: string;
  user?: TelegramUser;
  isAuthenticated: boolean;
}

/**
 * Validates the raw Telegram WebApp initData string against the bot token.
 * Uses the WebApp validation algorithm:
 * HMAC-SHA256 of initData with secret key = HMAC-SHA256(botToken, "WebAppData")
 */
export function validateTelegramInitData(initDataString: string, botToken: string): AuthContext {
  if (!initDataString || !botToken) {
    return { userId: 'guest', isAuthenticated: false };
  }

  try {
    const params = new URLSearchParams(initDataString);
    const hash = params.get('hash');
    if (!hash) {
      return { userId: 'guest', isAuthenticated: false };
    }

    params.delete('hash');

    // Sort keys alphabetically and format as key=value\n
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}=${val}`)
      .join('\n');

    // Secret key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculated hash = HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return { userId: 'guest', isAuthenticated: false };
    }

    // Parse user object
    let user: TelegramUser | undefined;
    const userJson = params.get('user');
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        // Ignored
      }
    }

    const userId = user?.id ? String(user.id) : 'guest';
    return {
      userId,
      user,
      isAuthenticated: true,
    };
  } catch {
    return { userId: 'guest', isAuthenticated: false };
  }
}

/**
 * Extracts authentication context from incoming Fastify request.
 */
export function extractAuthContext(rawInitData?: string): AuthContext {
  if (!rawInitData) {
    return { userId: 'guest', isAuthenticated: false };
  }

  return validateTelegramInitData(rawInitData, config.telegramBotToken);
}
