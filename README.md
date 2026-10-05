# Baby name ranker

A single static page for collecting baby name suggestions, ranking the names, and
showing the combined result.

## How it works

1. Each person enters a name and adds suggestions on the Names tab.
2. Copy the share link and send it to the other person in chat.
3. Each person orders all names on the My ranking tab and confirms the order.
4. The Results tab unlocks when everyone has ranked every name. It shows the
   combined order (Borda count: first place gives N points, last place 1 point),
   the average rank, and each person's ranks.

## Privacy

The site is an empty shell. Names and rankings exist only in the share links and
in each device's local storage. Share links carry the current rankings too, so
keep them between the two of you.

## Develop

Open `index.html` in a browser. Run `node smoke-test.js` after changes.
