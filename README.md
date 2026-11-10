# homebarista

Guests order coffee from their phones at small gatherings, and the host runs a live barista queue.

## Live site

**https://homebarista-theta.vercel.app**, hosted on Vercel with Neon Postgres.

| Page                            | URL                                          |
| ------------------------------- | -------------------------------------------- |
| Menu (guests order here)        | https://homebarista-theta.vercel.app/menu    |
| Barista queue (shared passcode) | https://homebarista-theta.vercel.app/barista |
| Sign up / Log in (optional)     | https://homebarista-theta.vercel.app/signup  |

Ask the host for the barista passcode. It's stored in Vercel as `BARISTA_PASSCODE` and never committed.

## Testing

```bash
npm run lint && npm run format:check && npm run typecheck
npm test                # Vitest unit and component tests
npm run test:coverage   # same, with the 70% coverage floor CI enforces
npm run test:e2e        # Playwright end-to-end tests (375px, with axe checks)
```

The end-to-end suite builds the app and runs it against a **throwaway** Postgres database. Every table is dropped and reseeded on each run, and the setup refuses non-local databases outside CI. To run it locally with Docker:

```bash
docker run -d --name hb-e2e-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homebarista_e2e -p 54329:5432 postgres:16-alpine
npx playwright install chromium
npm run test:e2e
```

Set `E2E_DATABASE_URL` to use a different database.
