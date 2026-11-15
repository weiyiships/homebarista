# Partner contribution log

Two partners: **Weiyi Sun** ([@weiyiships](https://github.com/weiyiships)) and **jooguh-dev** ([@jooguh-dev](https://github.com/jooguh-dev)).

The tables below come from the GitHub history as of 2026-11-15. Regenerate the numbers with the commands at the end before submitting.

## Summary

| Measure                                      | weiyiships      | jooguh-dev     |
| -------------------------------------------- | --------------- | -------------- |
| Non-merge commits on `main`                  | 67              | 45             |
| Lines added / removed (excl. `package-lock`) | +8,850 / −1,207 | +10,954 / −503 |
| `test` commits on `main`                     | 28              | 12             |
| PRs merged (authored)                        | 12              | 18             |
| PRs reviewed with an approval                | 16              | 7              |
| Issues created                               | 4               | 25             |

Dependabot's 4 automated PRs are not counted.

## Who did what

### Product and process

| Area                               | Who        | Evidence                                                                                                                                             |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRD                                | jooguh-dev | first commits on 2026-10-26                                                                                                                          |
| Sprint 1–2 backlog (issues #1–#14) | jooguh-dev | issue authorship                                                                                                                                     |
| Shared rules file `AGENTS.md`      | both       | [#19](https://github.com/weiyiships/homebarista/pull/19) (jooguh-dev, closed), [#20](https://github.com/weiyiships/homebarista/pull/20) (weiyiships) |
| Design system `DESIGN.md`          | weiyiships | [#21](https://github.com/weiyiships/homebarista/pull/21)                                                                                             |
| Sprint 3 backlog (#46–#61)         | jooguh-dev | issue authorship                                                                                                                                     |

### Features

| Feature                                   | Who        | PRs                                                                                                                                                                                                                                    |
| ----------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project setup (Next.js, Tailwind, Vitest) | jooguh-dev | [#15](https://github.com/weiyiships/homebarista/pull/15)                                                                                                                                                                               |
| Repository layout                         | jooguh-dev | [#23](https://github.com/weiyiships/homebarista/pull/23)                                                                                                                                                                               |
| Database schema (Drizzle)                 | jooguh-dev | [#24](https://github.com/weiyiships/homebarista/pull/24)                                                                                                                                                                               |
| Menu, customization, order API            | jooguh-dev | [#25](https://github.com/weiyiships/homebarista/pull/25), [#26](https://github.com/weiyiships/homebarista/pull/26), [#27](https://github.com/weiyiships/homebarista/pull/27), [#28](https://github.com/weiyiships/homebarista/pull/28) |
| Status advance and cancel                 | jooguh-dev | [#29](https://github.com/weiyiships/homebarista/pull/29)                                                                                                                                                                               |
| Barista queue                             | weiyiships | [#30](https://github.com/weiyiships/homebarista/pull/30)                                                                                                                                                                               |
| Guest order tracking                      | weiyiships | [#31](https://github.com/weiyiships/homebarista/pull/31)                                                                                                                                                                               |
| Barista history                           | jooguh-dev | [#32](https://github.com/weiyiships/homebarista/pull/32)                                                                                                                                                                               |
| Customer signup (bcrypt, JWT)             | weiyiships | [#33](https://github.com/weiyiships/homebarista/pull/33)                                                                                                                                                                               |
| Home link fix                             | weiyiships | [#35](https://github.com/weiyiships/homebarista/pull/35)                                                                                                                                                                               |
| Drink and milk availability               | jooguh-dev | [#36](https://github.com/weiyiships/homebarista/pull/36)                                                                                                                                                                               |
| Customer login, rate limiting, autofill   | weiyiships | [#37](https://github.com/weiyiships/homebarista/pull/37)                                                                                                                                                                               |
| My Orders                                 | weiyiships | [#38](https://github.com/weiyiships/homebarista/pull/38)                                                                                                                                                                               |
| Playwright E2E + CI                       | weiyiships | [#39](https://github.com/weiyiships/homebarista/pull/39)                                                                                                                                                                               |
| Menu UI refresh                           | weiyiships | [#41](https://github.com/weiyiships/homebarista/pull/41)                                                                                                                                                                               |
| Website layout                            | weiyiships | [#43](https://github.com/weiyiships/homebarista/pull/43)                                                                                                                                                                               |
| README                                    | weiyiships | [#45](https://github.com/weiyiships/homebarista/pull/45)                                                                                                                                                                               |
| OpenAPI + Swagger UI                      | jooguh-dev | [#53](https://github.com/weiyiships/homebarista/pull/53)                                                                                                                                                                               |
| Integration tests                         | jooguh-dev | [#54](https://github.com/weiyiships/homebarista/pull/54)                                                                                                                                                                               |
| Architecture and schema diagrams          | jooguh-dev | [#58](https://github.com/weiyiships/homebarista/pull/58)                                                                                                                                                                               |
| Security scanning and patched postcss     | jooguh-dev | [#55](https://github.com/weiyiships/homebarista/pull/55)                                                                                                                                                                               |
| Repository cleanup                        | jooguh-dev | [#57](https://github.com/weiyiships/homebarista/pull/57)                                                                                                                                                                               |
| Atomic `createOrder`                      | jooguh-dev | [#60](https://github.com/weiyiships/homebarista/pull/60)                                                                                                                                                                               |
| Vitest 4 upgrade                          | jooguh-dev | [#62](https://github.com/weiyiships/homebarista/pull/62)                                                                                                                                                                               |
| AI workflow documentation                 | jooguh-dev | [#64](https://github.com/weiyiships/homebarista/pull/64)                                                                                                                                                                               |
| Vercel deployment and Neon                | weiyiships | production setup; see README › Deployment                                                                                                                                                                                              |

### Reviews

| Reviewer   | Approved PRs                                                                   |
| ---------- | ------------------------------------------------------------------------------ |
| weiyiships | #15, #23, #24, #25, #27, #29, #32, #36, #53, #54, #55, #57, #58, #60, #62, #64 |
| jooguh-dev | #21, #30, #31, #33, #35, #37, #38                                              |

## Regenerating the numbers

```bash
git shortlog -sn --no-merges origin/main
gh pr list --state merged --limit 200 --json author --jq 'group_by(.author.login)[]|"\(.[0].author.login) \(length)"'
gh pr list --state all --limit 200 --json reviews --jq '[.[].reviews[]|select(.state=="APPROVED")|.author.login]|group_by(.)[]|"\(.[0]) \(length)"'
```
