# DESIGN.md: Home Barista UI Tokens and Rules

Tokens are defined as CSS variables in `src/app/globals.css`. Use them through Tailwind; never hard-code colors in components.

## Color tokens

| Token                  | Light     | Dark      | Use                    |
| ---------------------- | --------- | --------- | ---------------------- |
| `--background`         | `#fdfbf7` | `#1c1714` | Page background        |
| `--foreground`         | `#2d241e` | `#f4eee6` | Body text              |
| `--primary`            | `#4a2c11` | `#c9935a` | Primary actions, brand |
| `--primary-foreground` | `#fdfbf7` | `#1c1714` | Text on primary        |
| `--muted`              | `#f3ede2` | `#2e2621` | Cards, subtle surfaces |
| `--muted-foreground`   | `#79685b` | `#a6988d` | Secondary text         |
| `--accent`             | `#d97706` | `#f59e0b` | Highlights             |
| `--accent-foreground`  | `#ffffff` | `#1c1714` | Text on accent         |
| `--border`             | `#e8ded1` | `#3d332c` | Dividers, outlines     |

## Order status tokens

| Status    | Token                | Light     | Dark      |
| --------- | -------------------- | --------- | --------- |
| Received  | `--status-received`  | `#6b7280` | `#9ca3af` |
| Brewing   | `--status-brewing`   | `#d97706` | `#f59e0b` |
| Ready     | `--status-ready`     | `#16a34a` | `#22c55e` |
| Cancelled | `--status-cancelled` | `#dc2626` | `#ef4444` |

Status is never conveyed by color alone; always pair it with a text label or icon.

## Rules

- Mobile-first: design at 375px, then scale up.
- Light and dark mode via `prefers-color-scheme`.
- Icons from `lucide-react` only.
- Customize shadcn/ui components with the tokens above; never ship stock styles.
- Touch targets at least 44×44px; text contrast meets WCAG AA.
