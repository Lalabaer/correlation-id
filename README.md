# correlation-id

Configurable correlation IDs for Node.js and the browser. Zero runtime dependencies.

The package validates inbound IDs, generates time-ordered UUIDv7 IDs, keeps the current ID in `AsyncLocalStorage` (Node), and propagates it over HTTP, `fetch`, Axios, and Kafka. Adapters for `node:http`, Express/Connect, Fastify, and WHATWG Request handlers (Next.js route handlers) are included.

```
client ──asdf-correlation-id: demo-123──▶ orders ──asdf-correlation-id: demo-123──▶ payments
                                            │                                         │
                 {"correlation_id":"demo-123",...}               {"correlation_id":"demo-123",...}
```

## Why

A single business operation often touches several services. When it fails, you want every log line from every service for that one operation. A correlation ID is the key that joins them. It is created at the edge, passed along on every hop, and written on every log line.

Within one system, agree on a single header name (for example `asdf-correlation-id`). Different projects can use different names (`qwer-correlation-id`, …). Communicating services must either share the same `headerName` or list each other's names in `fallbackHeaders`; otherwise the link breaks at the system boundary.

## Install

Install straight from GitHub (committed `dist/` — no build step required for consumers):

```bash
yarn add github:<user>/correlation-id#v1
# or
npm install github:<user>/correlation-id#v1
```

## Quick start

```ts
import { createCorrelation, expressCorrelation, correlationFetch } from 'correlation-id'

const correlation = createCorrelation({
    headerName: 'asdf-correlation-id', // validated RFC 9110 token; lowercased
    fallbackHeaders: ['x-request-id'], // optional aliases for inbound requests
    // idGenerator: uuidv7,            // default: native randomUUIDv7 when available, else portable fallback
    echoResponseHeader: true, // default
})

app.use(expressCorrelation(correlation))

const fetch = correlationFetch(correlation)
```

## Rules

1. **Inbound IDs are untrusted.** An ID is accepted only if it has 1–128 characters from `[A-Za-z0-9._:-]`. Anything else is discarded and replaced with a new ID (blocks log injection and oversized headers).
2. **Header priority:** configured `headerName`, then each `fallbackHeaders` entry, then a newly generated ID.
3. **Header names are validated** as RFC 9110 tokens (`asdf-correlation-id` is fine; spaces and colons are not). Invalid config throws `TypeError` at creation time.
4. **UUIDv7 for new IDs.** Uses `crypto.randomUUIDv7()` when available (Node >= 24.16 / 26.1); otherwise a portable RFC 9562 implementation based on `crypto.getRandomValues`.
5. **Outgoing adapters never overwrite** an explicit correlation header. Priority: explicit header > current context > newly generated ID.
6. **The ID is echoed** in the response header by default (`echoResponseHeader: false` to disable).

## Usage

### Express / Connect

```ts
import express from 'express'
import { createCorrelation, expressCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
const app = express()
app.use(expressCorrelation(correlation))

app.get('/orders/:id', (_req, res) => {
    res.json({ correlationId: correlation.current() })
})
```

### Fastify

```ts
import Fastify from 'fastify'
import { createCorrelation, fastifyCorrelation } from 'correlation-id'

declare module 'fastify' {
    interface FastifyRequest {
        correlationId: string
    }
}

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
const app = Fastify()
await app.register(fastifyCorrelation(correlation))

app.get('/orders/:id', async (request) => ({
    fromRequest: request.correlationId,
    fromContext: correlation.current(),
}))
```

### node:http

```ts
import http from 'node:http'
import { createCorrelation, withCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })

http.createServer(
    withCorrelation(correlation, (req, res) => {
        res.end(correlation.current())
    }),
).listen(3000)
```

### Next.js (App Router)

Wrap route handlers:

```ts
// app/api/orders/route.ts
import { createCorrelation, withWebCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })

export const GET = withWebCorrelation(correlation, async (request) => {
    return Response.json({ id: correlation.current() })
})
```

For Server Components / Server Actions, ensure the header exists on the incoming request via middleware, then resolve it anywhere:

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })

