---
'@milkdown/components': patch
'@milkdown/core': patch
'@milkdown/crepe': patch
'@milkdown/ctx': patch
'@milkdown/exception': patch
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
'@milkdown/prose': patch
'@milkdown/react': patch
'@milkdown/theme-nord': patch
'@milkdown/transformer': patch
'@milkdown/utils': patch
'@milkdown/vue': patch
---

Milkdown patch version release.

## Fix

- fix(components): stop non-interactive list markers from swallowing pointer events (#2471)
- fix(deps): update markdown serializer for stable autolinks (#2482)
- fix(preset-commonmark): read an absent image title as an empty string (#2478)
- fix(plugin-tooltip): a throttled update must not skip a real state change (#2485)

## Chore

- chore: bump up all non-major dependencies (#2479)

## Perf

- perf(components): restore list item caret once per view per frame (#2484)
