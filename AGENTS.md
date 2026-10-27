# AGENTS.md: Home Barista Order App

This file tells AI coding agents (Antigravity and any other assistant) how to work in this repository. Read it fully before starting any task. When this file and the PRD disagree, the PRD wins for *what* to build and this file wins for *how* to build it. When something is unclear or not covered, stop and ask instead of guessing.

**Team:** Xuming Zhuge, Weiyi Sun
**PRD:** [`docs/PRD.md`](docs/PRD.md)
**Board:** GitHub Project "Home Barista Order App" (columns: Backlog → Sprint Todo → In Progress → In Review → Done)

---

## 1. Project context

### 1.1 What we are building

A mobile-first web app for small gatherings (3–12 people). Guests order coffee from their phone via a QR code, the host works through a live barista queue, and guests watch their order status update without asking. Accounts are optional for guests.

| Role | Description | Auth |
| --- | --- | --- |
| Guest | Orders with a name only | None |
| Customer | Guest with an optional account; name prefilled, sees own order history | Email + password → JWT cookie |
| Barista | The host; runs the queue, availability, and history | Shared passcode → JWT cookie |

Out of scope (do not build unless an issue says so): payments or pricing, native apps, multiple baristas or shops, social login, email verification, password-reset emails, GraphQL, microservices.

### 1.2 Tech stack and versions

`package.json` and the lockfile are the source of truth for exact versions. Use the major versions below; do not upgrade a major version without an issue for it.

| Area | Choice | Major version |
| --- | --- | --- |
| Runtime | Node.js LTS | 22+ |
| Language | TypeScript, `strict: true` | 5.x |
| Framework | Next.js App Router (frontend and API route handlers) | 15 (`package.json`: `^15.1.7`) |
| UI library | React | 19 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui (Radix primitives) + lucide-react icons | latest CLI |
| Database | PostgreSQL on Neon or Supabase | 16+ |
| ORM | Drizzle ORM + drizzle-kit migrations | latest 0.x |
| Validation | Zod (shared by client forms and server handlers) | 3 or 4 |
| Auth | `jose` (JWT signing and verification), `bcryptjs` or `@node-rs/argon2` (password hashing) | latest |
| API docs | OpenAPI 3.1 generated from Zod with `@asteasolutions/zod-to-openapi`, served by Swagger UI | latest |
| Unit and integration tests | Vitest + React Testing Library | latest |
| E2E tests | Playwright | 1.x |
| Lint and format | ESLint (Next.js config) + Prettier | latest |
| CI/CD | GitHub Actions, Vercel deploys | n/a |

Real-time updates use **polling every 2–3 seconds** (PRD FR-2, FR-4). Do not add WebSockets or Supabase Realtime unless the issue explicitly asks for it.

### 1.3 Architecture overview

```
.
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── design/            # mockup exports and screen notes
│   ├── research/          # Mom Test notes
│   └── sprints/           # planning, standup, review, and retro notes
├── drizzle/               # generated SQL migrations (never edit merged ones)
├── src/
│   ├── app/
│   │   ├── (guest)/
│   │   │   ├── menu/page.tsx              # menu + customization
│   │   │   └── order/[id]/page.tsx        # live order status
│   │   ├── (customer)/
│   │   │   ├── signup/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── account/orders/page.tsx    # "My orders"
│   │   ├── barista/
│   │   │   ├── login/page.tsx
│   │   │   ├── queue/page.tsx
│   │   │   ├── availability/page.tsx
│   │   │   └── history/page.tsx
│   │   └── api/
│   │       ├── v1/                        # PUBLIC, documented, versioned API
│   │       │   ├── menu/route.ts
│   │       │   └── orders/
│   │       │       ├── route.ts           # POST create order
│   │       │       └── [id]/status/route.ts
│   │       ├── auth/                      # customer signup/login/logout, barista login/logout
│   │       ├── barista/                   # internal, barista-only endpoints
│   │       ├── account/                   # internal, customer-only endpoints
│   │       ├── openapi.json/route.ts      # generated spec
│   │       └── docs/route.ts              # Swagger UI
│   ├── components/
│   │   ├── ui/            # shadcn/ui generated components (add via CLI, avoid hand edits)
│   │   ├── menu/
│   │   ├── order/
│   │   ├── barista/
│   │   └── auth/
│   ├── hooks/             # e.g. use-polling.ts
│   ├── lib/
│   │   ├── domain/        # PURE business rules, no I/O: drink-rules.ts, order-status.ts, queue.ts
│   │   ├── db/            # client.ts, schema.ts, queries/*.ts
│   │   ├── auth/          # jwt.ts, password.ts, session.ts, guards.ts
│   │   ├── validation/    # Zod schemas: order.ts, auth.ts, availability.ts
│   │   ├── api/           # response helpers, error types
│   │   └── openapi/       # OpenAPI registry built from Zod schemas
│   └── middleware.ts      # route protection (named proxy.ts in newer Next.js versions)
├── tests/
│   ├── integration/       # route handlers + real test database
│   ├── e2e/               # Playwright specs
│   └── helpers/           # factories, db reset, auth helpers
└── .github/
    ├── workflows/ci.yml           # (not created yet)
    ├── ISSUE_TEMPLATE/
    └── pull_request_template.md   # (not created yet)
```

