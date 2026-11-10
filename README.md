# homebarista

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
