---
'@milkdown/components': minor
'@milkdown/core': minor
'@milkdown/crepe': minor
'@milkdown/ctx': minor
'@milkdown/exception': minor
'@milkdown/kit': minor
'@milkdown/plugin-automd': minor
'@milkdown/plugin-block': minor
'@milkdown/plugin-clipboard': minor
'@milkdown/plugin-collab': minor
'@milkdown/plugin-cursor': minor
'@milkdown/plugin-diff': minor
'@milkdown/plugin-emoji': minor
'@milkdown/plugin-highlight': minor
'@milkdown/plugin-history': minor
'@milkdown/plugin-indent': minor
'@milkdown/plugin-listener': minor
'@milkdown/plugin-prism': minor
'@milkdown/plugin-slash': minor
'@milkdown/plugin-streaming': minor
'@milkdown/plugin-tooltip': minor
'@milkdown/plugin-trailing': minor
'@milkdown/plugin-upload': minor
'@milkdown/preset-commonmark': minor
'@milkdown/preset-gfm': minor
'@milkdown/prose': minor
'@milkdown/react': minor
'@milkdown/theme-nord': minor
'@milkdown/transformer': minor
'@milkdown/utils': minor
'@milkdown/vue': minor
---

Milkdown patch version release.

## Feat

- feat(crepe): switch the code block theme at runtime (#2489)

## Fix

- fix(preset-commonmark): keep hardbreak attrs and map the step range when clearing marks (#2498)
- fix(preset-commonmark): keep remarkLineBreak linear on long runs of spaces (#2504)
- fix(crepe): keep prices like $5 and $10 from becoming inline math (#2497)
- fix(crepe): show the top bar items again after a readonly round trip (#2496)

## Chore

- chore: bump up postcss-nested version to v9 (#2500)

## Ci

- ci: key the Playwright browser cache on the runner image (#2509)
