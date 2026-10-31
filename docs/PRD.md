# PRD: Home Barista Order App

**Owner:** Xuming Zhuge / Weiyi Sun

---

## 1. Overview

A lightweight web app that lets guests order coffee from their phone (via QR code or link) while the host acts as barista and works through a live queue. Built for small gatherings of friends (about 3 to 12 people). Guests can order without an account, or sign up for an optional customer account that remembers their name and keeps their order history across gatherings.

## 2. Problem hypothesis

When we host friends, drinks get ordered out loud. With more than a few people, orders get forgotten, mixed up, or made wrong, and the host has to remember who wanted what. Guests keep asking “is mine ready?”, and the host gets interrupted while trying to make drinks. There is also no record of what was ordered or served.

## 3. Goals

- G1: A guest can place a customized order in under 30 seconds with no account.
- G2: The barista sees every order in a live queue and never loses one.
- G3: A guest can see their order status without asking.
- G4: A returning guest can sign up or log in in under 1 minute and see their past orders.

## 4. Non-goals

- Payments, tips, or pricing
- Required accounts: ordering must always work without signing up
- Social login, email verification, and password-reset emails (v1)
- Native mobile apps (responsive web/PWA only)
- Multi-shop or multi-barista support
- Coffee brewing analytics or dial-in tooling
- Microservices, Kubernetes, GraphQL

## 5. Users

| Role     | Description                                                          | Auth                             |
| -------- | -------------------------------------------------------------------- | -------------------------------- |
| Guest    | Friend at the gathering, on their phone, ordering without an account | None (name only)                 |
| Customer | Returning guest with an optional account                             | Email and password (JWT session) |
| Barista  | Host, using a phone or laptop near the machine                       | Shared passcode (JWT session)    |

## 6. User stories

Each story rests on an assumption to test (Mom Test).

| ID    | Priority | Story                                                                                                            | Assumption                                                                    |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| US-1  | P0       | As a guest, I want to order from my phone via QR without an account, so I don't interrupt the host.              | Verbal ordering is awkward or chaotic.                                        |
| US-2  | P0       | As a guest, I want to customize my drink (size or shots, milk, temperature), so it is made correctly.            | Customization errors happen today.                                            |
| US-3  | P0       | As the barista, I want a live queue in arrival order, so I don't rely on memory.                                 | Orders get forgotten or mixed up.                                             |
| US-4  | P0       | As the barista, I want to advance an order (received, brewing, ready) or cancel it.                              | Needed to run the queue.                                                      |
| US-5  | P0       | As a guest, I want to see my order status, so I stop asking if it's done.                                        | Guests wait and ask today.                                                    |
| US-6  | P1       | As the barista, I want to mark drinks or milks unavailable, so guests can't order what I can't make.             | Running out mid-session happens.                                              |
| US-7  | P1       | As the barista, I want a history of completed and cancelled orders, so I can look back at what I served.         | The host wants a record of what went out.                                     |
| US-8  | P2       | As a customer, I want my usual order saved to my account, so reordering is one tap.                              | Friends repeat orders.                                                        |
| US-9  | P2       | As a guest, I want a notification when my drink is ready.                                                        | Guests step away from the machine.                                            |
| US-10 | P1       | As a returning guest, I want to sign up with my name, email, and password, so the app remembers me.              | Friends come to more than one gathering and would sign up if it saves effort. |
| US-11 | P1       | As a customer, I want to log in and log out on my phone, so my name is filled in and my orders are linked to me. | Typing a name each time is a small but real annoyance.                        |
| US-12 | P1       | As a customer, I want to see my past orders, so I can remember what I liked.                                     | Guests forget what they ordered last time.                                    |

## 7. Functional requirements and acceptance criteria

**FR-1 Menu and customization (US-1, US-2)**

- Menu lists these drinks: Espresso, Americano, Latte, Cappuccino, Flat White, Mocha.
- Every drink offers temperature (hot or iced). Espresso offers single or double shot instead of size; all other drinks offer small, medium, or large.
- Milk (whole, oat, almond, skim) is offered only for milk drinks (latte, cappuccino, flat white, mocha). Espresso and Americano have no milk option.
- No sugar option.
- Unavailable items are hidden or disabled.
- Order can be submitted with only a guest name.
- If a customer is logged in, their name is filled in automatically.

**FR-2 Order submission (US-1)**

- Submitting creates an order with status `received` and a short order ID.
- Guest is redirected to a status page for that order.
- If a customer is logged in, the order is linked to their account.
- Order appears in the barista queue within 3 seconds.

