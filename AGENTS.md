# AGENTS.md: Home Barista Order App

Full-stack web app where guests order coffee by QR code and the host runs a live barista queue. The PRD (`docs/PRD.md`) decides _what_ to build; this file decides _how_.

## Core Principles

1. **High Quality Development:** All code must be production-ready, readable, strictly typed, and follow the layering rules below.
2. **Professional Aesthetics:** The UI must look premium and intentional using Tailwind CSS: a warm café palette through theme tokens, mobile-first at 375px, light and dark mode. Never ship default Tailwind or stock shadcn/ui looks.
3. **Test-Driven:** No feature is complete without automated tests, written before the implementation (red → green → refactor).
4. **Collaboration First:** We use Scrum on GitHub Issues and the GitHub Project board, with one feature branch and one Pull Request per issue.
5. **Frequent Commits:** Commit often to create valid checkpoints: at each TDD step and every time a major feature or sub-component is completed.

## Technology Stack

- **Frontend & API:** Next.js 15+ App Router, React 19, TypeScript (`strict: true`)
- **Styling:** Tailwind CSS 4 + shadcn/ui + lucide-react
- **Database:** PostgreSQL (Neon or Supabase) with Drizzle ORM and drizzle-kit migrations
- **Validation & Auth:** Zod, `jose` (JWT cookies), bcryptjs (cost 12)
- **API Docs:** OpenAPI 3.1 from Zod (`@asteasolutions/zod-to-openapi`) + Swagger UI
- **Testing:** Vitest + React Testing Library, Playwright
- **Deployment & CI/CD:** Vercel, GitHub Actions
- **Real-time:** polling every 2.5 s; no WebSockets, GraphQL, Redux, or paid third-party APIs

## Code Quality & Testing Rules

- **Formatting & Linting:** Code must pass ESLint and Prettier. Code that fails `npm run lint` or `npm run format:check` cannot be merged.
- **Code Coverage Minimum:** `70%` overall coverage is strictly enforced in CI. Goals: 95% for `lib/domain`, 85% for validation, auth, and route handlers.
- **Unit Testing:** Vitest tests next to the source for domain rules, validation, auth helpers, hooks, and components.
- **Integration Testing:** Route handlers tested against a real test database (`DATABASE_URL_TEST`) in `tests/integration/`.
- **End-to-End Testing:** Playwright covers every core flow (guest orders, guest tracks status, customer signup and history, barista queue, availability, history) at 375px, with axe accessibility checks.
- **Architecture:** UI → route handlers → `lib/db` and `lib/domain`. Business rules, including the order status state machine, live only in pure `lib/domain` functions. Every input is validated with a shared Zod schema on the server.
- **Never** skip, delete, or weaken a test to make CI pass. No `any`, `@ts-ignore`, or `console.log`.

## Workflow Execution Rules for Agents

- Before implementing, make sure a GitHub Issue exists for the work. If none does, stop and ask.
- Work on a branch named `<type>/<issue>-<description>`, never on `main`. Use Conventional Commits ending in the issue: `feat(domain): add order state machine (#9)`.
- PRs need `Closes #N`, the acceptance criteria checklist, test evidence, green CI, and one approving review from the other partner.
- Always run `npm run lint && npm run format:check && npm run typecheck && npm test` and confirm it passes before telling the user a task is complete.
- Stay within the issue and the PRD: no prices, payments, sugar option, or unrequested features. Prefer local solutions over external APIs to keep costs low and user data private.
- Don't open, merge, or close PRs or issues unless a team member asks.

## Stick to the truth

- **Do not feel like you have to please me, I prefer that you say no or contradict me if I'm wrong.**
- **Feel free to tell me that you don't know something or that you are not confident instead of making up stuff.**
- **Always base your answers on evidence, unless I tell you otherwise.**
