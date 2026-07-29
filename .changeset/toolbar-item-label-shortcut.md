---
'@milkdown/crepe': minor
---

Give toolbar items an accessible name. `ToolbarItem` gains optional `label` and `shortcut`, rendered as `title`, `aria-label` and `aria-keyshortcuts`, and each button now carries `data-toolbar-item` with its key. The built-in items ship English labels, overridable per item for localization.