**Key patterns**

1. **Layers, in one direction only:** UI (pages/components) → route handlers or server actions → `lib/db/queries` and `lib/domain`. Components never import from `lib/db`. `lib/domain` never imports from `lib/db`, Next.js, or React.
2. **Pure domain logic:** Drink option rules, status transitions, and queue position live in `lib/domain` as pure functions. These are the first things we test (TDD).
3. **Server Components by default.** Add `"use client"` only for interactivity (forms, polling, toggles). Keep client components small and leaf-level.
4. **One Zod schema per input,** in `lib/validation`, used by both the form (client-side feedback) and the route handler (authoritative check). The server always validates, even if the client did.
5. **Thin route handlers:** parse with Zod → check auth → call domain/query functions → return a typed response. No business rules inline in handlers.
6. **Consistent API responses:**
   - Success: `200`/`201` with the resource as JSON.
   - Error: `{ "error": { "code": "ITEM_UNAVAILABLE", "message": "Oat milk is no longer available." } }` with the right status (`400`, `401`, `403`, `404`, `409`, `422`, `429`).
   - Use helpers in `lib/api` rather than building responses by hand.
7. **Order status is a state machine** defined once in `lib/domain/order-status.ts`:
   `received → brewing → ready → picked_up`, and `received | brewing | ready → cancelled`. No skipping, no going backward, no leaving `picked_up` or `cancelled`. All writes go through this function.
8. **Polling** uses one shared hook, `use-polling.ts` (interval 2500 ms, pauses when the tab is hidden, stops on terminal statuses).
9. **Prices do not exist.** Do not add price fields, totals, or currency anywhere.

### 1.4 Domain rules (from PRD FR-1)

| Drink | Size or shots | Milk | Temperature |
| --- | --- | --- | --- |
| Espresso | single or double shot | none | hot or iced |
| Americano | small, medium, large | none | hot or iced |
| Latte, Cappuccino, Flat White, Mocha | small, medium, large | whole, oat, almond, skim | hot or iced |

No sugar option. Unavailable drinks and milks are disabled in the UI **and** rejected by the server.

### 1.5 Naming conventions and coding standards

| Thing | Convention | Example |
| --- | --- | --- |
| Files and folders | kebab-case | `order-status.ts`, `drink-card.tsx` |
| React components | PascalCase export | `export function DrinkCard()` |
| Hooks | `use` + camelCase, file `use-*.ts` | `usePolling` in `use-polling.ts` |
| Functions and variables | camelCase, verbs for functions | `canTransition`, `getQueuePosition` |
| Types and interfaces | PascalCase, no `I` prefix | `OrderStatus`, `MenuItem` |
| Constants | UPPER_SNAKE_CASE | `POLL_INTERVAL_MS` |
| Zod schemas | camelCase + `Schema` | `createOrderSchema` |
| DB tables and columns | snake_case | `order_item.menu_item_id` |
| API paths | lowercase, plural nouns, kebab-case | `/api/v1/orders/[id]/status` |
| Error codes | UPPER_SNAKE_CASE | `INVALID_TRANSITION` |
| Test files | same name + `.test.ts(x)`; E2E `.spec.ts` | `order-status.test.ts`, `order-flow.spec.ts` |

