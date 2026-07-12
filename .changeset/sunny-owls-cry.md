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

Milkdown fix version release.

## Feat

- feat: add getMarkRange and selection snapshot test DSL to prose toolkit (#2406)

## Fix

- fix: cancel list item RAF on destroy (#2409)
- fix: sanitize unsafe link hrefs and emoji html to prevent stored XSS (#2410)
- fix: serialize marks spanning multiple nodes as one continuous span (#2405)
- fix: renovate config
