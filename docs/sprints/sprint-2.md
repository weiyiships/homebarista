# Sprint 2: Availability, history, customer accounts, E2E

- **Milestone:** [Sprint 2](https://github.com/weiyiships/homebarista/milestone/2)
- **Dates:** 2026-11-02 → 2026-11-08 (the project schedule was revised; the milestone due date matches)
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

### Standup 1 — Customer accounts and availability

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Live order tracking page with queue position (#8 → #31).
- Next: Customer signup with bcrypt hashing and JWT cookies (#11).
- Blockers: Need to confirm how customer sessions are handled across different pages.

**jooguh-dev**

- Completed: Order status state machine and the status endpoint (#7 → #29).
- Next: Drink and milk availability toggles (#9) and the barista order history (#10).
- Blockers: Need to ensure unavailable options are validated by the backend, not just disabled in the UI.

Team discussion: Confirmed that customer accounts remain optional, so guests can keep ordering without signing up.

### Standup 2 — Login and order history

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Customer signup (#11 → #33).
- Next: Login and logout with rate limiting and name autofill (#12), then the customer's My Orders page (#13).
- Blockers: Need to test session expiration and unauthorized API access.

**jooguh-dev**

- Completed: Barista order history with picked-up and cancelled counts (#10 → #32).
- Next: Finish the availability toggles and the server-side order guard (#9).
- Blockers: Need to make sure cancelled and completed orders are excluded from the active queue.

Team discussion: Tested several guests ordering while the barista updated statuses, and identified a few edge cases.

### Standup 3 — End-to-end tests and CI

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Login, logout, and rate limiting (#12 → #37) and My Orders (#13 → #38).
- Next: Playwright tests for the guest, barista, and customer flows with axe checks, plus the coverage gate in CI (#14).
- Blockers: Some automated tests need stable seeded data to avoid inconsistent results.

**jooguh-dev**

- Completed: Availability rules, endpoints, the server-side order guard, barista toggles, and the live guest menu (#9 → #36).
- Next: Review the Sprint 2 pull requests and start a gap review against the course requirements for Sprint 3.
- Blockers: None.

Team discussion: Agreed that from Sprint 3 every pull request needs green CI checks and partner review before merging.

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

**What we'll change**

- Commit and push at least every other day so progress is visible during the sprint.
- With CI in place, every PR goes through green checks and partner review before merge (done from Sprint 3).
- Rebalance: whoever has fewer stories picks up the next one.

**Partner feedback**

- _jooguh-dev → weiyiships:_ Weiyi did a great job integrating the APIs and improving the user experience, especially the mobile layout and order tracking flow.
- _weiyiships → jooguh-dev:_ Xuming built the availability controls and order history, including the server-side check that rejects unavailable drinks.
