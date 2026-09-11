# Telegram Bot Setup Guide

This guide walks you through setting up your Telegram bot for RestPocket.

## 1. Create Your Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Start a conversation and send the `/newbot` command.
3. Choose a display name for your bot (for example, `RestPocket Local`).
4. Choose a unique username ending in `bot` (for example, `my_restpocket_bot`).
5. BotFather will provide an HTTP API access token. Copy this value.

## 2. Configure Local Environment

1. Open your `.env` file in the project root:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```
2. The backend server automatically uses this token to start long polling and validate Mini App authentication payloads.

## 3. Configure the Mini App Menu Button

To allow opening RestPocket with one tap from the chat window:

1. Send `/setmenubutton` to BotFather.
2. Select the bot you created.
3. Provide the title for the button (for example, `RestPocket`).
4. Provide the URL where your web application is accessible:
   - For public hosting: `https://your-domain.com`
   - For local development with tunnel: `https://<your-ngrok-or-cloudflared-url>`

## 4. Testing Without a Domain (Standalone Mode)

If you only want to test locally on your computer:
1. You can leave `TELEGRAM_BOT_TOKEN` empty or set to any mock string.
2. Run the frontend with `npm run dev` in `web/`.
3. Open `http://localhost:5173` in any browser.
4. RestPocket automatically detects that it is running outside Telegram and provides an embedded mockup environment with full functionality.
