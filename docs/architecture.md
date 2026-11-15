# Architecture

Homebarista is a single Next.js 15 app: the same deployment serves the React pages and the JSON API. There is no separate backend service, no WebSocket server, and no paid third-party API. Live updates come from polling every 2.5 seconds.

## System overview

```mermaid
flowchart LR
  subgraph Clients
    Guest["Guest phone<br/>(QR code → /menu)"]
    Customer["Customer<br/>(optional account)"]
    Barista["Barista<br/>(host tablet)"]
  end

  subgraph Vercel["Vercel · Next.js 15 App Router"]
    Pages["Pages & client components<br/>src/app, src/components"]
    MW["middleware.ts<br/>barista route guard"]
    API["Route handlers<br/>src/app/api/**/route.ts"]
    Schemas["Zod schemas<br/>src/lib/schemas"]
    Auth["Auth<br/>src/lib/auth<br/>jose JWT · bcrypt · rate limit"]
    Domain["Domain rules (pure)<br/>src/lib/domain"]
    DB["Queries<br/>src/lib/db (Drizzle)"]
    Docs["OpenAPI + Swagger UI<br/>/api/openapi.json · /api/docs"]
  end

  PG[("Neon PostgreSQL")]

  Guest -- "poll 2.5 s" --> Pages
  Customer --> Pages
  Barista -- "poll 2.5 s" --> Pages
  Pages -- "fetch JSON" --> MW --> API
  API --> Schemas
  API --> Auth
  API --> Domain
  API --> DB --> PG
  Schemas -. "generate" .-> Docs
```

## Layering

Dependencies only point down. Business rules never import the database, and the UI never talks to the database directly.

```mermaid
flowchart TB
  UI["UI · src/app pages, src/components<br/>polling hooks: useMenuPolling, useOrderPolling, useQueuePolling, useHistoryPolling"]
  RH["Route handlers · src/app/api<br/>parse → validate → authorize → call domain/db → shape response"]
  V["Validation · src/lib/schemas<br/>shared Zod schemas (also the OpenAPI source)"]
  A["Auth · src/lib/auth<br/>session JWT cookies, passcode, bcrypt, login rate limiter"]
  D["Domain · src/lib/domain<br/>order state machine, availability, queue, tracking, rate-limit math"]
  Q["Data access · src/lib/db<br/>Drizzle schema and queries"]
  PG[("PostgreSQL")]

  UI --> RH
  RH --> V
  RH --> A
  RH --> D
  RH --> Q
  A --> D
  Q --> PG
```

| Layer          | Rule                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| UI             | Calls the API with `fetch`; holds view state only.                                                                                 |
| Route handlers | Every body and path parameter goes through a shared Zod schema. Errors are `{ error }` or `{ errors[] }` with 401/404/409/422/500. |
| Domain         | Pure functions, no I/O. Covered by unit tests (goal: 95%).                                                                         |
| Data access    | The only code that imports Drizzle.                                                                                                |

## Order status state machine

Defined once in [`src/lib/domain/orderStatus.ts`](../src/lib/domain/orderStatus.ts) and enforced by `PATCH /api/orders/{id}/status`.

```mermaid
stateDiagram-v2
  [*] --> received: guest places order
  received --> brewing: advance
  brewing --> ready: advance
  ready --> picked_up: advance
  received --> cancelled: cancel
  brewing --> cancelled: cancel
  ready --> cancelled: cancel
  picked_up --> [*]
  cancelled --> [*]
```

The update is conditional (`UPDATE … WHERE id = $1 AND status = $from`), so if two baristas tap at once, only one wins and the other gets `409 Order status changed`.

## Database schema

Source of truth: [`src/lib/db/schema.ts`](../src/lib/db/schema.ts). Applied with drizzle-kit.

```mermaid
erDiagram
  customers ||--o{ orders : "places (optional)"
  orders ||--|{ order_items : contains
  menu_items ||--o{ order_items : "ordered as"

  customers {
    uuid id PK
    text name
    text email UK "lower-cased"
    text password_hash "bcrypt, cost 12"
    timestamptz created_at
  }

  orders {
    uuid id PK "also the guest's tracking key"
    text guest_name
    uuid customer_id FK "nullable: guests need no account"
    order_status status "received | brewing | ready | picked_up | cancelled"
    timestamptz created_at
    timestamptz updated_at
  }

  order_items {
    uuid id PK
    uuid order_id FK
    uuid menu_item_id FK
    jsonb options_json "sizing, milk, temp"
  }

  menu_items {
    uuid id PK
    text name
    boolean available
    boolean takes_milk
    size_type size_type "size | shots"
  }

  options {
    uuid id PK
    option_type type "size | shots | milk | temp"
    text label
    boolean available
  }
```

Notes:

- `options` has no foreign key: the chosen labels are copied into `order_items.options_json`, so history stays readable if an option is later renamed or turned off.
- Each order currently has exactly one `order_items` row (one drink per order, PRD §7).
- There is no `prices` or `payments` table by design (PRD §4 Non-goals).

## Authentication

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant M as middleware.ts
  participant R as Route handler
  participant DB as PostgreSQL

  Note over B,R: Barista: shared passcode
  B->>R: POST /api/barista/session { passcode }
  R->>R: constant-time compare with BARISTA_PASSCODE
  R-->>B: 200 + Set-Cookie hb_barista_session (HS256 JWT, httpOnly)
  B->>M: GET /api/barista/queue (cookie)
  M->>M: verify JWT, else 401
  M->>R: forward
  R->>R: verify JWT again
  R->>DB: active orders
  R-->>B: 200 { orders }

  Note over B,R: Customer: email + password
  B->>R: POST /api/customers/session { email, password }
  R->>R: rate limit (5 failures / 15 min per email and per IP)
  R->>DB: find customer by email
  R->>R: bcrypt compare (dummy hash when unknown, same timing)
  R-->>B: 200 + Set-Cookie hb_customer_session
```

- Both cookies are `httpOnly`, `SameSite=Lax`, and `Secure` in production, signed with `JWT_SECRET` (≥ 32 chars).
- Guests have no session: `GET /api/orders/{id}` is public because the random UUID is the access key.
- `POST /api/orders` takes the customer only from the cookie, never from the body.

## Real-time updates

| Screen             | Hook                | Endpoint                   |
| ------------------ | ------------------- | -------------------------- |
| Guest menu         | `useMenuPolling`    | `GET /api/menu`            |
| Guest order status | `useOrderPolling`   | `GET /api/orders/{id}`     |
| Barista queue      | `useQueuePolling`   | `GET /api/barista/queue`   |
| Barista history    | `useHistoryPolling` | `GET /api/barista/history` |

Each hook polls every 2.5 s, and responses are sent with `Cache-Control: no-store`. At a home party's scale this is cheaper and simpler than WebSockets (PRD §9).

## Delivery pipeline

```mermaid
flowchart LR
  Dev["Feature branch<br/>&lt;type&gt;/&lt;issue&gt;-&lt;desc&gt;"] --> PR["Pull request<br/>+ partner review"]
  PR --> Check["check<br/>lint · format · typecheck · unit tests (70% floor)"]
  PR --> Int["integration<br/>route handlers vs Postgres 16 (85% floor)"]
  PR --> E2E["e2e<br/>Playwright 375px + axe"]
  PR --> Sec["security<br/>npm audit · dependency review · CodeQL"]
  PR --> Prev["Vercel preview"]
  Check & Int & E2E & Sec --> Merge["merge to main"]
  Merge --> Prod["Vercel production<br/>+ Neon Postgres"]
```
