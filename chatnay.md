# My Part (Chatnay) — Subscriptions Tracker

## What I worked on

My job was the subscriptions tracker piece — basically helping people keep tabs on their recurring bills (Netflix, gym memberships, that kind of thing) and giving them a heads up if they're paying for the same type of service twice without realizing it.

## What I actually built

1. **Adding & viewing subscriptions**
   - A form where you can log a subscription — cost, category, next billing date, etc.
   - A list that shows everything you've added so far.

2. **The "smart" bits**
   - A small helper that figures out how many days are left before a subscription renews, so I can warn people if it's coming up soon.
   - Another helper that goes through all your subscriptions and flags it if you've got more than one in the same category (like two streaming services you forgot about).

## Files I touched

### `src/daysUntilBilling.js` (new)
Takes a date and spits out how many days are left until then. I pulled this out into its own function mostly because `Date` in JS gets messy fast and I didn't want that logic buried inside a component.

### `src/findDuplicateCategories.js` (new)
Loops through the subscriptions, tallies up how many times each category shows up, and returns whichever ones show up more than once. Keeps the "hey you're double paying" logic separate from the UI so it's easier to test/reason about.

### `src/components/SubscriptionForm.jsx` (new)
The form for adding a new subscription — name, amount, category, billing date. Does some basic validation before it hands the data back up to the parent.

### `src/components/SubscriptionList.jsx` (new)
Renders the list and handles the warnings — if `findDuplicateCategories` comes back with anything, it shows a red warning box, and if a subscription's `daysUntilBilling` is 3 or under, the text goes red too.

### `src/pages/Subscriptions.jsx` & `SubscriptionDetail.jsx` (modified)
The route-level pages — just wiring the form and list together, plus a detail view for a single subscription.

### `src/App.jsx` (modified)
Added the `subscriptions` array to state so the data doesn't disappear when you navigate between pages.
