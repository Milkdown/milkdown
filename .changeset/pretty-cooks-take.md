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

- fix: 🐛 overflow codemirror scroll to top (#1967)
- fix: 🐛 polynomial-redos (#1965)
- fix: 🐛 debounce and throttle not call as expected (#1961)

## Chore

- chore: bump up oxlint version to v1 (#1962)

## Ci

- ci: 🎡 enable codeql
- ci: 🎡 fix flaky vitest (#1960)