export function middleware(request: NextRequest) {
    const id = correlation.resolve(request.headers)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(correlation.headerName, id)

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set(correlation.headerName, id)
    return response
}
```

```ts
// any server component / action
import { headers } from 'next/headers'
import { createCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
const id = correlation.resolve(await headers())
```

### fetch

```ts
import { createCorrelation, correlationFetch } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
const fetch = correlationFetch(correlation)

await fetch('http://payments/charges', { method: 'POST' })
// header added automatically from context, or a new UUIDv7 if none
```

### Axios

```ts
import axios from 'axios'
import { attachCorrelation, createCorrelation } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
const client = axios.create({ baseURL: 'http://payments' })
attachCorrelation(correlation, client)

await client.post('/charges', body)
```

### Kafka

```ts
import { createCorrelation, kafkaHeaders, withKafkaMessage } from 'correlation-id'

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })

// Producer
await producer.send({
    topic: 'orders',
    messages: [{ value, headers: kafkaHeaders(correlation) }],
})

// Consumer (Buffer header values are decoded automatically)
await consumer.run({
    eachMessage: withKafkaMessage(correlation, async ({ message }) => {
        // correlation.current() is set for the duration of this handler
        await handle(message)
    }),
})
```

### React frontend (browser)

Use the browser entry. There is no AsyncLocalStorage; each outgoing request gets a fresh ID unless you set the header yourself.

```ts
// src/api-client.ts
import { attachCorrelation, correlationFetch, createCorrelation } from 'correlation-id/browser'
// or: import { ... } from 'correlation-id'  (bundlers resolve the "browser" export condition)

const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })

export const apiFetch = correlationFetch(correlation)
export const api = attachCorrelation(correlation, axios.create({ baseURL: '/api' }))
```

Enable CORS for your custom header on the API:

```
Access-Control-Allow-Headers: asdf-correlation-id
Access-Control-Expose-Headers: asdf-correlation-id
```

### Logging

```ts
const log = createLogger({
    service: 'orders',
    context: () => {
        const id = correlation.current()
        return id === undefined ? undefined : { correlation_id: id }
    },
})
```

## API

| Export                                                 | Description                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `createCorrelation(config?)`                           | Create an instance (Node entry uses AsyncLocalStorage; browser entry does not) |
| `expressCorrelation(correlation)`                      | Express / Connect middleware                                                   |
| `fastifyCorrelation(correlation)`                      | Fastify plugin                                                                 |
| `withCorrelation(correlation, handler)`                | Wrap a `node:http` handler                                                     |
| `withWebCorrelation(correlation, handler)`             | Wrap a WHATWG `Request` → `Response` handler                                   |
| `correlationFetch(correlation, fetch?)`                | `fetch` that adds the current / generated ID                                   |
| `attachCorrelation(correlation, axios)`                | Axios request interceptor                                                      |
| `kafkaHeaders(correlation, id?)`                       | Outgoing message headers                                                       |
| `withKafkaMessage(correlation, handler)`               | kafkajs-style `eachMessage` wrapper                                            |
| `uuidv7()` / `isValidCorrelationId(value)`             | Primitives                                                                     |
| `isValidHeaderName(value)` / `assertHeaderName(value)` | Header name validation                                                         |

### `createCorrelation` options

| Option               | Default            | Description                                 |
| -------------------- | ------------------ | ------------------------------------------- |
| `headerName`         | `x-correlation-id` | Primary header (RFC 9110 token, lowercased) |
| `fallbackHeaders`    | `['x-request-id']` | Extra inbound names, in priority order      |
| `idGenerator`        | UUIDv7             | Custom generator                            |
| `echoResponseHeader` | `true`             | Echo ID on HTTP responses                   |

### Instance methods

| Method              | Description                               |
| ------------------- | ----------------------------------------- |
| `resolve(headers?)` | Valid inbound ID or a newly generated one |
| `current()`         | ID from AsyncLocalStorage, or `undefined` |
| `run(id, fn)`       | Run `fn` with `id` as the current ID      |
| `headers(id?)`      | `{ [headerName]: id }` for outgoing calls |
| `generate()`        | Create a new ID                           |

## Development

```bash
yarn install
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn build          # rebuild dist/ — commit the result before tagging
```

Release checklist: bump version if needed, run `yarn build`, commit `dist/`, tag `v1` (or `v1.x.y`).

## Acknowledgements

The correlation-id validation, UUIDv7 layout, AsyncLocalStorage context, and the HTTP, Fastify, and fetch adapters are derived from [pk-correlation-id](https://github.com/L1k4Root/pk-correlation-id) by Andres (L1k4Root), which is also MIT licensed.

## License

MIT
