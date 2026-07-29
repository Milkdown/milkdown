---
'@milkdown/preset-gfm': patch
---

Stop `keepTableAlignPlugin` walking the whole document on every change.

It now narrows to the tables the change actually touched, and only appends a transaction when a cell needs re-aligning — previously it appended an empty one to every document change, costing an extra state application per keystroke.
