---
'@milkdown/plugin-prism': patch
---

Stop `prismPlugin` walking the whole document on every transaction.

Its two `findChildren` passes ran above the plugin's own `docChanged` test, so moving the caret paid for both. They are now lazy, and an edit confined to a single code block re-highlights just that block instead of every code block in the document. `configureRefractor` is also honoured by updates, not only by the first render.
