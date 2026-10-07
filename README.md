# Baby name ranker

A single static page for collecting baby name suggestions, ranking the names, and
showing the combined result.

## How it works

1. Each person enters a name and adds suggestions on the Names tab.
2. On the Veto tab, each person can veto names before the ranking — one
   veto removes a name for both of you. Only your own vetoes are undoable.
3. Copy the share link and send it to the other person in chat.
4. On the My ranking tab, each person ranks all names with quick duels: the
   site shows two names at a time and you tap the one you prefer. Elo ratings
   run in the background and matchmaking serves the closest duel each time.
   No name repeats in two consecutive questions, and the run stops once the
   answers imply the full ranking. The arrows allow small nudges afterwards.
5. The Results tab unlocks when everyone has ranked every remaining name. It shows the
   combined order (Borda count: first place gives N points, last place 1 point),
   the average rank, and each person's ranks.

## Privacy

The site is an empty shell. Names and rankings exist only in the share links and
in each device's local storage. Share links carry the current rankings too, so
keep them between the two of you.

## Develop

Open `index.html` in a browser. Run `node smoke-test.js` after changes.
