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
'@milkdown/plugin-diff': patch
'@milkdown/plugin-emoji': patch
'@milkdown/plugin-highlight': patch
'@milkdown/plugin-history': patch
'@milkdown/plugin-indent': patch
'@milkdown/plugin-listener': patch
'@milkdown/plugin-prism': patch
'@milkdown/plugin-slash': patch
'@milkdown/plugin-streaming': patch
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

- fix(crepe): avoid polynomial ReDoS when normalizing provider baseURL (#2366)
- fix(components): lazy-init SVG sanitizer to keep preview-panel SSR-safe (#2365)

## Chore

- chore(deps): bump fast-uri to 3.1.2 to patch GHSA-v39h-62p7-jpjc (#2367)
- chore: Pin dependencies (#2364)
- chore: config renovate to pin github actions (#2363)
