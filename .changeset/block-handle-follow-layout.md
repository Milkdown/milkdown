---
'@milkdown/plugin-block': patch
---

Keep the block handle on the block under the pointer. The handle now looks at the pointer position instead of the middle of the editor, and looks again when the document, the editor size or a scroll position changes. The add and drag actions no longer use a position from an older document.
