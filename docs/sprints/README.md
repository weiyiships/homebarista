# Sprints

We run short Scrum sprints on GitHub. Each sprint is a [milestone](https://github.com/weiyiships/homebarista/milestones), each backlog item is an issue with acceptance criteria, and each issue gets one branch and one pull request reviewed by the other partner.

| Sprint                  | Dates                   | Goal                                                      | Issues |
| ----------------------- | ----------------------- | --------------------------------------------------------- | ------ |
| [Sprint 1](sprint-1.md) | 2026-10-26 → 2026-11-10 | Guest ordering and the barista queue (PRD P0 stories)     | 8      |
| [Sprint 2](sprint-2.md) | 2026-11-10 → 2026-11-14 | Availability, history, customer accounts, E2E tests       | 6      |
| [Sprint 3](sprint-3.md) | 2026-11-15 →            | Hardening: API docs, integration tests, CI security, docs | 10     |

Who did what across all sprints: [`docs/CONTRIBUTIONS.md`](../CONTRIBUTIONS.md).

## How a sprint works

1. **Planning (both partners).** Pick stories from the [PRD](../PRD.md) §6, write each as an issue with acceptance criteria from §7, estimate it in story points, label priority (`p0`, `p1`), and assign it to the sprint milestone.
2. **Standups.** Each partner posts at least three async standups per sprint: what I did, what I'll do next, what's blocking me.
3. **Work.** Branch `<type>/<issue>-<description>`, failing test first, Conventional Commits ending in `(#N)`, PR with `Closes #N`.
4. **Review.** The other partner reviews and approves every PR before merge. CI must be green.
5. **Retrospective (both partners).** What went well, what didn't, what we change next sprint, and feedback for each other.

## Estimation scale

Story points on a Fibonacci-like scale, relative to a "small, well-understood change":

| Points | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| 1      | A config or docs change; under an hour                    |
| 2      | One small feature or fix with tests                       |
| 3      | A feature touching UI, API, and data, with tests          |
| 5      | A feature with new infrastructure or several moving parts |
| 8      | Too big: split it                                         |
