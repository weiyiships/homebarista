# Sprint 2: Availability, history, customer accounts, E2E

- **Milestone:** [Sprint 2](https://github.com/weiyiships/homebarista/milestone/2)
- **Dates:** 2026-11-02 → 2026-11-09 (milestone due date)
- **Goal:** the barista can turn drinks and milks off and see finished orders; guests can optionally sign up, log in, and see their past orders; Playwright covers the core flows. PRD stories US-6, US-7, US-10 to US-12.

## Planning

| Issue                                                      | Story       | Owner      | Priority | Estimate | Delivered in                                                             |
| ---------------------------------------------------------- | ----------- | ---------- | -------- | -------- | ------------------------------------------------------------------------ |
| [#9](https://github.com/weiyiships/homebarista/issues/9)   | US-6        | jooguh-dev | p1       | _TBD_    | [#36](https://github.com/weiyiships/homebarista/pull/36)                 |
| [#10](https://github.com/weiyiships/homebarista/issues/10) | US-7        | jooguh-dev | p1       | _TBD_    | [#32](https://github.com/weiyiships/homebarista/pull/32)                 |
| [#11](https://github.com/weiyiships/homebarista/issues/11) | US-10       | weiyiships | p1       | _TBD_    | [#33](https://github.com/weiyiships/homebarista/pull/33)                 |
| [#12](https://github.com/weiyiships/homebarista/issues/12) | US-11       | weiyiships | p1       | _TBD_    | [#37](https://github.com/weiyiships/homebarista/pull/37)                 |
| [#13](https://github.com/weiyiships/homebarista/issues/13) | US-12       | weiyiships | p1       | _TBD_    | [#38](https://github.com/weiyiships/homebarista/pull/38)                 |
| [#14](https://github.com/weiyiships/homebarista/issues/14) | E2E testing | jooguh-dev | p1       | _TBD_    | [#39](https://github.com/weiyiships/homebarista/pull/39) (by weiyiships) |

> **To fill in:** story points agreed in planning.

Also delivered around the end of this sprint, outside the milestone: the home-page link fix ([#34](https://github.com/weiyiships/homebarista/issues/34) → [#35](https://github.com/weiyiships/homebarista/pull/35)), the menu UI refresh ([#40](https://github.com/weiyiships/homebarista/issues/40) → [#41](https://github.com/weiyiships/homebarista/pull/41)), the website layout ([#42](https://github.com/weiyiships/homebarista/issues/42) → [#43](https://github.com/weiyiships/homebarista/pull/43)), and the README ([#44](https://github.com/weiyiships/homebarista/issues/44) → [#45](https://github.com/weiyiships/homebarista/pull/45)).

## Progress log

> Reconstructed from the commit history (author dates), not written at the time. Days with no commits are not listed.

There are no commits between 2026-11-02 and 2026-11-09. All Sprint 2 work is dated 2026-11-10, one day after the due date.

### jooguh-dev

- **2026-11-10.** Availability rules, endpoints, server-side order guard, barista toggles, and live guest menu (#9 → #36). Order history domain, `GET /api/barista/history`, and the history tab with counts (#10 → #32). Failing tests committed first for both.

### weiyiships

- **2026-11-10.** Signup schema, bcrypt hashing, `POST /api/customers`, and `/signup` (#11 → #33). Login with generic errors, sliding-window rate limiting by email and IP, logout, and name autofill (#12 → #37). `GET /api/customers/me/orders` and `/my-orders` (#13 → #38). Playwright suites for guest, barista, and customer flows with axe checks, plus the 70% coverage gate in CI (#14 → #39). Also the home link fix (#34), monochrome menu UI (#40), website layout (#42), and README (#44).

## Outcome (from GitHub)

- 6 of 6 issues done, all closed on 2026-11-10, one day after the milestone's due date.
- No commits are dated between 2026-11-02 and 2026-11-09; most of Sprint 1 and Sprint 2 work landed in 18 PRs merged on 2026-11-10.
- #39, #41, #43, and #45 were merged without an approving review.

## Retrospective

Written from the issues and pull requests above.

**What went well**

- All 6 stories shipped, including the security-sensitive ones: bcrypt cost 12, constant-time passcode check, dummy-hash timing on unknown emails, rate limiting, and cookie-only customer identity.
- E2E tests and the coverage gate landed, so every later PR is checked automatically.
- Accessibility issues found by axe (#40, #42) were fixed with failing tests first.

**What didn't**

- The same pattern as Sprint 1, worse: no commits during the sprint week, everything on one day, and the milestone closed late.
- #39, #41, #43, and #45 were merged without an approving review, after we had agreed to require one.
- Work was uneven inside the sprint: weiyiships delivered 4 of the 6 stories plus 4 unplanned issues; #14 was assigned to jooguh-dev but delivered by weiyiships.
- Still no estimates.

**What we'll change**

- Commit and push at least every other day so progress is visible during the sprint.
- Protect `main` so a PR can't merge without an approval and green CI.
- Rebalance: whoever has fewer stories picks up the next one.

**Partner feedback**

> To fill in: one or two sentences each, in your own words.

- _jooguh-dev → weiyiships:_ …
- _weiyiships → jooguh-dev:_ …
