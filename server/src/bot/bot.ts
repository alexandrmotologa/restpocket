import { Bot, InlineKeyboard } from 'grammy';
import { config } from '../config.js';
import { parseCurlCommand } from '../proxy/curlParser.js';
import { db } from '../db/database.js';

let botInstance: Bot | null = null;

export function getTelegramBot(): Bot | null {
  return botInstance;
}

export function initTelegramBot(): Bot | null {
  if (!config.telegramBotToken || config.telegramBotToken === 'your_telegram_bot_token_here') {
    console.log('[Bot] TELEGRAM_BOT_TOKEN not configured. Running in standalone browser mode.');
    return null;
  }

  try {
    const bot = new Bot(config.telegramBotToken);
    botInstance = bot;

    // Command: /start
    bot.command('start', async (ctx) => {
      const appUrl = `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`;
      const keyboard = new InlineKeyboard().webApp('⚡ Open RestPocket', appUrl);

      await ctx.reply(
        'Welcome to *RestPocket*!\n\n' +
          'RestPocket is your mobile REST client. You can test endpoints, run HTTP requests, ' +
          'and organize collections directly from Telegram.\n\n' +
          'Tap the button below to launch the Mini App:',
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );
    });

    // Command: /help
    bot.command('help', async (ctx) => {
      await ctx.reply(
        '*RestPocket Commands:*\n\n' +
          '• /start - Open the RestPocket Mini App\n' +
          '• /curl `<command>` - Parse and inspect a cURL command\n' +
          '• /history - View your latest 5 executed requests\n' +
          '• /help - Show this manual\n\n' +
          '_Example:_\n`/curl curl -X POST https://httpbin.org/post -d "hello"`',
        { parse_mode: 'Markdown' }
      );
    });

    // Command: /curl
    bot.command('curl', async (ctx) => {
      const rawText = ctx.match;
      if (!rawText || !rawText.trim()) {
        await ctx.reply('Please provide a cURL command. Example:\n`/curl curl -X GET https://httpbin.org/get`', {
          parse_mode: 'Markdown',
        });
        return;
      }

      try {
        const parsed = parseCurlCommand(rawText);
        const headersFormatted = Object.entries(parsed.headers)
          .map(([k, v]) => `  • ${k}: ${v}`)
          .join('\n') || '  (none)';

        await ctx.reply(
          `*Parsed cURL Request:*\n\n` +
            `*Method:* \`${parsed.method}\`\n` +
            `*URL:* \`${parsed.url}\`\n` +
            `*Headers:*\n${headersFormatted}\n` +
            (parsed.body ? `*Body:*\n\`\`\`\n${parsed.body}\n\`\`\`` : ''),
          { parse_mode: 'Markdown' }
        );
      } catch (err: any) {
        await ctx.reply(`Failed to parse cURL command: ${err.message}`);
      }
    });

    // Command: /history
    bot.command('history', async (ctx) => {
      const userId = ctx.from?.id ? String(ctx.from.id) : 'guest';
      const history = db.getHistory(userId, 5);

      if (history.length === 0) {
        await ctx.reply('No requests recorded yet. Open the Mini App to start testing APIs.');
        return;
      }

      const formatted = history
        .map((h) => {
          const statusIcon = h.status_code >= 200 && h.status_code < 300 ? '🟢' : '🔴';
          return `${statusIcon} *${h.method}* \`${h.url}\`\n   Status: ${h.status_code} (${h.latency_ms}ms)`;
        })
        .join('\n\n');

      await ctx.reply(`*Recent Requests:*\n\n${formatted}`, { parse_mode: 'Markdown' });
    });

    // Inline Queries (@restpocket_bot <method> <url>)
    bot.on('inline_query', async (ctx) => {
      const query = ctx.inlineQuery.query.trim();
      if (!query) {
        await ctx.answerInlineQuery([
          {
            type: 'article',
            id: 'help',
            title: '⚡ RestPocket API Runner',
            description: 'Type a URL to test and share: @restpocket_bot https://httpbin.org/get',
            input_message_content: {
              message_text: 'Open RestPocket to test and inspect HTTP APIs on mobile.',
            },
          },
        ]);
        return;
      }

      let method = 'GET';
      let url = query;
      const parts = query.split(/\s+/);
      if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'].includes(parts[0].toUpperCase())) {
        method = parts[0].toUpperCase();
        url = parts.slice(1).join(' ');
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await ctx.answerInlineQuery(
        [
          {
            type: 'article',
            id: 'exec_request',
            title: `⚡ Execute: ${method} ${url}`,
            description: 'Share this API test card in chat',
            input_message_content: {
              message_text:
                `⚡ *RestPocket Request Card*\n\n` +
                `*Method:* \`${method}\`\n` +
                `*URL:* \`${url}\`\n\n` +
                `_Run or debug this endpoint directly inside RestPocket._`,
              parse_mode: 'Markdown',
            },
          },
        ],
        { cache_time: 10 }
      );
    });

    // Start bot in background with Long Polling
    bot.start({
      onStart: (botInfo) => {
        console.log(`[Bot] Telegram bot @${botInfo.username} started in Long Polling mode.`);
      },
    }).catch((err) => {
      console.error('[Bot] Long Polling error:', err.message);
    });

    return bot;
  } catch (err: any) {
    console.error('[Bot] Failed to initialize grammY bot:', err.message);
    return null;
  }
}

export function stopTelegramBot(): void {
  if (botInstance) {
    botInstance.stop();
    botInstance = null;
  }
}
