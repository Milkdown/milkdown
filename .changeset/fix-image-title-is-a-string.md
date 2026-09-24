---
'@milkdown/preset-commonmark': patch
'@milkdown/components': patch
---

Read an absent image title and alt as an empty string, so an image without a title stays valid against the schema.
