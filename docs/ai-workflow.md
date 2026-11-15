# AI-assisted development workflow

We built Homebarista in **Antigravity**, the AI IDE harness for this course. Both partners worked with the same agent rules, kept in [`AGENTS.md`](../AGENTS.md) at the repository root, so the agent behaved the same way on either machine.

This document covers how the rules file evolved, what context we gave the agent, how we used it for test-driven development, and where it needed a human.

## The shared rules file

`AGENTS.md` tells the agent _how_ to build; the [PRD](PRD.md) tells it _what_. Both partners edit it through pull requests like any other file.

| Version                                                                        | Date       | Who        | Change                                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`c69ef41`](https://github.com/weiyiships/homebarista/commit/c69ef41)          | 2026-10-26 | weiyiships | First version: 434 lines covering context, PRD references, Scrum workflow, do's and don'ts, security, accessibility, and step-by-step agent instructions.                                       |
| PR #19 (closed, not merged)                                                    | 2026-10-27 | jooguh-dev | Rules learned from comparing two agent-built versions of the same story (#16 vs #18): what made one PR easier to review than the other.                                                         |
| [`3cd60a2`](https://github.com/weiyiships/homebarista/commit/3cd60a2) (PR #20) | 2026-10-30 | weiyiships | Cut to 45 lines. The long version restated the PRD and diluted the rules that mattered; the short one keeps principles, stack, quality gates, and workflow, and points to the PRD for the rest. |
| [`8d050ea`](https://github.com/weiyiships/homebarista/commit/8d050ea)          | 2026-10-30 | jooguh-dev | Added `npm run format:check` to the required gate after Prettier was set up.                                                                                                                    |
| [`28b7917`](https://github.com/weiyiships/homebarista/commit/28b7917)          | 2026-10-30 | jooguh-dev | One rules file for every agent, plus a **Project References** section that maps PRD sections to the questions an agent asks (scope, stories, quality bars, architecture).                       |

What we learned from those changes:

- **Keep the rules file about behavior.** The 434-line file restated much of the PRD. Pointing to the PRD by section instead keeps one source of truth for requirements and leaves `AGENTS.md` short enough to read in full.
- **Turn reviews into rules.** The 2026-10-27 revision came from comparing two agent-built PRs for the same story. Rules such as "never weaken a test to make CI pass", "no `any` or `@ts-ignore`", and "stay within §4 Non-goals: no prices, payments, sugar option" name specific things a reviewer would otherwise have to catch.
- **Make the gate executable.** "Run `npm run lint && npm run format:check && npm run typecheck && npm test` before saying a task is done" works better than "write clean code".
- **Say when to stop.** "If no GitHub Issue exists, stop and ask" and "don't open, merge, or close PRs unless asked" keep the agent from acting on the repository on its own.

## Context engineering

We gave the agent the smallest set of files that answers its questions, and made each one the single source of truth for its topic.

| Question the agent has               | Where it looks                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| What should this feature do?         | The GitHub issue (user story and acceptance criteria), then PRD §6–§7                 |
| Is this in scope?                    | PRD §3 Goals and §4 Non-goals                                                         |
| How good does it have to be?         | PRD §8 (performance, accessibility, security) and the coverage goals in `AGENTS.md`   |
| How is the code organized?           | `AGENTS.md` › Architecture, and [`architecture.md`](architecture.md)                  |
| What does the UI look like?          | `DESIGN.md` (tokens and layout rules)                                                 |
| What does the API accept and return? | The Zod schemas in `src/lib/schemas`, published as [`openapi.yaml`](api/openapi.yaml) |

Habits that helped:

- **Issues as prompts.** Each issue is written as a user story with checkbox acceptance criteria and a PRD reference. Starting the agent from the issue gives it a precise, testable target, and the PR copies the same checklist back.
- **Schemas over prose.** Request and response shapes live in shared Zod schemas. The agent reads types, not descriptions, and the OpenAPI spec is generated from them, so docs and code can't drift (a test fails if they do).
- **Pure domain functions.** Business rules such as the order state machine live in `src/lib/domain` with no I/O, so the agent can change and test them without a database.
- **One issue per session.** Keeping each agent session to one issue and one branch kept its context small and its diffs reviewable.

## AI-assisted TDD

The loop we followed for each feature:

1. Give the agent the issue and ask for **failing tests only**, covering every acceptance criterion.
2. Read the tests. Fix any that test the wrong thing. Run them and confirm they fail for the right reason.
3. Commit the red state: `test(scope): add failing tests for … (#N)`.
4. Ask the agent for the smallest implementation that passes. Run the full gate.
5. Commit green: `feat(scope): … (#N)`. Refactor with the tests as a safety net.

Examples from the history:

| Feature                         | Red                                                                                                                                          | Green                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Order status state machine (#7) | [`4b3fbce`](https://github.com/weiyiships/homebarista/commit/4b3fbce) domain tests                                                           | [`6aaf084`](https://github.com/weiyiships/homebarista/commit/6aaf084)                    |
| Status update route (#7)        | [`b40c075`](https://github.com/weiyiships/homebarista/commit/b40c075) route tests                                                            | merged in PR #29                                                                         |
| Customer order history (#13)    | [`ef87487`](https://github.com/weiyiships/homebarista/commit/ef87487), [`3589176`](https://github.com/weiyiships/homebarista/commit/3589176) | merged in PR #38                                                                         |
| OpenAPI + Swagger UI (#46)      | [`3d345af`](https://github.com/weiyiships/homebarista/commit/3d345af)                                                                        | [`884fb74`](https://github.com/weiyiships/homebarista/commit/884fb74)                    |
| Atomic `createOrder` (#59)      | [`e09e95d`](https://github.com/weiyiships/homebarista/commit/e09e95d) shows the orphan row                                                   | [`61adffb`](https://github.com/weiyiships/homebarista/commit/61adffb) adds a transaction |

The history has 39 `test(...)` commits on `main`; [`CONTRIBUTIONS.md`](CONTRIBUTIONS.md) has the breakdown.

When tests come _after_ the code, the agent tends to write tests that describe whatever the code does, bugs included. For the integration suite (#47), which covers routes that already existed, we checked the tests by **mutating the code**: breaking the IP parsing in the login rate limiter and skipping a state in the order state machine. Both changes made tests fail, which showed the tests check behavior rather than echo it.

## Where the agent needed a human

- **Scope.** Left alone, the agent adds plausible extras. The Non-goals rule and the "stay within the issue" rule exist for this.
- **Reviewing tests.** A green suite only means something if the tests are right, so the partner review looks at tests first.
- **Cross-cutting bugs.** The non-atomic `createOrder` (#59) passed every test written for it; it was found by a person reading the query while drawing the ER diagram.
- **Dependency and security choices.** For example, choosing Vitest 4.1 over 5.x (#61) to fix the critical advisories with fewer breaking changes, and pinning Next's bundled postcss with an `overrides` entry (#48).
- **Repository actions.** Merging, closing issues, and changing repository settings stay with the partners.
