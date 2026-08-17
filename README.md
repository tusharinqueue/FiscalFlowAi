# FiscalFlowAi

A personal finance web app I'm building for my college project. The idea is to have everything in one place — tracking expenses, splitting bills with friends, managing subscriptions, and setting savings goals.

Built with React + Vite. No backend, everything runs in the browser.

---

## What it does

- **Transactions** — add and track your expenses/income with categories and dates
- **Groups** — create a group, add members, log shared expenses, and see who owes what
- **Subscriptions** — keep track of all your subscriptions and when they're billing next
- **Goals** — set a savings goal with a target amount and deadline, track progress

---

## Tech stack

- React (Vite)
- React Router v6
- Plain CSS (no Tailwind or UI libraries)
- localStorage for data persistence

---

## How to run it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Project structure

```
src/
├── components/common/   # shared UI components (Button, Card, EmptyState)
├── pages/               # one file per route/page
├── modules/             # feature logic split by module
│   ├── transactions/
│   ├── groups/
│   ├── subscriptions/
│   └── goals/
├── layout/              # Navbar and PageWrapper
└── data/                # mock data
```

---

## License

MIT — see [LICENSE](./LICENSE)
