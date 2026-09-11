# RestPocket Architecture

This document describes the design, components, and data flow of RestPocket.

## System Overview

RestPocket functions as a developer utility that bridges the Telegram Mini App environment with a high-performance backend proxy. Running HTTP requests through the server proxy eliminates cross-origin resource sharing (CORS) restrictions that browsers otherwise impose on frontend clients.

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|                                                             |
|   Telegram Mobile App / Desktop App / Standalone Browser    |
|                             |                               |
|                     React 19 Mini App                       |
|           (Tailwind CSS, Lucide, @twa-dev/sdk)              |
+-----------------------------+-------------------------------+
                              | HTTP / JSON
                              v
+-------------------------------------------------------------+
|                      Server Layer                           |
|                                                             |
|   Fastify HTTP Server (TypeScript, Port 8080)               |
|     |-- Static file handler (web/dist in production)        |
|     |-- Security & Auth (Telegram initData validation)      |
|     |-- Request Controller (POST /api/execute)              |
|     |     |                                                 |
|     |     +--> SSRF Guard (DNS resolution & IP validation)  |
|     |     +--> Undici HTTP Dispatcher (hrtime metrics)      |
|     |                                                       |
|     |-- Collection & History API (CRUD)                     |
|     +-- SQLite Storage (node:sqlite, zero native deps)      |
|                                                             |
|   grammY Telegram Bot Runner (Long Polling)                 |
|     |-- /start command (WebApp launch button)               |
|     |-- /curl command (parse and launch Mini App)           |
|     +-- /history command (view recent queries)              |
+-----------------------------+-------------------------------+
                              |
                              v External Target
+-------------------------------------------------------------+
|                  External REST APIs                         |
|           (HTTPBin, GitHub, JSONPlaceholder, etc.)          |
+-------------------------------------------------------------+
```

## Core Components

### 1. HTTP Request Dispatcher

Located in `server/src/proxy/executor.ts`, the dispatcher receives request specifications containing:
- HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Target URL
- Custom headers map
- Request body (string or serialized JSON)
- Request timeout (default: 15 seconds)

Key operational details:
- **Round-trip Measurement:** The dispatcher samples timestamps using `process.hrtime.bigint()` immediately before dispatching the request with `undici.request` and immediately after receiving the response headers and initial payload chunk. This yields microsecond resolution converted to milliseconds.
- **Payload Handling:** Text and JSON responses are returned directly. Binary responses (such as images, PDFs, or raw buffers) are encoded into base64 strings with their corresponding MIME types.
- **Size Calculation:** Computes payload size in bytes from the returned body stream.

### 2. SSRF Protection Layer

Located in `server/src/proxy/guard.ts`, the SSRF protection guard prevents requests to internal systems.

Verification steps before execution:
1. Parse the target protocol (only `http:` and `https:` are permitted).
2. Resolve the target hostname using Node.js `dns.promises.lookup()`.
3. Check the resolved IP address against blocked IP ranges:
   - Loopback addresses (`127.0.0.0/8`, `::1`)
   - RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Link-local and cloud metadata addresses (`169.254.0.0/16`)
   - Broadcast and unspecified addresses (`0.0.0.0`, `255.255.255.255`)
4. Reject the request with an explicit error code if any address matches, unless the `ALLOW_PRIVATE_NETWORK` configuration is explicitly set to `true`.

### 3. Database and Storage

Located in `server/src/db/database.ts`, the database layer uses the native Node.js SQLite module (`node:sqlite`). This eliminates the requirement for Python or C++ compilers during installation on Windows, macOS, or Linux.

Tables:
- `collections`: Groups of saved requests organized by folder name.
- `saved_requests`: Detailed request templates including method, URL, headers, and request body.
- `history`: Sequential log of past executions with response codes and latency.
- `environments`: Key-value configuration pairs for parameter substitution.

### 4. Telegram Bot and Long Polling

Located in `server/src/bot/bot.ts`, the bot runs via grammY using standard long polling (`getUpdates`).
- No public webhooks or SSL certificates are needed to receive incoming commands.
- The `/start` command returns an inline keyboard with a `web_app` button linking to the hosted client.
- The `/curl` command parses incoming cURL commands, writes them to a temporary record, and yields a Mini App launch button with preloaded configuration.

### 5. Frontend Client

Located in `web/`, the client is a React 19 single-page application bundled with Vite.
- **Telegram WebApp Integration:** Reads Telegram color scheme parameters (background color, text color, button color) and binds them to CSS variables. Triggers haptic feedback on user actions.
- **Browser Fallback:** Detects when `window.Telegram?.WebApp?.initData` is empty and substitutes a complete mock implementation, allowing full local UI testing without Telegram.
- **Collapsible JSON Viewer:** Renders structured response data into an interactive tree with key search, node expansion toggles, and copy buttons.
