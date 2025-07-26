---
'@milkdown/components': patch
'@milkdown/core': patch
'@milkdown/crepe': patch
'@milkdown/ctx': patch
'@milkdown/exception': patch
'@milkdown/react': patch
'@milkdown/vue': patch
'@milkdown/kit': patch
'@milkdown/plugin-automd': patch
'@milkdown/plugin-block': patch
'@milkdown/plugin-clipboard': patch
'@milkdown/plugin-collab': patch
'@milkdown/plugin-cursor': patch
'@milkdown/plugin-emoji': patch
'@milkdown/plugin-history': patch
'@milkdown/plugin-indent': patch
'@milkdown/plugin-listener': patch
'@milkdown/plugin-prism': patch
'@milkdown/plugin-slash': patch
'@milkdown/plugin-tooltip': patch
'@milkdown/plugin-trailing': patch
'@milkdown/plugin-upload': patch
'@milkdown/preset-commonmark': patch
'@milkdown/preset-gfm': patch
'@milkdown/theme-nord': patch
'@milkdown/prose': patch
'@milkdown/transformer': patch
'@milkdown/utils': patch
---

Milkdown patch version release.

## Fix

- fix: 🐛 list component mount logic on safari (#2042)
- fix: 🐛 html in blockquote error (#2041)
- fix: 🐛 improve input rule of strong mark (#2036)
- fix: 🐛 trikethrough matching on intra-word tilde (#2031)
- fix: 🐛 emphasis matching on intra-word underscores (#2029)
- fix: 🐛 copy link event binding error (#2019)

## Refactor

- refactor: 💡 improve implementation of table dnd (#2017)

## Test

- test: 💍 add test case for trim spaces (#2035)
- test: 💍 add e2e for table (#2023)