**FR-3 Barista queue (US-3, US-4)**

- Queue shows active orders oldest-first, with name, drink, and all options.
- One tap advances status: `received` to `brewing` to `ready` to `picked_up`.
- Cancel requires confirmation and records the order as `cancelled`.
- Barista routes require the passcode.

**FR-4 Order tracking (US-5)**

- Status page updates within 3 seconds of a change (polling every 2 to 3 seconds).
- Page shows queue position while the order is `received`.

**FR-5 Availability (US-6)**

- Barista can toggle any drink or milk on or off.
- A toggled-off item cannot be ordered, even from an already-open menu (server-side validation).

**FR-6 Order history (US-7)**

- Barista page lists all picked-up and cancelled orders, newest first, with a count.
- Each entry shows order ID, guest name, final status, drink and options, and order and finish times.
- History updates as orders are completed or cancelled.

**FR-7 Customer signup and login (US-10, US-11)**

- Signup asks for name, email, and password; ordering without an account remains available on every screen.
- Email must be valid and unique (case-insensitive). Password must be at least 8 characters.
- A duplicate email shows "An account with this email already exists" with a link to log in.
- Passwords are hashed (bcrypt or argon2) and never stored or logged in plain text.
- Successful signup or login sets a signed JWT in an httpOnly, secure, same-site cookie that expires after 7 days.
- Failed login shows a generic "Invalid email or password" message, without revealing whether the email exists.
- Login attempts are rate-limited (for example, 5 failed attempts per email per 15 minutes).
- Logout clears the session cookie and returns the customer to the menu.
- A customer token cannot access barista routes, and a barista token cannot access another customer's account.

**FR-8 Customer order history (US-12)**

- Logged-in customers have a "My orders" page listing their orders newest first.
- Each entry shows order ID, drink and options, final status, and order time.
- Customers can see only their own orders; requests for another customer's orders are rejected server-side.
- Orders placed as a guest before signing up are not linked to the new account (v1).

## 8. Non-functional requirements

- Mobile-first, usable one-handed at 375px width
- Menu loads in under 3 seconds on mobile data
- Passcode-protected barista area; guests cannot read other guests' orders except by order ID
- Customer passwords hashed, sessions in httpOnly cookies, and login attempts rate-limited
- Input validation on all order fields server-side
- Single-instance scale is enough (about 20 concurrent users)

## 9. Technical approach

| Layer     | Choice                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework | Next.js (App Router), TypeScript                                                                                                                 |
| UI        | Tailwind + shadcn/ui                                                                                                                             |
| DB        | Postgres (Neon or Supabase)                                                                                                                      |
| ORM       | Drizzle                                                                                                                                          |
| Real-time | Polling every 2 to 3s (upgrade to Supabase Realtime only if time allows)                                                                         |
| Auth      | JWT in httpOnly cookies: customer email and password (bcrypt or argon2 hashing), shared barista passcode; route protection in Next.js middleware |
| Tests     | Vitest (unit), Playwright (end-to-end order flow)                                                                                                |
| Deploy    | Vercel + GitHub Actions CI                                                                                                                       |

**Core data model (draft)**

- `menu_item(id, name, available, takes_milk, size_type)` (size_type: size or shots)
- `option(id, type, label, available)` (type: size, shots, milk, temp)
- `customer(id, name, email, password_hash, created_at)` (email unique)
- `order(id, guest_name, customer_id, status, created_at, updated_at)` (customer_id nullable; null for guest orders)
- `order_item(id, order_id, menu_item_id, options_json)`

## 10. Success metrics

Measured at one real gathering (5 or more guests):

- At least 80% of guests place an order through the app without help
- Zero lost or duplicated orders
- Median time from submit to barista seeing the order is under 3 seconds
- At least 1 guest uses the app at a second gathering without being asked (time commitment signal)
- At least 1 returning guest creates an account and logs in at a second gathering (account value signal)
- Post-event: "Did you ask 'is mine ready?' at any point?" Fewer than half say yes

## 11. Milestones

1. **Setup:** repo, CI, test harness, DB schema and migrations
2. **Validation:** Mom Test conversations; revise this PRD
3. **P0 build:** US-1 to US-5 as small tickets, each with tests
4. **P1:** availability toggles, barista order history, customer signup and login, and customer order history
5. **Real-world test:** run at a gathering, collect metrics
6. **Review:** compare results against success metrics and decide next steps
7. **Stretch (if time):** US-8, US-9, Supabase Realtime