**Coding standards**

- TypeScript strict mode. No `any`; use `unknown` and narrow. No `// @ts-ignore` (use `@ts-expect-error` with a reason if truly needed).
- Infer types from Zod (`z.infer`) and Drizzle (`typeof table.$inferSelect`) instead of duplicating them.
- Named exports everywhere except Next.js files that require default exports (`page.tsx`, `layout.tsx`).
- Functions under about 40 lines; extract helpers rather than nesting deeply. Prefer early returns.
- Use `async`/`await`, never mixed `.then()` chains.
- No `console.log` in committed code. Server errors go through one logger helper that never logs passwords, tokens, or cookies.
- Comments explain *why*, not *what*. Reference issues and PRD IDs where a rule comes from (see Section 3.4).
- Code must pass `npm run lint`, `npm run typecheck`, and `npm test` before a PR is opened.

### 1.6 Testing strategy

We follow **TDD (red → green → refactor)**, and the commit history must show it.

1. **Red:** Write a failing test that captures one acceptance criterion. Commit it alone: `test: add failing test for ... (#12)`.
2. **Green:** Write the minimum code to pass. Commit: `feat: ... (#12)`.
3. **Refactor:** Clean up with tests still green. Commit: `refactor: ... (#12)`.

| Level | Tool | Location | What it covers |
| --- | --- | --- | --- |
| Unit | Vitest | next to the source file | `lib/domain`, `lib/validation`, `lib/auth` helpers, hooks, small components |
| Integration | Vitest | `tests/integration/` | Route handlers against a real test Postgres database: validation, auth guards, DB effects |
| E2E | Playwright | `tests/e2e/` | Full user flows in a browser at a 375px mobile viewport (plus a desktop project for barista pages) |

**Patterns**

- Name tests as behavior: `it("rejects milk on an espresso order")`, not `it("works")`.
- Arrange / Act / Assert, one behavior per test.
- Use factories in `tests/helpers/` to create data; never depend on another test's data. Reset the test database between integration test files.
- Integration tests use `DATABASE_URL_TEST`, never the development or production database.
- Mock only at the boundaries (time, randomness). Do not mock Drizzle or our own domain code.
- Use fake timers for polling tests instead of real waits.
- E2E tests select elements by role and accessible name (`getByRole("button", { name: "Place order" })`), falling back to `data-testid` only when needed. No CSS-class selectors, no fixed `waitForTimeout`.
- Real-time E2E tests use two browser contexts (guest + barista).

**Coverage goals** (enforced in CI where possible)

- `lib/domain`: 95% lines and branches
- `lib/validation`, `lib/auth`, route handlers: 85%
- Overall: 80% lines
- Every P0 user flow in Section 2.4 has at least one E2E test.

**Never** delete, skip (`.skip`/`.only`), or weaken a test to make it pass. If a test seems wrong, explain why in the PR and ask a teammate.

---

## 2. PRD and design references

### 2.1 PRD

The PRD is at [`docs/PRD.md`](docs/PRD.md). Requirement IDs (US-x, FR-x) are stable; use them in issues, PRs, and code comments. Before implementing a feature, read its user story and functional requirement in full. If an issue conflicts with the PRD, flag it in the PR rather than silently choosing one.

### 2.2 Mockups and prototype

Mockup exports live in `docs/design/` (No Figma file; designs are in docs/design/). The design direction:

- **Mobile-first, one-handed use at 375px.** Primary actions sit in the bottom third of the screen; tap targets are at least 44×44 px.
- **Warm café look:** a cream/off-white background, espresso-brown primary color, one accent color for status. Supports light and dark mode through Tailwind theme tokens; never hard-code hex colors in components.
- **Typography:** one sans-serif family, large readable sizes (base 16px; guest name and order ID large on the status page).
- **Status colors** are always paired with a text label and icon (never color alone): received = neutral, brewing = amber, ready = green, cancelled = red/muted.

