---
'@milkdown/plugin-listener': patch
---

Fix broken debounce in markdownUpdated and updated listeners. The debounced handler was created inside ProseMirror's `state.apply()`, producing a new wrapper per transaction so successive calls never cancelled each other. Hoisted the handler into the outer closure so a single debounce wrapper is reused across calls.
