# Hello Warmly

> *Blijf verbonden met je dierbaren.*

A gentle web app for staying in touch with the people who matter. Send quick check-ins, see how your loved ones are doing, and get nudges when it's been too long.

## What it does

Modern life is busy and contact slips. Hello Warmly turns *staying in touch* into a low-friction habit:

- **Check-ins** — a one-tap "I'm thinking of you" with a status (good / okay / could use a call)
- **Status overview** — see the last check-in from everyone you care about, at a glance
- **Reminders** — get prompted when someone hasn't been heard from for a while
- **Warm by default** — the UI is calm, soft, and pressure-free

## Tech stack

| Layer | Tool |
|---|---|
| Build | Vite |
| Framework | React 18 + TypeScript |
| Routing | React Router |
| UI primitives | shadcn/ui (Radix) |
| Styling | Tailwind CSS |
| State / queries | TanStack Query |
| Forms | React Hook Form + Zod |

## Quick start

```bash
git clone https://github.com/maxklant/hello-warmly.git
cd hello-warmly
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

### Build & deploy

```bash
npm run build        # production bundle
npm run preview      # preview locally
npm run deploy       # build + publish to GitHub Pages
```

## Project structure

```
src/
├── components/      # UI + feature components
├── pages/           # routes
├── hooks/           # custom hooks
├── lib/             # utilities
└── App.tsx          # router + providers
```

## Status

Early. Feedback welcome via issues.

## License

MIT — see `LICENSE` once added.
