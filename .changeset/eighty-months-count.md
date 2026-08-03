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
'@milkdown/theme-nord': minor
'@milkdown/prose': minor
'@milkdown/transformer': minor
'@milkdown/utils': minor
---

Milkdown minor release.

## Feat

- feat(crepe): expose the AI feature to a custom toolbar (#2438)
- feat(crepe): derive toolbar shortcuts from keymaps (#2437)
- feat(crepe): give toolbar items an accessible name (#2435)
- feat(crepe): add --crepe-base-font-size theme variable (#2432)
- feat(crepe): allow configuring slash menu root and floating options (#2426)

## Fix

- fix(docs): pin builddocs to 1.x to fix api docs build (#2442)
- fix(prism): re-highlight non-first code blocks on language change (#2440)
- fix(preset): anchor mark input rules to the cursor to prevent paste corruption (#2433)
- fix: preserve schema registration order in extendSchema (#2370) (#2429)
- fix: track innerView.value for reactive re-render in latex inline tooltip (#2425)
- fix: give internal input elements a unique id (#2416) (#2424)
- fix: store list spread attribute as boolean (#2419) (#2423)
- fix: use TextSelection.between for list item cursor placement (#2422)
- fix: resolve list item selection against current doc (#2412)

## Refactor

- refactor(crepe): forward block handle options explicitly (#2427)

## Perf

- perf: reduce per-keystroke cost in keepTableAlignPlugin and prismPlugin (#2436)

## Build

- build: upgrade to typescript 7 native compiler (#2418)

## Ci

- ci(e2e): cache Playwright browsers and merge shard reports (#2431)
