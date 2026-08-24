# Devlog: Groups & Bill Splitting (Person 2)

Okay so for my part of the project (Person 2), I worked on the shared expense tracker. Basically, I had to figure out how to let users make groups, add their friends, and then log expenses and split the bills. It was pretty tough but I finally got it working!!

## What I actually did:

1. **Making Groups**
   - I built a form to create groups. Managing the array of members in React state was kinda confusing at first.
   - You can type a friend's name and hit "Add" and it shows up in a list before you submit the whole group. 

2. **Splitting the money**
   - Built another form for adding expenses. The hardest part was making a dropdown that only shows the people actually in the group so you can pick who paid.
   - I wrote this separate math function to split the bill equally. Doing the math inside the React component was getting super messy, so I moved it to its own file.
   - The UI on the group page now shows exactly who owes money and who needs to be paid back. Getting those balances to calculate correctly gave me a huge headache lol.

## Files I worked on:

- `src/splitEqually.js`: I made this pure JS file just to handle the math for splitting a total amount between an array of people. Read online that keeping complex math out of React components is a "best practice" so I tried that.
- `src/components/GroupForm.jsx`: The form where you make a new group. It just pushes names into an array in the local state.
- `src/components/ExpenseForm.jsx`: The expense form. It takes the members array from the group and loops through it to make the `<select>` options.
- `src/pages/Groups.jsx` & `GroupDetail.jsx`: I updated these to show the groups. In `GroupDetail`, it loops through every single expense and calls my `splitEqually` function to calculate the final balances. 
- `src/App.jsx` & `src/index.css`: Added some state to `App.jsx` so the data doesn't disappear when you click to a different page. Also added some quick CSS to make the balances colored.

Overall, it works! Don't look too closely at the CSS but the React stuff and the math is solid.
