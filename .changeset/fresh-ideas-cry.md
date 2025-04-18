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

Milkdown minor release.

## Feat

- feat: enable floating-ui's shift plugin for tooltip by default (#1800)

### Security

- feat: santinize url input (#1808)
- feat: 🎸 add validate props for schema (#1810)

### Vue Migration

If you have a custom stylesheet, you'll need to change the selectors from `milkdown-xxx` to `.milkdown-xxx` because we don't use webcomponents anymore.

Here's a list of all the class-based selectors currently in use that you should use instead of web components:

- `.milkdown-code-block` - For code blocks
- `.milkdown-image-block` - For image blocks
- `.milkdown-image-inline` - For inline images
- `.milkdown-block-handle` - For block handles
- `.milkdown-slash-menu` - For slash commands menu
- `.milkdown-toolbar` - For the editor toolbar
- `.milkdown-link-preview` - For link previews
- `.milkdown-link-edit` - For link editing
- `.milkdown-latex-inline-edit` - For LaTeX editing
- `.milkdown-table-block` - For tables
- `.milkdown-list-item-block` - For list items

- feat: 🎸 migrate toolbar to vue (#1827)
- feat: 🎸 migrate latex to vue (#1826)
- feat: 🎸 migrate slash menu to vue (#1825)
- feat: 🎸 migrate drag handle component to vue (#1824)
- feat: 🎸 migrate table component to vue (#1821)
- feat: 🎸 migrate list item component to vue (#1820)
- feat: 🎸 migrate link tooltip to vue (#1807)
- feat: 🎸 migrate code block to vue (#1806)
- feat: 🎸 migrate image inline to vue (#1804)
- feat: 🎸 migrate image block to vue (#1803)

### Dev

- feat: 🎸 workspace generator (#1795)

## Fix

- fix: 🐛 missing table component cleanup (#1823)
- fix: 🐛 crepe list item cursor style
- fix: 🐛 crepe vue unmount error (#1818)
- fix: 🐛 preserve empty line exception and behavior (#1814)

## Chore

- chore: 🤖 migrate playground to vue (#1828)
- chore: 🤖 bring back build scripts (#1822)
- chore: 🤖 bump up prosemirror tables version
- chore: 🤖 rollup jsx files (#1819)
- chore: 🤖 bump up pnpm to v10.8.1 (#1815)
- chore: 🤖 bump up vite version to v6.2.6 [SECURITY] (#1802)
- chore: 🤖 fix publish
- chore: 🤖 remove nx (#1794)
- chore: 🤖 remove packges level dev pack (#1790)
- chore: 🤖 update prettier config
- chore: 🤖 fix workspace version
- chore: 🤖 optimize build script (#1788)

## Ci

- ci: 🎡 add codegen in fix ci (#1805)
- ci: 🎡 add eslint to lint errors not supported by oxlint (#1812)
