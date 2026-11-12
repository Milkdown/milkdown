---
'@milkdown/plugin-block': patch
---

Keep the block handle on the block under the pointer when the blocks move without a pointer move: after a document change (undo, a remote change) and on scroll or a layout change. The add and drag actions no longer use a position from an older document.
