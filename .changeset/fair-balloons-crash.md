---
'@milkdown/components': minor
'@milkdown/core': minor
'@milkdown/crepe': minor
'@milkdown/ctx': minor
'@milkdown/exception': minor
'@milkdown/react': minor
'@milkdown/vue': minor
'@milkdown/kit': minor
'@milkdown/plugin-automd': minor
'@milkdown/plugin-block': minor
'@milkdown/plugin-clipboard': minor
'@milkdown/plugin-collab': minor
'@milkdown/plugin-cursor': minor
'@milkdown/plugin-emoji': minor
'@milkdown/plugin-highlight': minor
'@milkdown/plugin-history': minor
'@milkdown/plugin-indent': minor
'@milkdown/plugin-listener': minor
'@milkdown/plugin-prism': minor
'@milkdown/plugin-slash': minor
'@milkdown/plugin-tooltip': minor
'@milkdown/plugin-trailing': minor
'@milkdown/plugin-upload': minor
'@milkdown/preset-commonmark': minor
'@milkdown/preset-gfm': minor
'@milkdown/theme-nord': minor
'@milkdown/prose': minor
'@milkdown/transformer': minor
'@milkdown/utils': minor
---

Milkdown minor version release.

## Feat

- feat: add support for top bar (#2300)
- feat(crepe): integrate upload plugin in crepe (#2301)
- feat(image-block): add maxWidth and maxHeight config options (#2291)

## Fix

- fix(preset-commonmark): ordered list label ignores start attribute (#2302)
- fix(prose): fix Enter key in lists on Chrome Android (#2293)
- fix(preset-commonmark): preserve ordered list custom start number (#2292)

## Refactor

- refactor: fix some useless checks (#2298)
- refactor: use a meaningful function to explain why we need h and fragment (#2297)

## Ci

- ci: remove eslint (#2290)