Screens:

| Screen | Route | Notes |
| --- | --- | --- |
| Menu | `/menu` | Drink cards in a single column; tapping opens the customization sheet |
| Customization sheet | (on `/menu`) | Bottom sheet with option groups and a sticky "Place order" button |
| Order status | `/order/[id]` | Big status badge, step indicator, queue position, order summary |
| Sign up / Log in | `/signup`, `/login` | Short forms; "Continue as guest" link always visible |
| My orders | `/account/orders` | List of the customer's past orders |
| Barista login | `/barista/login` | Single passcode field |
| Barista queue | `/barista/queue` | Order cards oldest-first; one primary action button per card |
| Availability | `/barista/availability` | Toggle list for drinks and milks |
| Barista history | `/barista/history` | Completed and cancelled orders with count |

### 2.3 Key UI components and expected behavior

| Component | Expected behavior |
| --- | --- |
| `DrinkCard` | Shows the drink name and a short description. Disabled with an "Unavailable" label when the drink is off; not tappable when disabled. |
| `CustomizationSheet` | Shows only the option groups valid for the selected drink (shots for espresso, sizes for others; milk only for milk drinks; temperature for all). Each group requires one choice and has a sensible default (medium, whole milk, hot, single shot). Unavailable milks are disabled with a label. |
| `GuestNameField` | Required, 1–30 characters, trimmed. Prefilled and read-only-by-default for logged-in customers (with an "edit" option). |
| `PlaceOrderButton` | Disabled while submitting to prevent duplicate orders. On a `409 ITEM_UNAVAILABLE` response, keeps the sheet open and shows which item became unavailable. |
| `OrderStatusBadge` | Text + icon + color for each status. Announces changes to screen readers through an `aria-live="polite"` region. |
| `StatusStepper` | Shows received → brewing → ready → picked up, with the current step highlighted. Cancelled shows a separate cancelled state. |
| `QueuePosition` | Shows "You're #N in line" only while status is `received`. |
| `OrderCard` (barista) | Guest name, short order ID, drink, every option, time since ordered. One primary button labeled with the *next* action ("Start brewing", "Mark ready", "Picked up"). |
| `CancelOrderDialog` | Confirmation dialog before cancelling; focus is trapped and returns to the card on close. |
| `AvailabilityToggle` | Switch per drink or milk with an accessible label ("Oat milk available"). Optimistic update with rollback and a toast on failure. |
| `AuthForm` | Signup and login forms with inline Zod validation, a show/hide password control, and generic login errors. |

### 2.4 User flows to follow when implementing

**Flow A: Guest places an order (US-1, US-2, FR-1, FR-2)**
1. Guest opens `/menu` from the QR code.
2. Taps an available drink → customization sheet opens with valid options and defaults.
3. Chooses options, enters name, taps "Place order".
4. Server validates (Zod + domain rules + live availability) and creates the order with status `received` and a short ID.
5. Guest is redirected to `/order/[id]`. The order appears on the barista queue within 3 seconds.

**Flow B: Guest tracks the order (US-5, FR-4)**
1. `/order/[id]` polls the status endpoint every 2–3 seconds.
2. Shows queue position while `received`; updates the badge and stepper as status changes.
3. Stops polling at `picked_up` or `cancelled`.

**Flow C: Customer signs up or logs in (US-10, US-11, FR-7)**
1. From the menu header, the guest taps "Sign up" or "Log in". "Continue as guest" is always available.
2. On success, the server sets the JWT cookie and redirects back to where the user came from (usually `/menu`).
3. The name field is prefilled; new orders are linked to the customer.
4. Logout clears the cookie and returns to `/menu`.

**Flow D: Customer views past orders (US-12, FR-8)**
1. Logged-in customer opens "My orders" from the header menu.
2. Sees only their own orders, newest first. Logged-out users are redirected to `/login`.

