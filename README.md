<p align="center">
  <img src="docs/images/logo.png?raw=true" alt="RestPocket Logo" width="130" style="border-radius: 24px;" />
</p>

<h1 align="center">RestPocket</h1>

<p align="center">
  <a href="https://github.com/alexandrmotologa/restpocket/actions"><img src="https://github.com/alexandrmotologa/restpocket/actions/workflows/ci.yml/badge.svg" alt="CI Build Status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22%2B-green.svg" alt="Node.js 22+" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178c6.svg" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19" /></a>
  <a href="https://fastify.dev/"><img src="https://img.shields.io/badge/Fastify-5.2-black.svg" alt="Fastify" /></a>
  <a href="https://core.telegram.org/bots"><img src="https://img.shields.io/badge/Telegram-Mini%20App%20%2B%20Bot-blue.svg" alt="Telegram Mini App & Bot" /></a>
</p>

<p align="center">
  <strong>Self-contained HTTP client and Telegram Mini App for testing, inspecting, and automating REST APIs on mobile and desktop.</strong>
</p>

<p align="center">
  <a href="#demo">Live Demo</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#capabilities">Capabilities</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#telegram-setup">Telegram Setup</a> •
  <a href="LICENSE">License</a>
</p>

---

## Demo

<p align="center">
  <img src="docs/images/restpocket_demo.gif?raw=true" alt="RestPocket Live Interactive Demo" width="880" />
</p>

---

## Screenshots

### Desktop Interface
![RestPocket Desktop Interface](docs/images/app_desktop.png?raw=true)

### Mobile Mini App & Webhook Catcher
<p align="center">
  <img src="docs/images/app_mobile.png?raw=true" width="310" alt="RestPocket Mobile Mini App" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/images/webhook_catcher.png?raw=true" width="530" alt="RestPocket Webhook Catcher" />
</p>

### Visual Form-to-JSON Builder
![RestPocket Request & Form Builder](docs/images/request_builder.png?raw=true)

## Capabilities

- **Multi-Method Request Dispatcher:** Execute GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS with custom headers, queries, and bodies.
- **Timing & Payload Telemetry:** High-resolution timing metrics measuring DNS, TLS, and round-trip latency alongside byte transfer sizes.
- **Interactive JSON Tree & Filter:** Formatted JSON viewer with collapsible nodes, real-time key/value search filter, and raw text toggle.
- **Dynamic Variable Replacement:** Built-in tokens like `{{$uuid}}`, `{{$timestamp}}`, `{{$randomInt}}`, and `{{$isoDate}}`, in addition to custom `{{variableName}}` environment tokens.
- **1-Tap Response Chaining:** Extract values from response JSON keys and save them directly into environment variables without manual copying.
- **Visual Form-to-JSON Builder:** Compose structured JSON bodies using key-value rows with type inference (string, number, boolean, null).
- **Embedded Webhook Catcher (RequestBin):** Spin up temporary webhook capture URLs (`/api/bin/:binId`) to inspect incoming webhooks and callback payloads in real time.
- **Automated Health Check Monitors:** Periodically ping critical endpoints and receive Telegram notifications on status regressions.
- **Collections & Pre-seeded Workflows:** Organize requests into custom folders or load built-in templates (HTTPBin, GitHub Public API, JSONPlaceholder).
- **Postman & cURL Interoperability:** Import requests from raw cURL commands, import/export collections in Postman v2.1 format.
- **Multi-Language Code Export:** Generate instant client code for cURL, Fetch (JavaScript/TypeScript), Python `requests`, and Go `net/http`.
- **SSRF Protection Guard:** Enforces validation against RFC 1918 private subnets, loopback interfaces, and cloud metadata services.
- **Telegram Native Integration:** Runs as a Telegram Mini App with haptic feedback, theme synchronization, and inline query support (`@bot <url>`).
- **Zero Public Setup Needed:** Communicates via Telegram long polling, allowing local machines and homelabs to operate without public IP addresses or certificates.

## Architecture

RestPocket consists of two primary components:

1. **Backend Server (`server/`):** Fastify server written in TypeScript. Dispatches HTTP requests through Undici, runs a grammY Telegram bot via long polling, manages SQLite persistence, tracks background monitors, and enforces SSRF restrictions.
2. **Web Client (`web/`):** Single-page application built with React 19, Vite, and Tailwind CSS. Interfaces with the Telegram WebApp SDK to provide native haptic feedback, matching color themes, and response inspection tools.

More details on data flow, database schemas, and security controls are available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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
