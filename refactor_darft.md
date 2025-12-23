# lux-list (JSX)

JSX version — polished header & micro-animations. Accessibility-first features included.

## Overview

- React + JSX + Vite
- Tailwind dark/crimson theme
- Firebase Auth + Firestore
- Share items by email (messages collection), Inbox accept/reject
- Manual migration snapshot tool (client-side)
- Accessibility: Large Mode, High Contrast, Reduced Motion
- Print the grocery list to a local PDF or printer (Print button)

## Quickstart

1. Copy `.env.example` to `.env` and fill Firebase credentials.
2. `npm install`
3. `npm run dev`
4. Open shown localhost URL.

## Test flow

- Sign in as two users (two browsers/incognito).
- Create item as User A → Share by entering User B's email (User B must have signed in at least once).
- User B: Inbox → Check messages → Accept → item appears in B's grocery-items collection.
- Use Accessibility panel to enable Large Mode, High Contrast, or Reduced Motion.
- Use Print button to print or save the grocery list to PDF.

## Notes

- Manual Inbox refresh is used to limit Firestore reads.
- `users/{uid}` docs are created automatically at sign-in, enabling email lookups.
- Firestore rules included — paste into Firebase console.
- Print behavior uses `@media print` rules; printed output contains only the grocery list content.
