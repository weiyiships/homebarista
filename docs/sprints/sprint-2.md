# Sprint 2: Availability, history, customer accounts, E2E

- **Milestone:** [Sprint 2](https://github.com/weiyiships/homebarista/milestone/2)
- **Dates:** 2026-11-10 → 2026-11-14 (the project schedule was revised; the milestone due date matches)
- **Goal:** the barista can turn drinks and milks off and see finished orders; guests can optionally sign up, log in, and see their past orders; Playwright covers the core flows. PRD stories US-6, US-7, US-10 to US-12.

## Planning

| Issue                                                      | Story       | Owner      | Priority | Estimate | Delivered in                                                             |
| ---------------------------------------------------------- | ----------- | ---------- | -------- | -------- | ------------------------------------------------------------------------ |
| [#9](https://github.com/weiyiships/homebarista/issues/9)   | US-6        | jooguh-dev | p1       | 3        | [#36](https://github.com/weiyiships/homebarista/pull/36)                 |
| [#10](https://github.com/weiyiships/homebarista/issues/10) | US-7        | jooguh-dev | p1       | 2        | [#32](https://github.com/weiyiships/homebarista/pull/32)                 |
| [#11](https://github.com/weiyiships/homebarista/issues/11) | US-10       | weiyiships | p1       | 3        | [#33](https://github.com/weiyiships/homebarista/pull/33)                 |
| [#12](https://github.com/weiyiships/homebarista/issues/12) | US-11       | weiyiships | p1       | 5        | [#37](https://github.com/weiyiships/homebarista/pull/37)                 |
| [#13](https://github.com/weiyiships/homebarista/issues/13) | US-12       | weiyiships | p1       | 2        | [#38](https://github.com/weiyiships/homebarista/pull/38)                 |
| [#14](https://github.com/weiyiships/homebarista/issues/14) | E2E testing | jooguh-dev | p1       | 5        | [#39](https://github.com/weiyiships/homebarista/pull/39) (by weiyiships) |

Committed: 20 points.

Also delivered around the end of this sprint, outside the milestone: the home-page link fix ([#34](https://github.com/weiyiships/homebarista/issues/34) → [#35](https://github.com/weiyiships/homebarista/pull/35)), the menu UI refresh ([#40](https://github.com/weiyiships/homebarista/issues/40) → [#41](https://github.com/weiyiships/homebarista/pull/41)), the website layout ([#42](https://github.com/weiyiships/homebarista/issues/42) → [#43](https://github.com/weiyiships/homebarista/pull/43)), and the README ([#44](https://github.com/weiyiships/homebarista/issues/44) → [#45](https://github.com/weiyiships/homebarista/pull/45)).

## Standups

No standups were recorded during this sprint. There are no standup notes in the repository, issues, or pull requests, so none are reconstructed here; the progress log below comes from the commit history instead.

## Progress log

> Reconstructed from the commit history (author dates), not written at the time. Days with no commits are not listed.

### jooguh-dev

- **2026-11-10.** Availability rules, endpoints, server-side order guard, barista toggles, and live guest menu (#9 → #36). Order history domain, `GET /api/barista/history`, and the history tab with counts (#10 → #32). Failing tests committed first for both.

### weiyiships

- **2026-11-10.** Signup schema, bcrypt hashing, `POST /api/customers`, and `/signup` (#11 → #33). Login with generic errors, sliding-window rate limiting by email and IP, logout, and name autofill (#12 → #37). `GET /api/customers/me/orders` and `/my-orders` (#13 → #38). Playwright suites for guest, barista, and customer flows with axe checks, plus the 70% coverage gate in CI (#14 → #39). Also the home link fix (#34), monochrome menu UI (#40), website layout (#42), and README (#44).

## Outcome (from GitHub)

- 6 of 6 issues done on time, all closed on 2026-11-10.
- The CI pipeline (unit tests with a 70% coverage floor, Playwright E2E against Postgres) went live in #39. #39 itself, the UI follow-ups #41 and #43, and the README (#45) were merged by their author as the pipeline came up.

## Retrospective

Written from the issues and pull requests above.

**What went well**

- All 6 stories shipped, including the security-sensitive ones: bcrypt cost 12, constant-time passcode check, dummy-hash timing on unknown emails, rate limiting, and cookie-only customer identity.
- E2E tests and the coverage gate landed, so every later PR is checked automatically.
- Accessibility issues found by axe (#40, #42) were fixed with failing tests first.

**What didn't**

- Work was again concentrated on a single day, which made the PRs large and hard to review in depth.
- Until CI existed, quality checks depended on each partner running them locally; a few quick follow-up changes went in without waiting for a full review cycle.
- Work was uneven inside the sprint: weiyiships delivered 4 of the 6 stories plus 4 unplanned issues; #14 was assigned to jooguh-dev but delivered by weiyiships.
- Standups were skipped again: none were recorded this sprint.

**What we'll change**

- Commit and push at least every other day so progress is visible during the sprint.
- With CI in place, every PR goes through green checks and partner review before merge (done from Sprint 3).
- Rebalance: whoever has fewer stories picks up the next one.
- Post three standups per partner in `sprint-3.md` during Sprint 3, on the day each one happens.

**Partner feedback**

> To fill in: one or two sentences each, in your own words.

- _jooguh-dev → weiyiships:_ …
- _weiyiships → jooguh-dev:_ …
