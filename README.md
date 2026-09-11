# RestPocket

RestPocket is a self-contained HTTP client and Telegram Mini App. It lets you send REST requests, inspect responses, organize collections, and debug APIs directly from your phone through Telegram, or inside any desktop browser.

The server uses Telegram long polling by default. You can run it on your local machine or a home server without configuring public domains, reverse proxies, or SSL certificates.

## Capabilities

- HTTP request runner supporting GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS.
- High-resolution timing metrics measuring round-trip latency and payload transfer sizes.
- Response viewer with formatted JSON tree view, search filter, raw text mode, and header tables.
- Pre-seeded and custom request collections (HTTPBin, GitHub Public API, JSONPlaceholder).
- Request history tracking with status codes and quick replay.
- Environment variables support with `{{variableName}}` syntax for URLs, headers, and request bodies.
- cURL command parser to import requests from copied curl strings.
- Code snippet generator exporting to cURL, JavaScript Fetch, Python requests, and Go net/http.
- Server-side request forgery (SSRF) guard blocking access to loopback, private subnets, and cloud metadata endpoints.
- Full local development mode that mocks Telegram WebApp APIs when loaded outside the Telegram client.

## Architecture

RestPocket consists of two primary components:

1. **Backend Server (`server/`):** Fastify server written in TypeScript. Dispatches HTTP requests through Undici, runs a grammY Telegram bot via long polling, manages SQLite persistence, and enforces SSRF restrictions.
2. **Web Client (`web/`):** Single-page application built with React 19, Vite, and Tailwind CSS. Interfaces with the Telegram WebApp SDK to provide native haptic feedback and match Telegram color themes.

More details on data flow and security controls are available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting Started

### Prerequisites

- Node.js 22 or newer (Node.js 24 recommended for built-in SQLite support)
- npm 10 or newer
- Telegram account and bot token from [@BotFather](https://t.me/BotFather) (optional for local browser testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alexandrmotologa/restpocket.git
   cd restpocket
   ```

2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies for both server and web frontend:
   ```bash
   cd server && npm install
   cd ../web && npm install
   cd ..
   ```

### Running in Development Mode

You can run the server and client concurrently or independently.

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend development server:
```bash
cd web
npm run dev
```

The web client will be accessible at `http://localhost:5173`. When loaded directly in your browser, it runs in simulated Telegram mode so you can test all features without opening the Telegram app.

### Running in Production Mode

Build both workspaces and start the unified Fastify server:

```bash
# Build the frontend bundle
cd web
npm run build

# Build and launch the server
cd ../server
npm run build
npm start
```

The server serves the compiled frontend assets from `web/dist` on port `8080`.

## Telegram Setup

To access RestPocket inside Telegram:

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Create a new bot with `/newbot` and save the token to `TELEGRAM_BOT_TOKEN` in your `.env` file.
3. Configure the Mini App menu button:
   - Run `/setmenubutton` in BotFather.
   - Select your bot.
   - Set the URL to your hosted server or local tunnel URL (such as Cloudflare Tunnel or ngrok if testing from a mobile device).
4. For detailed step-by-step instructions, see [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md).

## Running with Docker

You can run RestPocket with Docker and Docker Compose without installing Node.js locally:

```bash
docker compose up -d --build
```

The service will be available on port `8080`. SQLite database records persist in the `restpocket_data` Docker volume.

## Security Considerations

RestPocket dispatches HTTP requests from the host server on behalf of the user. To prevent misuse:

- Private IP ranges (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback addresses (`127.0.0.0/8`), and cloud metadata services (`169.254.169.254`) are blocked by default.
- Hostnames undergo DNS resolution before execution to prevent DNS rebinding bypasses.
- To permit requests to local services during development, set `ALLOW_PRIVATE_NETWORK=true` in your `.env` file.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
