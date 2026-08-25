---
'@milkdown/plugin-streaming': patch
---

Parse inline math in streamed content and harden the insert-mode fast path.

- `$...$` now reaches the parser when the schema has a `math_inline` node,
  while two-dollar prose (`$5 and $10`, `$PATH and $HOME`, shell `$1 $2`)
  keeps streaming in literally instead of collapsing into a math atom.
- GFM autolink literals (`https://`, `www.`, emails), entity references and
  `:emoji:` shortcodes (when the schema has an `emoji` node) reach the
  parser too instead of streaming in as inert plain text.
- Parser failures during a flush (e.g. `remark-math` registered without a
  math node schema) degrade to raw text instead of throwing and leaving the
  editor locked in streaming state.
- Whitespace restoration around parsed inline content re-attaches exactly
  what CommonMark strips, fixing dropped edge spaces before atoms and
  duplicated non-ASCII whitespace such as U+3000.
