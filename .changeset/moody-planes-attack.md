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

- fix(crepe): use the arrays in featureConfigs instead of merging them (#2550)
- fix(crepe): let the CodeMirror theme color the code editor (#2549)
- fix(core): escape text that ends with a space (#2548)
- fix(components): do not show the old picture in a new image (#2547)
- fix(components): recover when a code block fails to initialize (#2545)
- fix(crepe): keep inline math with spaces at its ends as math after a reload (#2540)
- fix(components): keep the alt text of a standalone image (#2521)
- fix(plugin-slash): cancel pending debounced update in SlashProvider.hide() (#2532)
- fix(components): restore the list item selection only onto its own document (#2522)
- fix(components): block handle follow layout (#2523)
- fix(utils): do not throw in insertPos block mode at top-level positions (#2530)
- fix(components): keep newer selection when deferred table cell click fires (#2517)
- fix(preset-gfm): preserve outer strikethrough in nested delete (#2536)
- fix(transformer): keep the longer mark outside when two marks open together (#2537)
- fix(preset-commonmark): preserve outer emphasis and strong marks (#2526)
- fix(preset-commonmark): normalize moved list items at document positions (#2524)
- fix(crepe): keep inline math followed by a digit when markdown is reopened (#2533)
- fix(components): ignore a stale proxyDomURL answer after the src changes (#2515)

## Docs

- docs: ✏️ correct $node factory parameter description (#2518)

## Test

- test(crepe): mock DOM APIs that jsdom does not implement (#2512)
