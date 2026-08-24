# My Part — Transactions & Dashboard

## What I built

So basically I was handling the transactions side of things and the dashboard. The idea was to let users actually log their expenses and income and then see a quick summary on the home screen.

## What I did

### Transactions

I built out the whole form for adding a transaction — title, amount, category, date, the works. I also added some basic validation because I didn't want people entering negative amounts or future dates by mistake. There's also a list view that shows everything you've added, and if you click on one, it takes you to a detail page for that specific transaction.

### Dashboard

I set up the dashboard to show the total amount spent and how many transactions you've made. Nothing too crazy, just a quick overview so the user isn't completely in the dark about their spending.

I also lifted the `transactions` state up to `App.jsx` so both the Dashboard and the Transactions page are pulling from the same source. Didn't want to bring in Redux or anything heavy for this — props worked fine here.

## Files I touched

- **`src/components/TransactionForm.jsx`** — new file, this is the form. Uses local state for each field and validates before sending data up.
- **`src/components/TransactionList.jsx`** — new file, maps through transactions and renders them. Shows an empty state if there's nothing yet.
- **`src/pages/Transactions.jsx`** — modified, the main transactions page.
- **`src/pages/TransactionDetail.jsx`** — modified, uses `useParams` to grab the ID from the URL and find the right transaction.
- **`src/pages/Dashboard.jsx`** — modified, uses `reduce` to calculate total spending.
- **`src/App.jsx`** — modified, added the transactions state and the `addTransaction` function here so everything stays in sync.
