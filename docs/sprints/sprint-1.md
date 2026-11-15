# Sprint 1: Guest ordering and the barista queue

- **Milestone:** [Sprint 1](https://github.com/weiyiships/homebarista/milestone/1)
- **Dates:** 2026-10-26 → 2026-11-10 (the project schedule was revised; the milestone due date matches)
- **Goal:** a guest can order a customized drink from their phone, the barista sees it in a live queue and moves it through its statuses, and the guest watches the status change. These are the PRD's P0 stories US-1 to US-5.

## Planning

Planned jointly on 2026-10-26: both partners wrote the [PRD](../PRD.md), split it into issues, and set the milestone.

| Issue                                                    | Story      | Owner      | Priority | Estimate | Delivered in                                                                                                       |
| -------------------------------------------------------- | ---------- | ---------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| [#1](https://github.com/weiyiships/homebarista/issues/1) | Setup      | jooguh-dev | p0       | 2        | [#15](https://github.com/weiyiships/homebarista/pull/15)                                                           |
| [#2](https://github.com/weiyiships/homebarista/issues/2) | Database   | jooguh-dev | p0       | 3        | [#24](https://github.com/weiyiships/homebarista/pull/24)                                                           |
| [#3](https://github.com/weiyiships/homebarista/issues/3) | US-1, US-2 | weiyiships | p0       | 5        | [#25](https://github.com/weiyiships/homebarista/pull/25), [#28](https://github.com/weiyiships/homebarista/pull/28) |
| [#4](https://github.com/weiyiships/homebarista/issues/4) | US-2       | weiyiships | p0       | 2        | [#26](https://github.com/weiyiships/homebarista/pull/26), [#28](https://github.com/weiyiships/homebarista/pull/28) |
| [#5](https://github.com/weiyiships/homebarista/issues/5) | US-1       | weiyiships | p0       | 3        | [#27](https://github.com/weiyiships/homebarista/pull/27), [#28](https://github.com/weiyiships/homebarista/pull/28) |
| [#6](https://github.com/weiyiships/homebarista/issues/6) | US-3       | jooguh-dev | p0       | 5        | [#30](https://github.com/weiyiships/homebarista/pull/30) (by weiyiships)                                           |
| [#7](https://github.com/weiyiships/homebarista/issues/7) | US-4       | jooguh-dev | p0       | 3        | [#29](https://github.com/weiyiships/homebarista/pull/29)                                                           |
| [#8](https://github.com/weiyiships/homebarista/issues/8) | US-5       | weiyiships | p0       | 3        | [#31](https://github.com/weiyiships/homebarista/pull/31)                                                           |

Committed: 26 points.

Also in this sprint, outside the milestone: shared rules in `AGENTS.md` ([#20](https://github.com/weiyiships/homebarista/pull/20)), design tokens in `DESIGN.md` ([#21](https://github.com/weiyiships/homebarista/pull/21)), and the repository layout ([#22](https://github.com/weiyiships/homebarista/issues/22) → [#23](https://github.com/weiyiships/homebarista/pull/23)).

## Standups
### Standup 1 — Initial Setup
Participants: weiyiships, jooguh-dev

weiyiships
- Completed: Reviewed the project requirements and created initial wireframes for the guest menu and ordering flow.
- Next: Set up the Next.js frontend and build the basic menu page with sample coffee drinks.
- Blockers: None.
jooguh-dev
- Completed: Reviewed the technical requirements and designed the initial database schema for drinks, customization options, and orders.
- Next: Configure PostgreSQL and Drizzle ORM, then create the initial database tables.
- Blockers: Need to finalize the order data structure before implementing the API.
Team Discussion: Agreed to keep the first version simple and support guest ordering without requiring an account.

### Standup 2 — Menu & Database Integration
Participants: weiyiships, jooguh-dev

weiyiships
- Completed: Built the initial guest menu UI with six coffee drinks and customization options for size, temperature, and milk.
- Next: Connect the menu to the backend API and implement the order submission form.
- Blockers: Waiting for the menu API response format to be finalized.
jooguh-dev
- Completed: Created the database schema and seed data for drinks and customization options.
- Next: Implement the menu retrieval and order creation API endpoints with Zod validation.
- Blockers: Need to agree on how customized drink options will be stored with each order.
Team Discussion: Agreed on a shared API contract and validation rules so frontend and backend development can continue independently.

### Standup 3 — Basic Ordering Flow
Participants: weiyiships, jooguh-dev

weiyiships
- Completed: Integrated the menu API and implemented the guest order submission flow.
- Next: Build the order confirmation page and begin displaying order status.
- Blockers: Need a consistent response from the order creation API to support navigation to the tracking page.
jooguh-dev
- Completed: Implemented the order creation endpoint and database persistence for guest orders.
- Next: Build the order status API and introduce the order lifecycle: received, brewing, ready, and picked up.
- Blockers: None.

Team Discussion: Walked through the guest ordering flow and identified basic validation and error-handling cases to address in Sprint 2.

## Progress log

> Reconstructed from the commit history (author dates), not written at the time. Days with no commits are not listed.

### jooguh-dev

- **2026-10-26.** Wrote the PRD. Initialized Next.js 15, Tailwind CSS 4, and the UI layout (#1, merged as #15). Started the drink catalog with size and shot rules (#3, PR #16).
- **2026-10-27.** Compared the two #3 attempts (#16, #18) and refined `AGENTS.md` from the differences. Added the PR template.
- **2026-10-30.** Added Prettier and `format:check`, reorganized the repo to the course template (#22 → #23), and moved all agent rules into `AGENTS.md`.
- **2026-11-10.** Drizzle schema, seed data, and lazy db client (#2 → #24). Menu domain, `DrinkCard`/`DrinkGrid`, customization drawer (#3, #4 → #25, #26). `POST /api/orders` with Zod validation (#5 → #27). Order status state machine and `PATCH /api/orders/:id/status` with failing tests first (#7 → #29).

### weiyiships

- **2026-10-26.** Built a second #3 attempt with tests first: drink rules, customization defaults, drink card, menu page (PRs #17, #18).
- **2026-10-30.** Wrote `DESIGN.md` (#21) and streamlined the `AGENTS.md` rules (#20).
- **2026-11-10.** Barista passcode session, middleware, and FIFO queue with 2.5 s polling (#6 → #30). Queue position, tracking steps, and the live `/order/[id]` page (#8 → #31). Each with a failing-test commit before the implementation.

## Outcome (from GitHub)

- 8 of 8 issues done on time. Setup (#1) closed on 2026-10-26; the other seven closed on 2026-11-10, the last day of the sprint.
- `#3` had three competing first attempts ([#16](https://github.com/weiyiships/homebarista/pull/16), [#17](https://github.com/weiyiships/homebarista/pull/17), [#18](https://github.com/weiyiships/homebarista/pull/18)), all closed unmerged before [#25](https://github.com/weiyiships/homebarista/pull/25) landed.

## Retrospective

Written from the issues and pull requests above.

**What went well**

- All 8 stories shipped, and each core flow (order → queue → advance → track) works end to end.
- TDD is visible in the history: most features have a `test(...): add failing tests` commit before the `feat(...)` commit.
- Building #3 twice in parallel was wasteful, but comparing the two versions produced concrete `AGENTS.md` rules (PR template, layering, test placement) that we used for the rest of the project.

**What didn't**

- Most of the work was pushed at the end of the sprint (2026-11-10), so progress wasn't visible on GitHub in between.
- #3 was started three times (#16, #17, #18) before #25 landed: we hadn't agreed who owned it.
- #28 bundled #3, #4, and #5 into one PR. CI wasn't set up yet (it arrived in #39), so #26 and #28 were merged on local checks while we were still putting the pipeline together.
- Ownership drifted: #6 was assigned to jooguh-dev but delivered by weiyiships.

**What we'll change**

- Keep the assignee in sync with whoever does the work.
- Agree on one owner per issue before anyone writes code.
- Push small PRs during the sprint instead of batching at the end.
- Finish the CI pipeline so every PR is checked automatically before review.

**Partner feedback**

- _jooguh-dev → weiyiships: Weiyi built a clean and intuitive ordering interface and communicated frontend requirements clearly throughout the sprint.
- _weiyiships → jooguh-dev: Xuming did a great job setting up the database and backend APIs, which made it easier for me to integrate the frontend.