**Flow E: Barista runs the queue (US-3, US-4, FR-3)**
1. Barista logs in at `/barista/login` with the passcode.
2. `/barista/queue` polls and shows active orders oldest-first.
3. One tap advances an order to the next status; the server enforces the state machine.
4. Cancel opens a confirmation dialog; confirming sets `cancelled`.
5. Picked-up and cancelled orders leave the queue and appear in history.

**Flow F: Barista changes availability (US-6, FR-5)**
1. Barista toggles a drink or milk on `/barista/availability`.
2. Open guest menus reflect it on their next poll.
3. Any order containing a now-unavailable item is rejected with `409 ITEM_UNAVAILABLE`.

**Flow G: Barista reviews history (US-7, FR-6)**
1. `/barista/history` lists picked-up and cancelled orders newest-first with a count, order and finish times.

---

## 3. Scrum and workflow

### 3.1 Branches

- `main` is always deployable and protected. Never commit directly to `main`.
- One branch per issue: `<type>/<issue-number>-<short-kebab-description>`
  - `feature/7-submit-order`
  - `fix/23-duplicate-order-on-double-tap`
  - `chore/2-ci-pipeline`
  - `docs/13-swagger-docs`
  - `test/14-e2e-order-flow`
- No author suffixes. If the branch name is already taken, stop and ask.
- Keep branches short-lived (ideally under 3 days). Rebase on `main` before opening a PR.

### 3.2 Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) with the issue number at the end of the subject:

