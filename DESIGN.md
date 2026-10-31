---
version: alpha
name: Home Barista
description: A full-stack website for small gatherings where guests order coffee, the host runs a live barista queue, and everyone sees order status update in real time.
colors:
  primary: "#5B3A29"
  secondary: "#76655A"
  tertiary: "#C8742B"
  neutral: "#FFFFFF"
  surface: "#F6F0E7"
  on-surface: "#2B1D16"
  border: "#E4D9CB"
  status-received: "#5F6B7A"
  status-brewing: "#A15C07"
  status-ready: "#2E7D32"
  error: "#B3261E"
typography:
  display:
    { fontFamily: Inter, fontSize: 56px, fontWeight: 700, lineHeight: 1.1 }
  headline-lg:
    { fontFamily: Inter, fontSize: 36px, fontWeight: 700, lineHeight: 1.2 }
  headline-md:
    { fontFamily: Inter, fontSize: 24px, fontWeight: 600, lineHeight: 1.3 }
  body-md:
    { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 1.5 }
  label-md:
    { fontFamily: Inter, fontSize: 14px, fontWeight: 500, lineHeight: 1.3 }
rounded: { sm: 6px, md: 12px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 32px, xl: 64px }
components:
  button-primary:
    {
      backgroundColor: "{colors.primary}",
      textColor: "{colors.neutral}",
      typography: "{typography.label-md}",
      rounded: "{rounded.sm}",
      padding: 12px 20px,
    }
  button-primary-hover:
    { backgroundColor: "{colors.on-surface}", textColor: "{colors.neutral}" }
  button-secondary:
    {
      backgroundColor: "{colors.neutral}",
      textColor: "{colors.primary}",
      typography: "{typography.label-md}",
      rounded: "{rounded.sm}",
      padding: 12px 20px,
    }
  navbar:
    {
      backgroundColor: "{colors.neutral}",
      textColor: "{colors.on-surface}",
      padding: 16px 32px,
    }
  drink-card:
    {
      backgroundColor: "{colors.neutral}",
      textColor: "{colors.on-surface}",
      typography: "{typography.body-md}",
      rounded: "{rounded.md}",
      padding: 24px,
    }
  order-card:
    {
      backgroundColor: "{colors.neutral}",
      textColor: "{colors.on-surface}",
      typography: "{typography.body-md}",
      rounded: "{rounded.md}",
      padding: 16px,
    }
  status-badge:
    {
      textColor: "{colors.neutral}",
      typography: "{typography.label-md}",
      rounded: "{rounded.sm}",
      padding: 4px 10px,
    }
---

## Overview

A warm, calm café website, not a generic dashboard: cream page, white cards, espresso-brown actions, one caramel accent. Guests see a menu like a café board; the barista sees a glanceable work queue. Orders are the content; decoration stays out of the way.

## Colors

- **Primary** {colors.primary}: primary buttons, links, selected options, focus rings.
- **Surface** {colors.surface}: page background. Cards and navbar are {colors.neutral} with a {colors.border} border.
- **On-surface** {colors.on-surface}: body text and headings. **Secondary** {colors.secondary}: descriptions, timestamps, helper text.
- **Tertiary** {colors.tertiary}: the one accent per screen (active stepper step, new-order highlight). Never text on cream.
- **Status:** received {colors.status-received}, brewing {colors.status-brewing}, ready {colors.status-ready}, cancelled {colors.error}. Only on badges and the stepper, always with a label and icon.

## Typography

Inter only, via `next/font` with a system sans-serif fallback. Page titles {typography.headline-lg}, headings {typography.headline-md}, text {typography.body-md}, buttons and labels {typography.label-md}. {typography.display} is only for the guest name and order ID on the status page.

## Layout

Desktop-first, responsive website: design at 1280px first, then make it work on tablets and phones. Content is centered, 1200px max width, {spacing.lg} page padding.

- **Menu:** drink-card grid (3 / 2 / 1 columns). Customization opens in a right-side drawer on desktop, a full-width dialog on phones.
- **Order status:** one centered 640px column with badge, stepper, queue position, and summary.
- **Barista queue:** full-width board with Received, Brewing, and Ready columns, oldest on top.
- **Availability and history:** a single 800px column of rows or a table.

## Elevation & Depth

Mostly flat. Cards use a 1px border, not a shadow. One soft shadow only, for drawers, dialogs, and toasts.

## Shapes

{rounded.sm} on buttons, inputs, toggles, and badges; {rounded.md} on cards, drawers, and dialogs. No pills.

## Components

One primary button per view ("Place order", "Start brewing"); everything else is secondary. Drink cards show name, description, and a muted "Unavailable" state. Barista order cards show guest name, short ID, drink and options, time waiting, and one next-action button. Build these once and reuse them.

## Do's and Don'ts

- Do keep WCAG AA contrast (4.5:1 text, 3:1 UI) and a visible 2px {colors.primary} focus ring.
- Do design loading, empty, error, and disabled states for every screen.
- Do use `next/font` and `next/image` so assets are optimized on Vercel.
- Don't hard-code hex values in components; use the Tailwind theme tokens.
- Don't use status colors for decoration, or color alone to show status.
- Don't add gradients, a second accent color, or prices anywhere.
