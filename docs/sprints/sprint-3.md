# Sprint 3: Hardening and documentation

- **Milestone:** [Sprint 3](https://github.com/weiyiships/homebarista/milestone/3)
- **Dates:** 2026-11-15 →
- **Goal:** close the gaps between the working app and the project requirements: a documented public API, integration tests against a real database, security scanning in CI, architecture and process documentation.

## Planning

Planned on 2026-11-15 from a gap review of the repository against the course requirements. Every issue was written with acceptance criteria and a story-point estimate.

| Issue                                                      | Work                                     | Priority | Estimate | PR                                                       | Status     |
| ---------------------------------------------------------- | ---------------------------------------- | -------- | -------- | -------------------------------------------------------- | ---------- |
| [#46](https://github.com/weiyiships/homebarista/issues/46) | OpenAPI 3.1 from Zod + Swagger UI        | p0       | 5        | [#53](https://github.com/weiyiships/homebarista/pull/53) | Done       |
| [#47](https://github.com/weiyiships/homebarista/issues/47) | Route handler integration tests          | p0       | 5        | [#54](https://github.com/weiyiships/homebarista/pull/54) | Done       |
| [#48](https://github.com/weiyiships/homebarista/issues/48) | CI security scanning                     | p0       | 2        | [#55](https://github.com/weiyiships/homebarista/pull/55) | Done       |
| [#49](https://github.com/weiyiships/homebarista/issues/49) | Deploy previews and automated deploy     | p1       | 3        | —                                                        | weiyiships |
| [#50](https://github.com/weiyiships/homebarista/issues/50) | Architecture and schema diagrams         | p1       | 2        | [#58](https://github.com/weiyiships/homebarista/pull/58) | Done       |
| [#51](https://github.com/weiyiships/homebarista/issues/51) | Sprint docs and contribution log         | p1       | 3        | this PR                                                  | In review  |
| [#52](https://github.com/weiyiships/homebarista/issues/52) | AI-assisted development workflow         | p1       | 2        | [#64](https://github.com/weiyiships/homebarista/pull/64) | Done       |
| [#56](https://github.com/weiyiships/homebarista/issues/56) | Tidy repository layout                   | —        | 1        | [#57](https://github.com/weiyiships/homebarista/pull/57) | Done       |
| [#59](https://github.com/weiyiships/homebarista/issues/59) | Create order and item in one transaction | bug      | 1        | [#60](https://github.com/weiyiships/homebarista/pull/60) | Done       |
| [#61](https://github.com/weiyiships/homebarista/issues/61) | Vitest 4 (critical tinypool advisories)  | —        | 2        | [#62](https://github.com/weiyiships/homebarista/pull/62) | Done       |

Committed: 26 points. #59 was found while drawing the ER diagram (#50); #56 and #61 were added mid-sprint.

TDD evidence this sprint: #46 and #59 each have a failing-test commit before the implementation. #47 adds tests for existing behavior, checked by mutating the code and confirming the tests fail.

## Progress log

> Reconstructed from the commit history (author dates), not written at the time. Days with no commits are not listed.

### jooguh-dev

- **2026-11-15.** Gap review against the course requirements; created the Sprint 3 backlog with estimates. OpenAPI from Zod and Swagger UI with failing tests first (#46 → #53). Route-handler integration tests against Postgres and a CI job (#47 → #54). npm audit, dependency review, CodeQL, Dependabot, and the patched postcss (#48 → #55). Architecture and ER diagrams (#50 → #58). Found and fixed the non-atomic `createOrder` with a failing test first (#59 → #60). Vitest 4 for the critical tinypool advisories (#61 → #62). Repository cleanup (#56 → #57). Sprint docs and contribution log (#51 → #63) and the AI workflow write-up (#52 → #64).

### weiyiships

- **2026-11-15.** Reviewed, approved, and merged #53, #54, #55, #57, #58, #60, #62, and #64. Enabled the Dependency graph so dependency review runs in CI, and confirmed CodeQL default setup is off. Owns deployment automation (#49) on the team's Vercel account.

## Retrospective

> In progress: finish at the end of the sprint.

**What went well so far**

- Every issue was written with acceptance criteria and a story-point estimate before work started (26 points).
- One branch and one PR per issue, each reviewed by the other partner before merge.
- TDD with a red commit for #46 and #59; #47 was checked by mutating the code and seeing the tests fail.
- A bug (#59) found while documenting the schema went into the backlog and was fixed test-first the same day.

**What didn't / risks**

- Sprint 3 commits so far are almost all from jooguh-dev; deployment (#49) is the main weiyiships item.
- PRs that touch `package.json` or the README conflict with each other when merged in sequence.

**What we'll change**

- …

**Partner feedback**

> To fill in: one or two sentences each, in your own words.

- _jooguh-dev → weiyiships:_ …
- _weiyiships → jooguh-dev:_ …
