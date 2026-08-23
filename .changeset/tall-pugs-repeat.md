---
'@milkdown/plugin-streaming': patch
---

Parse inline math in streamed content. `$` was missing from the inline-token
fast path, so a line whose only markdown construct was `$...$` never reached
the parser and streamed in as literal text.
