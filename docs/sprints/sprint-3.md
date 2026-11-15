# Sprint 3: Hardening and documentation

- **Milestone:** [Sprint 3](https://github.com/weiyiships/homebarista/milestone/3)
- **Dates:** 2026-11-09 → 2026-11-15
- **Goal:** close the gaps between the working app and the project requirements: a documented public API, integration tests against a real database, security scanning in CI, architecture and process documentation.

## Planning

Planned on 2026-11-09 from a gap review of the repository against the course requirements. Every issue was written with acceptance criteria and a story-point estimate.

| Issue                                                      | Work                                     | Priority | Estimate | PR                                                       | Status |
| ---------------------------------------------------------- | ---------------------------------------- | -------- | -------- | -------------------------------------------------------- | ------ |
| [#46](https://github.com/weiyiships/homebarista/issues/46) | OpenAPI 3.1 from Zod + Swagger UI        | p0       | 5        | [#53](https://github.com/weiyiships/homebarista/pull/53) | Done   |
| [#47](https://github.com/weiyiships/homebarista/issues/47) | Route handler integration tests          | p0       | 5        | [#54](https://github.com/weiyiships/homebarista/pull/54) | Done   |
| [#48](https://github.com/weiyiships/homebarista/issues/48) | CI security scanning                     | p0       | 2        | [#55](https://github.com/weiyiships/homebarista/pull/55) | Done   |
| [#49](https://github.com/weiyiships/homebarista/issues/49) | Deploy previews and automated deploy     | p1       | 3        | [#65](https://github.com/weiyiships/homebarista/pull/65) | Done   |
| [#50](https://github.com/weiyiships/homebarista/issues/50) | Architecture and schema diagrams         | p1       | 2        | [#58](https://github.com/weiyiships/homebarista/pull/58) | Done   |
| [#51](https://github.com/weiyiships/homebarista/issues/51) | Sprint docs and contribution log         | p1       | 3        | [#63](https://github.com/weiyiships/homebarista/pull/63) | Done   |
| [#52](https://github.com/weiyiships/homebarista/issues/52) | AI-assisted development workflow         | p1       | 2        | [#64](https://github.com/weiyiships/homebarista/pull/64) | Done   |
| [#56](https://github.com/weiyiships/homebarista/issues/56) | Tidy repository layout                   | —        | 1        | [#57](https://github.com/weiyiships/homebarista/pull/57) | Done   |
| [#59](https://github.com/weiyiships/homebarista/issues/59) | Create order and item in one transaction | bug      | 1        | [#60](https://github.com/weiyiships/homebarista/pull/60) | Done   |
| [#61](https://github.com/weiyiships/homebarista/issues/61) | Vitest 4 (critical tinypool advisories)  | —        | 2        | [#62](https://github.com/weiyiships/homebarista/pull/62) | Done   |

Committed: 26 points. #59 was found while drawing the ER diagram (#50); #56 and #61 were added mid-sprint.

TDD evidence this sprint: #46 and #59 each have a failing-test commit before the implementation. #47 adds tests for existing behavior, checked by mutating the code and confirming the tests fail.

## Standups

### Standup 1 — Gap review and backlog

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Home link fix, menu UI refresh, website layout, and README (#35, #41, #43, #45).
- Next: Deploy previews and automated production deploys (#49).
- Blockers: None.

**jooguh-dev**

- Completed: Gap review against the course requirements; wrote the Sprint 3 backlog with estimates.
- Next: OpenAPI from Zod with Swagger UI (#46) and route-handler integration tests (#47).
- Blockers: CI needs a separate PostgreSQL test database to run integration tests reliably.

Team discussion: Agreed to run integration tests against an isolated test database.

### Standup 2 — API docs, integration tests, and security

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Reviewed and merged #53, #54, #55, #57, #58, #60, #62, and #64. Enabled the dependency graph so dependency review runs in CI.
- Next: Connect Vercel's Git integration and add the deploy job to CI (#49).
- Blockers: None.

**jooguh-dev**

- Completed: OpenAPI and Swagger UI (#46 → #53), integration tests (#47 → #54), security scanning (#48 → #55), diagrams (#50 → #58), the order transaction fix (#59 → #60), and Vitest 4 (#61 → #62).
- Next: Sprint docs and contribution log (#51) and the AI workflow write-up (#52).
- Blockers: None.

### Standup 3 — Deployment and final verification

Participants: weiyiships, jooguh-dev

**weiyiships**

- Completed: Deploy pipeline: PR previews and production deploys after CI passes, with `preview` and `production` GitHub Environments (#49 → #65). Fixed the Vitest 5 upgrade (#78 → #73).
- Next: Perform final user acceptance testing and update the project documentation.
- Blockers: Preview deployments use the production database, because `DATABASE_URL` is set for Preview in Vercel.

**jooguh-dev**

- Completed: Sprint docs and contribution log (#51 → #63) and the AI workflow write-up (#52 → #64).
- Next: Verify production environment variables, monitor deployment results, and test the live APIs.
- Blockers: None.

Team discussion: Completed a full walkthrough of the guest and barista experiences and confirmed the main features were ready for the final demonstration.

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

- Most Sprint 3 issues were delivered by jooguh-dev. weiyiships delivered deployment (#49), reviewed and merged most PRs, and fixed the Vitest 5 upgrade (#78).
- PRs that touch `package.json` or the README conflict with each other when merged in sequence.

**What we'll change**

- …

**Partner feedback**

- _jooguh-dev → weiyiships:_ Weiyi was thorough in testing the application and fixing UI issues, which helped us polish the final product before deployment.
- _weiyiships → jooguh-dev:_ Xuming took ownership of backend testing and CI security scanning, helping us deliver a more reliable application.
