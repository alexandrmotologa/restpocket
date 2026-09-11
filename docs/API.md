# RestPocket API Documentation

This document describes the HTTP endpoints exposed by the RestPocket backend service on port 8080.

## Authentication

Requests initiated from the Telegram Mini App include the raw `initData` string in the `X-Telegram-Init-Data` header.

The backend validates the HMAC-SHA256 signature using the configured `TELEGRAM_BOT_TOKEN`. When running in local development mode or when `NODE_ENV=development`, unauthenticated requests are permitted and assigned to a default guest session.

## Endpoints

### 1. Request Execution

#### POST /api/execute

Executes an outbound HTTP request on behalf of the client and returns status, headers, body, and timing metrics.

**Request Body:**

```json
{
  "method": "POST",
  "url": "https://httpbin.org/post",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer sample-token"
  },
  "body": "{\"message\":\"hello\"}",
  "timeoutMs": 15000
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | String | Yes | HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) |
| `url` | String | Yes | Absolute destination URL starting with http:// or https:// |
| `headers` | Object | No | Key-value mapping of request headers |
| `body` | String | No | Request body payload |
| `timeoutMs` | Number | No | Request timeout in milliseconds (default: 15000) |

**Success Response (200 OK):**

```json
{
  "status": 200,
  "statusText": "OK",
  "latencyMs": 142.6,
  "sizeBytes": 482,
  "headers": {
    "content-type": "application/json",
    "date": "Fri, 12 Sep 2026 01:00:00 GMT"
  },
  "data": {
    "args": {},
    "data": "{\"message\":\"hello\"}",
    "headers": {
      "Content-Type": "application/json"
    },
    "json": {
      "message": "hello"
    },
    "origin": "203.0.113.1",
    "url": "https://httpbin.org/post"
  },
  "isBinary": false
}
```

**Error Response (403 Forbidden - SSRF Protection):**

```json
{
  "error": "SSRF_BLOCKED",
  "message": "Requests to private networks and loopback addresses are blocked."
}
```

---

### 2. cURL Parser

#### POST /api/parse-curl

Parses a raw cURL command into a structured JSON request definition.

**Request Body:**

```json
{
  "curl": "curl -X POST https://api.example.com/items -H 'Content-Type: application/json' -d '{\"name\":\"widget\"}'"
}
```

**Success Response (200 OK):**

```json
{
  "method": "POST",
  "url": "https://api.example.com/items",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"widget\"}"
}
```

---

### 3. Collections

#### GET /api/collections

Lists all collections and their child requests.

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "HTTPBin Playground",
    "createdAt": "2026-09-12T00:00:00.000Z",
    "requests": [
      {
        "id": 1,
        "collectionId": 1,
        "name": "Get IP Details",
        "method": "GET",
        "url": "https://httpbin.org/get",
        "headers": {},
        "body": null
      }
    ]
  }
]
```

#### POST /api/collections

Creates a new collection.

**Request Body:**

```json
{
  "name": "Payment API Tests"
}
```

#### POST /api/collections/:id/requests

Saves a request definition into an existing collection.

**Request Body:**

```json
{
  "name": "Create Charge",
  "method": "POST",
  "url": "https://api.example.com/charges",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"amount\": 1000}"
}
```

#### DELETE /api/collections/:id

Deletes a collection and its associated requests.

---

### 4. History

#### GET /api/history

Retrieves recent execution history records.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, maximum: 200).

**Success Response (200 OK):**

```json
[
  {
    "id": 10,
    "method": "GET",
    "url": "https://httpbin.org/status/418",
    "statusCode": 418,
    "latencyMs": 85.3,
    "createdAt": "2026-09-12T00:15:30.000Z"
  }
]
```

#### DELETE /api/history

Clears execution history records.
