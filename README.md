# 💸 FiscalFlow AI – Personal Finance & Investment Dashboard

**Member 1 Scope – Evaluation 1 Progress Report**

Welcome to the **FiscalFlow AI** project repository. This document details the step-by-step progress completed for **Evaluation 1** under **Member 1**, organized across 4 development days.

---

## 📌 Project Overview

FiscalFlow AI is a modern personal finance application built to help users manage income, track expenses, calculate net balances, and analyze category-wise spending. 

All Member 1 work is strictly isolated in `src/member1/` using beginner-friendly, evaluation-ready React code (`useState`, `useEffect`, `localStorage`, `.map()`, `.filter()`, `.reduce()`).

---

## 📅 Day-Wise Progress Log

### 🛠️ Day 1: Project Setup, Architecture & Custom Theme Engine
- **Isolated Directory Architecture**: Created `src/member1/` structure with `components/`, `pages/`, `styles/`, and `hooks/` to ensure zero conflict with other team members.
- **Dark/Light Theme System (`theme1.css`, `useTheme1.js`, `ThemeToggle1.jsx`)**: Designed a modern CSS custom property token engine supporting dark and light themes with smooth transitions and persistent state in `localStorage`.
- **Frontend Authentication & Onboarding (`LoginModal1.jsx`)**: Built a frontend-only login modal that collects user details (Name, Email, Password), validates input, displays a welcome animation, and stores user sessions locally.
- **Layout & Routing (`Member1Layout.jsx`, `Navbar1.jsx`)**: Implemented a sticky navigation bar with active page links, user avatar initials, and theme toggling under `/member1` routes.

---

### 💳 Day 2: Complete Transactions Management (CRUD & LocalStorage)
- **State & Storage Core (`Transactions1.jsx`)**: Built a single, self-contained transactions controller utilizing basic React state (`useState`) and browser storage (`localStorage`).
- **Add Transaction**: Designed a form supporting Title, Amount (₹), Type (`income` / `expense`), Category selection (Food, Transport, Shopping, Bills, Salary, Entertainment, Other), Date, and optional Description.
- **Form Validation**: Implemented straightforward validation checking for non-empty fields, positive amounts, valid dates, and category selection.
- **View & List Rendering**: Displayed transactions using `.map()` with formatted Indian Rupee amounts, custom badges, and formatted dates.
- **Edit Transaction**: Added inline editing capability pre-populating form state and replacing updated objects using `.map()`.
- **Delete Transaction**: Integrated item deletion with `window.confirm()` dialogs and array filtering (`.filter()`).
- **Summary Ribbon**: Calculated live totals for Total Transactions, Total Income, Total Expenses, and Net Balance using `.reduce()`.

---

### 📊 Day 3: Connected Dashboard, Category Analytics & Code Cleanup
- **Live LocalStorage Sync (`Dashboard1.jsx`)**: Connected the Dashboard page to read directly from the shared `'m1-transactions'` localStorage key.
- **Personalized Header Banner**: Added time-aware greetings (*Good Morning / Afternoon / Evening*) with the logged-in user's name.
- **Dynamic Metric Cards**:
  1. **Total Balance** (`Total Income - Total Expenses`)
  2. **Total Income** (`type === 'income'`)
  3. **Total Expenses** (`type === 'expense'`)
  4. **Savings** (`Balance > 0 ? Balance : 0`)
- **Recent Transactions Feed**: Rendered the top 5 newest transactions ordered by date with a "View All" link navigating to `/member1/transactions`.
- **Category Spending Breakdown**: Computed real-time category totals using `.reduce()` and rendered visual spending progress bars proportional to category amounts.
- **Empty State Handling**: Provided helpful empty state screens on both Dashboard and Transactions pages when no data is present.
- **Codebase Optimization**: Purged unused files (`SummaryCard1.jsx`, `CategoryBadge1.jsx`, `TransactionForm1.jsx`, `TransactionRow1.jsx`, `dashboard1.css`), reducing bundle size and keeping code clean.
- **Build Verification**: Tested production compilation with `npm run build` (Passed with 0 errors).

---

### 🐛 Day 4: Bug Fixes, UI Polish & Environment Stability
- **Category Dropdown UI Fix**: Patched a browser-level UI bug where native HTML `<select>` dropdown `<option>` items defaulted to a white background with white text in Dark Mode. Added explicit CSS styles (`.t1-field select option`) to match the dark theme and ensure legibility.
- **Robust Delete Confirmation**: Removed the reliance on the browser's native `window.confirm()` popup for deleting transactions, as it is frequently blocked silently by modern browser preview iframes (causing the delete button to fail).
- **Inline Confirmation UI**: Engineered a seamless, pure-React inline confirmation state (`[itemToDelete, setItemToDelete]`) that safely asks for user confirmation (**Sure? [Yes] [No]**) directly inside the transaction row before applying the `.filter()` deletion.

---

## 📁 Member 1 Directory Structure (`src/member1/`)

```text
src/member1/
├── components/
│   ├── LoginModal1.jsx       # Auth modal & user onboarding
│   ├── Member1Layout.jsx     # Shared layout wrapper
│   ├── Navbar1.jsx           # Sticky navigation header
│   └── ThemeToggle1.jsx      # Sun/Moon theme switcher
├── hooks/
│   ├── useLocalStorage1.js   # LocalStorage sync hook
│   └── useTheme1.js          # Body theme manager hook
├── pages/
│   ├── Dashboard1.jsx        # Main summary dashboard
│   ├── DashboardPage1.jsx    # Route wrapper for Dashboard
│   ├── Transactions1.jsx     # Transactions CRUD page
│   └── TransactionsPage1.jsx # Route wrapper for Transactions
└── styles/
    ├── dash1.css             # Dashboard styles
    ├── theme1.css            # CSS variable tokens (dark/light)
    ├── transactions1.css     # Navbar & modal styles
    └── txnpage1.css          # Transactions page styles
```

---

## 🚀 How to Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open Member 1 dashboard in browser:
   `http://localhost:5173/member1`
