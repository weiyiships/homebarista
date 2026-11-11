# Homebarista

Guests order coffee from their phones at small gatherings, and the host runs a live barista queue.

Home Barista is built for 3 to 12 friends at a gathering. Guests scan a QR code or open a link, pick a drink, and watch its status. They don't need an account. The host signs in with a shared passcode and works through the orders in arrival order. Guests can optionally sign up so the app remembers their name and keeps their order history.

## Contents

- [Live site](#live-site)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [API](#api)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Live site

**https://homebarista-theta.vercel.app**, hosted on Vercel with Neon Postgres.

| Page                            | URL                                          |
| ------------------------------- | -------------------------------------------- |
| Menu (guests order here)        | https://homebarista-theta.vercel.app/menu    |
| Barista queue (shared passcode) | https://homebarista-theta.vercel.app/barista |
| Sign up / Log in (optional)     | https://homebarista-theta.vercel.app/signup  |

Ask the host for the barista passcode. It's stored in Vercel as `BARISTA_PASSCODE` and never committed.

## Features

### Guests

- **Order without an account.** A name is the only thing required.
- **Customize the drink.** The menu has Espresso, Americano, Latte, Cappuccino, Flat White and Mocha. Every drink comes hot or iced. Espresso and Americano come as a single or double shot. Milk drinks come small, medium or large, with whole, oat, almond or skim milk.
- **Track the order** at `/order/<id>`: a progress stepper (received → brewing → ready → picked up) and how many orders are ahead.
- **See availability live.** The menu refreshes every 2.5 s, and drinks or milks the barista marks unavailable can't be ordered.

### Customers (optional accounts)

- **Sign up** at `/signup` and **log in** at `/login` with email and password. Passwords are hashed with bcrypt (cost 12), and login attempts are rate limited.
- **Name filled in, orders linked.** When signed in, the menu fills in the customer's name and new orders are linked to the account.
- **Past orders** are listed newest first at `/my-orders`.

### Barista (host)

- **Sign in** with a shared passcode at `/barista/login`. Every barista page and API is protected by a session cookie.
- **Run the live queue** at `/barista`. Active orders are shown oldest first and refresh every 2.5 s. Each order can be advanced (received → brewing → ready → picked up) or cancelled. On desktop the queue is a three-column board.
- **Mark items unavailable** at `/barista/availability`: drinks and milk options can be switched off when they run out.
- **Look back** at `/barista/history`: picked-up and cancelled orders, newest first.

Payments, prices and sugar options are out of scope by design (see [PRD §4](docs/PRD.md)).

## Tech stack

| Area       | Choice                                                           |
| ---------- | ---------------------------------------------------------------- |
| Framework  | Next.js 15 App Router, React 19, TypeScript (`strict`)           |
| Styling    | Tailwind CSS 4 with theme tokens, lucide-react icons             |
| Database   | PostgreSQL (Neon in production) with Drizzle ORM and drizzle-kit |
| Validation | Zod schemas shared by the UI and route handlers                  |
| Auth       | `jose` HS256 JWT cookies, `bcryptjs` password hashing            |
| Real-time  | Polling every 2.5 s (no WebSockets)                              |
| Testing    | Vitest + React Testing Library, Playwright + axe                 |
| CI/CD      | GitHub Actions, Vercel                                           |

## Getting started

### Prerequisites

- Node.js 22 (the version CI uses)
- A PostgreSQL database: a free [Neon](https://neon.tech) project, or Docker for a local one

### 1. Install

```bash
git clone https://github.com/weiyiships/homebarista.git
cd homebarista
npm install
```

### 2. Start a database

Skip this step if you already have a Postgres connection string. To run one locally with Docker:

```bash
docker run -d --name homebarista-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homebarista -p 5432:5432 postgres:16-alpine
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` (see [Environment variables](#environment-variables)). With the Docker database above:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/homebarista
JWT_SECRET=<output of: openssl rand -base64 48>
BARISTA_PASSCODE=<any passcode you'll share with the host>
```

### 4. Create the tables and seed the menu

```bash
npx drizzle-kit push --config drizzle.config.ts   # needs DATABASE_URL exported in your shell
npx tsx --env-file=.env.local src/lib/db/seed.ts   # adds the 6 drinks and their options
```

`drizzle-kit` doesn't read `.env.local`, so export `DATABASE_URL` first (for example `export $(grep DATABASE_URL .env.local)`). Run the seed script once: the menu tables have no unique constraint, so a second run adds duplicate drinks.

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000. The guest menu is at `/menu` and the barista queue at `/barista`, using the `BARISTA_PASSCODE` you set.

## Environment variables

Names are listed in [`.env.example`](.env.example). Never commit values; `.env.local` is git-ignored.

| Variable            | Required | Purpose                                                                     |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`      | Yes      | Postgres connection string used by the app and `drizzle-kit`.               |
| `JWT_SECRET`        | Yes      | Signs barista and customer session cookies. Must be at least 32 characters. |
| `BARISTA_PASSCODE`  | Yes      | Shared passcode the host uses to sign in at `/barista/login`.               |
| `DATABASE_URL_TEST` | No       | Reserved for integration tests against a separate database.                 |
| `E2E_DATABASE_URL`  | No       | Throwaway database for Playwright. Defaults to the local Docker one below.  |

## Scripts

| Command                 | What it does                                    |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start the dev server at http://localhost:3000   |
| `npm run build`         | Production build                                |
| `npm start`             | Serve the production build                      |
| `npm run lint`          | ESLint (`next lint`)                            |
| `npm run format`        | Format everything with Prettier                 |
| `npm run format:check`  | Check formatting without writing                |
| `npm run typecheck`     | TypeScript type check (`tsc --noEmit`)          |
| `npm test`              | Vitest unit and component tests                 |
| `npm run test:watch`    | Vitest in watch mode                            |
| `npm run test:coverage` | Vitest with the 70% coverage floor CI enforces  |
| `npm run test:e2e`      | Playwright end-to-end tests                     |
| `npm run db:generate`   | Generate SQL migrations from the Drizzle schema |
| `npm run db:migrate`    | Apply generated migrations                      |

## Project structure

```text
src/
  app/                 Pages and route handlers (Next.js App Router)
    api/               JSON API, see API below
    barista/           Queue, availability, history, and passcode login
    menu/              Guest menu and ordering
    order/[id]/        Guest order status page
    login/ signup/     Optional customer accounts
    my-orders/         Customer order history
  components/          UI by feature: menu, order, barista, customer, auth, site (header/footer)
  lib/
    domain/            Pure business rules: order state machine, queue order, tracking, availability
    db/                Drizzle schema, client, queries, seed script
    schemas/           Zod schemas shared by the client and the server
    auth/              JWT sessions, password hashing, login rate limiter
  middleware.ts        Guards barista pages and APIs
e2e/                   Playwright specs and helpers
docs/                  PRD, OpenAPI contract, research and design notes
```

Code is layered UI → route handlers → `lib/db` and `lib/domain`. Business rules, including the order status state machine, live only in pure functions in `lib/domain`, and every request body is validated on the server with a shared Zod schema.

## API

All endpoints return JSON. Barista endpoints need the barista session cookie set by `POST /api/barista/session`, and return `401` without it.

| Method          | Path                        | Auth     | Purpose                                    |
| --------------- | --------------------------- | -------- | ------------------------------------------ |
| `GET`           | `/api/menu`                 | None     | Drinks and options with availability       |
| `POST`          | `/api/orders`               | None     | Place an order (linked if signed in)       |
| `GET`           | `/api/orders/{id}`          | None     | Order status and queue position            |
| `PATCH`         | `/api/orders/{id}/status`   | Barista  | Advance or cancel an order                 |
| `POST`          | `/api/customers`            | None     | Sign up                                    |
| `POST`/`DELETE` | `/api/customers/session`    | None     | Customer log in / log out                  |
| `GET`           | `/api/customers/me/orders`  | Customer | The signed-in customer's past orders       |
| `POST`/`DELETE` | `/api/barista/session`      | None     | Barista sign in with passcode / sign out   |
| `GET`           | `/api/barista/queue`        | Barista  | Active orders, oldest first                |
| `GET`/`PATCH`   | `/api/barista/availability` | Barista  | Read or change drink and milk availability |
| `GET`           | `/api/barista/history`      | Barista  | Picked-up and cancelled orders             |

The OpenAPI contract lives in [`docs/api/openapi.yaml`](docs/api/openapi.yaml). It doesn't describe these endpoints yet.

## Testing

```bash
npm run lint && npm run format:check && npm run typecheck
npm test                # Vitest unit and component tests
npm run test:coverage   # same, with the 70% coverage floor CI enforces
npm run test:e2e        # Playwright end-to-end tests with axe checks
```

- **Unit and component tests** sit next to the code they test (`*.test.ts(x)`) and need no database.
- **End-to-end tests** in `e2e/` cover guest ordering and tracking, the barista queue, and customer sign-up, log-in and history. They run at a 375px phone width; `*.desktop.spec.ts` files run at 1280px to check the website layout. Every page is checked with axe for WCAG 2.1 AA.

The end-to-end suite builds the app and runs it against a **throwaway** Postgres database. Every table is dropped and reseeded on each run, and the setup refuses non-local databases outside CI. To run it locally with Docker:

```bash
docker run -d --name hb-e2e-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homebarista_e2e -p 54329:5432 postgres:16-alpine
npx playwright install chromium
npm run test:e2e
```

Set `E2E_DATABASE_URL` to use a different database.

### Continuous integration

GitHub Actions ([`.github/workflows`](.github/workflows)) runs on every pull request and every push to `main`:

- **check:** lint, format check, type check, and unit tests with coverage
- **e2e:** Playwright against a Postgres 16 service container; reports are uploaded when it fails

## Deployment

Production runs on Vercel at https://homebarista-theta.vercel.app, with a Neon Postgres database added through the Vercel integration. `DATABASE_URL` comes from the integration, while `JWT_SECRET` and `BARISTA_PASSCODE` are set as sensitive variables for Production and Preview.

The repository isn't connected to Vercel's Git integration, so merges don't deploy on their own. To deploy from a linked checkout of `main`:

```bash
npx vercel deploy --prod
```

## Contributing

We work in Scrum on GitHub Issues and the project board. The full rules are in [`AGENTS.md`](AGENTS.md); in short:

1. **Start from an issue.** Every change needs a GitHub Issue.
2. **One branch per issue,** named `<type>/<issue>-<description>`, for example `feat/12-customer-login`.
3. **Test first:** write a failing test, make it pass, then refactor.
4. **Conventional Commits** ending in the issue number: `feat(domain): add order state machine (#9)`.
5. **One pull request per issue,** with `Closes #N`, the acceptance-criteria checklist, test evidence, green CI, and an approving review from the other partner.

Before opening a PR, run:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

## Documentation

- [`docs/PRD.md`](docs/PRD.md): product requirements: goals, user stories, acceptance criteria, non-functional requirements
- [`DESIGN.md`](DESIGN.md): design tokens and UI rules
- [`AGENTS.md`](AGENTS.md): engineering workflow and code rules
- [`docs/api/openapi.yaml`](docs/api/openapi.yaml): API contract

Built by Weiyi Sun and Xuming Zhuge for Northeastern CS6983.