```
<type>(<optional scope>): <imperative summary, max ~72 chars> (#<issue>)

<optional body: why the change was made, any trade-offs>
```

Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`, `style`, `perf`.

Examples:

```
test(domain): add failing tests for order status transitions (#9)
feat(domain): implement order status state machine (#9)
refactor(domain): extract terminal status check (#9)
fix(menu): disable place order button while submitting (#23)
```

Small, focused commits. A test commit should come **before** its implementation commit for every feature.

### 3.3 Pull requests

1. Open a PR from the issue branch into `main` when the acceptance criteria are met and all checks pass locally.
2. Title follows the commit format: `feat: submit order and redirect to status page (#7)`.
3. Copy the issue's labels and milestone to the PR, set the assignee, and add the PR to the Project board (or list these as TODO for the human if you lack permission).
4. Before opening a PR, run `git diff --stat main...HEAD`. If more than ~400 changed lines (excluding lockfiles and generated files), stop and propose a split. For feature issues, split by layer: PR 1 domain logic + tests, PR 2 UI + page.
5. The description uses these headings, in this order:
   - **Summary:** what changed and why.
   - **Closes:** `Closes #<issue>` (moves the card to Done on merge).
   - **PRD references:** every US-x and FR-x ID listed in the issue body and its milestone description.
   - **Acceptance criteria:** the checklist copied from the issue, with each item checked.
   - **Changes:** the files or areas touched.
   - **Testing:** paste the actual tail of the output of `npm run lint`, `npm run typecheck`, and `npm test`. Never write "passing" or "clean" without the output. If `.github/workflows/ci.yml` does not exist, write "CI not configured" and do not tick any CI checkbox.
   - **Screenshots:** 375px and desktop for UI changes. Agents cannot capture them; keep the heading and write "TODO: author to attach 375px and desktop screenshots".
   - **Not done / uncertain:** anything left undone or unverified.
6. **Required:** CI green once ci.yml exists (currently not configured) (lint, typecheck, unit, integration, E2E) and **one approving review from the other partner**. Authors never approve or merge their own PRs without review.
7. Reviewers check: acceptance criteria met, tests written first and meaningful, no secrets, accessibility basics, matches this file.
8. Squash-merge or rebase-merge, keeping the test-first commits visible in the PR history. Delete the branch after merging.

**Definition of Done:** acceptance criteria met, tests written first and passing in CI, coverage goals met, reviewed and approved, merged to `main`, deployed preview checked, and the issue is in Done.

### 3.4 Referencing GitHub Issues

- **Commits:** end the subject with `(#12)`.
- **PRs:** `Closes #12` (or `Fixes #12` for bugs). Use `Refs #12` when a PR is only partial.
- **Code comments:** reference the requirement or issue when a rule might look arbitrary:
  ```ts
  // Espresso uses shots instead of size (PRD FR-1, #6)
  ```
- **TODOs** must have an issue: `// TODO(#31): replace polling with Supabase Realtime`. No TODOs without an issue number.
- **Tests:** put the requirement in the `describe` block when it maps to one: `describe("FR-5 availability", ...)`.

---

## 4. Do's and don'ts

### 4.1 Patterns to follow

- **Do** start every feature with a failing test and commit it before the implementation.
- **Do** keep business rules in `lib/domain` and reuse them on the client and server.
- **Do** validate every request body, query param, and route param with Zod on the server.
- **Do** use Drizzle's query builder with parameters; wrap multi-step writes (order + order items) in a transaction.
- **Do** keep changes scoped to the issue you are working on. Mention unrelated problems in the PR description or open a new issue.
- **Do** update `docs/PRD.md`, this file, and the OpenAPI spec when behavior or the public API changes.
- **Do** add every new public endpoint to the OpenAPI registry with request and response schemas and examples.
- **Do** run `npm run lint && npm run typecheck && npm test` before saying a task is done, and report the results honestly.
- **Do** ask a clarifying question when acceptance criteria are ambiguous.

### 4.2 Patterns to avoid

- **Don't** add features, pages, or fields that are not in the PRD or the current issue.
- **Don't** add prices, payments, or a sugar option.
- **Don't** put database calls in components or business rules in route handlers.
- **Don't** trust client input, including hidden fields, availability state, or the guest name.
- **Don't** edit a migration that has already been merged; generate a new one with `drizzle-kit`.
- **Don't** use `any`, `@ts-ignore`, `eslint-disable` without a reason, or `useEffect` for data that can be loaded on the server.
- **Don't** use raw SQL strings built with concatenation.
- **Don't** add WebSockets, Redux, GraphQL, or a separate Express server.
- **Don't** skip, delete, or loosen tests to get CI green.
- **Don't** make large, multi-issue PRs. Before opening a PR, run `git diff --stat main...HEAD`. If more than ~400 changed lines (excluding lockfiles and generated files), stop and propose a split. For feature issues, split by layer: PR 1 domain logic + tests, PR 2 UI + page.

### 4.3 Dependencies

**Prefer**

| Need | Use |
| --- | --- |
| UI components | shadcn/ui (added through its CLI) + Tailwind |
| Icons | lucide-react |
| Forms | React Hook Form + `@hookform/resolvers/zod` |
| Validation | Zod |
| JWT | `jose` (works in Next.js middleware/edge runtime) |
| Password hashing | `bcryptjs` (cost 12) or `@node-rs/argon2` |
| Short order IDs | `nanoid` `customAlphabet` (6 characters, no ambiguous characters like 0/O, 1/I) |
| Dates | native `Date` + `Intl.DateTimeFormat`; `date-fns` only if needed |
| Toasts | shadcn/ui `sonner` |
| API docs | `@asteasolutions/zod-to-openapi` + Swagger UI |

**Avoid** (ask before adding anything not listed above): Moment.js, Lodash (use native methods), Axios (use `fetch`), CSS-in-JS libraries, component libraries other than shadcn/ui, NextAuth/Auth.js (our auth is intentionally simple and custom-tested), `jsonwebtoken` (not edge-compatible), state-management libraries.

Every new dependency must be justified in the PR description. Prefer well-maintained packages with recent releases and no known vulnerabilities (`npm audit` clean).

### 4.4 Security requirements

- **Secrets** (`DATABASE_URL`, `JWT_SECRET`, `BARISTA_PASSCODE`) live only in environment variables: `.env.local` locally (gitignored), GitHub Actions secrets in CI, Vercel environment variables in production. Keep `.env.example` updated with placeholder values. Never commit or log secrets.
- **Passwords:** hashed with bcrypt (cost 12) or argon2. Never stored, logged, or returned in plain text. Minimum 8 characters.
- **Sessions:** JWTs signed with HS256 using `JWT_SECRET` (at least 32 random bytes), stored in `httpOnly`, `secure`, `sameSite=lax` cookies. Customer tokens expire after 7 days; barista tokens after 12 hours. Tokens include `role` (`customer` or `barista`) and `sub`.
- **Authorization** is checked on the server for every protected route handler, not just in middleware or the UI. Customers can only read their own orders; customer tokens cannot reach barista routes.
- **Barista passcode** comparison uses a constant-time comparison.
- **Login errors** are generic ("Invalid email or password"). Login and passcode attempts are rate-limited (5 failures per 15 minutes per email or IP) and return `429`.
- **Order privacy:** an order is readable only by its ID (guest), its owner (customer), or the barista. No endpoint lists all orders publicly.
- **Public API** (`/api/v1`) returns only menu data, availability, and an order's status and queue position, never guest names of other orders or customer data.
- **Input limits:** guest name 1–30 characters; reject unknown fields with Zod `.strict()`.
- **React escapes output by default:** never use `dangerouslySetInnerHTML`.
- Keep dependencies patched; CI runs `npm audit --audit-level=high`.

### 4.5 Accessibility requirements (WCAG 2.2 AA)

- Use semantic HTML: real `<button>`, `<a>`, `<label>`, headings in order, one `<h1>` per page, landmarks (`<header>`, `<main>`, `<nav>`).
- Every input has a visible label; errors are linked with `aria-describedby` and announced.
- Color contrast at least 4.5:1 for text and 3:1 for UI components, in both light and dark mode.
- Never use color alone to show status or availability; pair it with text and an icon.
- Tap targets at least 44×44 px; works one-handed at 375px and with 200% zoom without horizontal scrolling.
- Everything works with a keyboard: visible focus rings, logical tab order, dialogs trap and restore focus, Escape closes sheets and dialogs.
- Live updates (order status, new queue items) are announced with `aria-live="polite"`, without stealing focus.
- Respect `prefers-reduced-motion` for animations.
- Playwright E2E tests run an axe accessibility check (`@axe-core/playwright`) on every main screen and fail on serious or critical violations.

---

## 5. How agents should work on a task

0. Before any work, check the issue's assignee and Project status, and search for existing branches or PRs referencing it (e.g. `gh pr list --search '#<n>'`). If it is assigned to someone else, or a branch/PR already exists, stop and ask. Otherwise ask the human to assign the issue and move the card to In Progress.
1. Read the GitHub issue, its acceptance criteria, and the linked PRD sections.
2. Confirm you are on the correct branch (`<type>/<issue>-<description>`); create it from an up-to-date `main` if not.
3. Make a short plan and list the tests you will write. Ask if anything is unclear.
4. Write failing tests → commit. Implement → commit. Refactor → commit.
5. Run lint, typecheck, and all tests. Fix failures without weakening tests.
6. Summarize what changed, which acceptance criteria are covered, and anything left undone or uncertain.
7. Do not open, merge, or close PRs or issues unless a team member asks you to.

---

## 6. Revision history

**v2 (after comparing PR #16 and PR #18 for #3)**

- Section 5: added step 0 (check assignee, Project status, and existing branches/PRs before starting).
- Section 3.1: no author suffixes in branch names; stop and ask if the name is taken.
- Section 3.3: copy labels, milestone, assignee, and Project to the PR (or list as TODO).
- Section 3.3: fixed PR description headings (Summary, Closes, PRD references, Acceptance criteria, Changes, Testing, Screenshots, Not done / uncertain).
- Section 3.3: PRD references must list every US-x/FR-x ID from the issue and its milestone.
- Section 3.3: Testing must paste the tail of lint, typecheck, and test output.
- Section 3.3: Screenshots heading kept with a TODO for the author.
- Section 3.3: write "CI not configured" when ci.yml is missing; no CI checkbox ticked.
- Sections 3.3 and 4.2: size check with `git diff --stat main...HEAD`; propose a split above ~400 lines, by layer.
- Section 3.3: required checks read "CI green once ci.yml exists (currently not configured)".
- Section 1.3: marked ci.yml and pull_request_template.md as not created yet.
- Section 1.2: Next.js version reconciled with package.json (15); Section 2.2: Figma placeholder replaced.

Not yet re-tested with a new agent run.
