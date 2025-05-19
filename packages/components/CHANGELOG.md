# @milkdown/components

## 7.10.5

### Patch Changes

- ba00e24: Milkdown patch version release.

  ## Docs

  - docs: add deep wiki link in readme

  ## Fix

  - fix: 🐛 set readonly mode before editor loaded will cause error (#1890)

  ## Refactor

  - refactor: 💡 use clipboard serialized from prosemirror (#1890)

- Updated dependencies [ba00e24]
  - @milkdown/core@7.10.5
  - @milkdown/ctx@7.10.5
  - @milkdown/exception@7.10.5
  - @milkdown/plugin-tooltip@7.10.5
  - @milkdown/preset-commonmark@7.10.5
  - @milkdown/preset-gfm@7.10.5
  - @milkdown/prose@7.10.5
  - @milkdown/transformer@7.10.5
  - @milkdown/utils@7.10.5

## 7.10.4

### Patch Changes

- bf55842: Milkdown patch version release.

  ## Fix

  - fix: 🐛 readonly mode for code block component (#1886)
  - fix: 🐛 check max valid position when updating slash menu (#1885)

- Updated dependencies [bf55842]
  - @milkdown/core@7.10.4
  - @milkdown/ctx@7.10.4
  - @milkdown/exception@7.10.4
  - @milkdown/plugin-tooltip@7.10.4
  - @milkdown/preset-commonmark@7.10.4
  - @milkdown/preset-gfm@7.10.4
  - @milkdown/prose@7.10.4
  - @milkdown/transformer@7.10.4
  - @milkdown/utils@7.10.4

## 7.10.3

### Patch Changes

- 36f9673: Milkdown patch version release.

  ## Fix

  - fix: 🐛 should hide toolbar when link tooltip is shown (#1871)
  - fix: 🐛 nord theme in nuxt (#1869)

- Updated dependencies [36f9673]
  - @milkdown/core@7.10.3
  - @milkdown/ctx@7.10.3
  - @milkdown/exception@7.10.3
  - @milkdown/plugin-tooltip@7.10.3
  - @milkdown/preset-commonmark@7.10.3
  - @milkdown/preset-gfm@7.10.3
  - @milkdown/prose@7.10.3
  - @milkdown/transformer@7.10.3
  - @milkdown/utils@7.10.3

## 7.10.2

### Patch Changes

- 231c534: Milkdown patch version release.

  ## Fix

  - fix: 🐛 slash menu icon style (#1862)
  - fix: 🐛 crepe slash menu and toolbar z-index (#1864)

  ## Chore

  - chore: improve comments

  ## Docs

  - docs: ✏️ add api docs folder (#1860)

- Updated dependencies [231c534]
  - @milkdown/core@7.10.2
  - @milkdown/ctx@7.10.2
  - @milkdown/exception@7.10.2
  - @milkdown/plugin-tooltip@7.10.2
  - @milkdown/preset-commonmark@7.10.2
  - @milkdown/preset-gfm@7.10.2
  - @milkdown/prose@7.10.2
  - @milkdown/transformer@7.10.2
  - @milkdown/utils@7.10.2

## 7.10.1

### Patch Changes

- 02a756a: Milkdown patch version release.

  ## Fix

  - fix: missing command chain tsdoc (#1857)

- Updated dependencies [02a756a]
  - @milkdown/core@7.10.1
  - @milkdown/ctx@7.10.1
  - @milkdown/exception@7.10.1
  - @milkdown/plugin-tooltip@7.10.1
  - @milkdown/preset-commonmark@7.10.1
  - @milkdown/preset-gfm@7.10.1
  - @milkdown/prose@7.10.1
  - @milkdown/transformer@7.10.1
  - @milkdown/utils@7.10.1

## 7.10.0

### Minor Changes

- 3296822: Milkdown minor version release.

  ## Feat

  - feat: 🎸 add command inline and chain (#1852)

  ## Fix

  - fix: 🐛 list item component should be focused when created (#1854)

### Patch Changes

- Updated dependencies [3296822]
  - @milkdown/core@7.10.0
  - @milkdown/ctx@7.10.0
  - @milkdown/exception@7.10.0
  - @milkdown/plugin-tooltip@7.10.0
  - @milkdown/preset-commonmark@7.10.0
  - @milkdown/preset-gfm@7.10.0
  - @milkdown/prose@7.10.0
  - @milkdown/transformer@7.10.0
  - @milkdown/utils@7.10.0

## 7.9.1

### Patch Changes

- fa3be68: Milkdown patch version release.

  ## Fix

  - fix: empty table row (#1849)
  - fix: empty line in list (#1848)

  ## Chore

  - chore: cleanup unused dependencies (#1846)
  - chore: bump up vite version to v6.3.4 [SECURITY] (#1844)
  - chore: bump up pnpm to v10.10.0 (#1837)

  ## Docs

  - docs: update jetbrains brand links in readme (#1840)

- Updated dependencies [fa3be68]
  - @milkdown/core@7.9.1
  - @milkdown/ctx@7.9.1
  - @milkdown/exception@7.9.1
  - @milkdown/plugin-tooltip@7.9.1
  - @milkdown/preset-commonmark@7.9.1
  - @milkdown/preset-gfm@7.9.1
  - @milkdown/prose@7.9.1
  - @milkdown/transformer@7.9.1
  - @milkdown/utils@7.9.1

## 7.9.0

### Minor Changes

- dc7f7ae: Milkdown minor release.

  ## Feat

  - feat: 🎸 enable floating-ui's shift plugin for tooltip by default (#1800), thanks to @KBHertzog.

  ### Security

  - feat: 🎸 santinize url input (#1808)
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

### Patch Changes

- Updated dependencies [dc7f7ae]
  - @milkdown/core@7.9.0
  - @milkdown/ctx@7.9.0
  - @milkdown/exception@7.9.0
  - @milkdown/plugin-tooltip@7.9.0
  - @milkdown/preset-commonmark@7.9.0
  - @milkdown/preset-gfm@7.9.0
  - @milkdown/prose@7.9.0
  - @milkdown/transformer@7.9.0
  - @milkdown/utils@7.9.0

## 7.8.0

### Minor Changes

- eeb7c58: Milkdown minor version release.

  ## Feat

  - feat: 🎸 add bike-style virtual cursor (#1770)

  ## Fix

  - fix: crepe inline code padding
  - fix: 🐛 google doc paste (#1773)
  - fix: 🐛 should not display slash menu if has following chars (#1772)
  - fix: remove inline code mark inclusive config (#1771)

  ## Chore

  - chore: remove deprecated diagram package (#1786)

### Patch Changes

- Updated dependencies [eeb7c58]
  - @milkdown/exception@7.8.0

## 7.7.0

### Minor Changes

- 58e628c: Milkdown minor release.

  ## Feat

  - feat: add preserve empty line plugin (#1765)
  - feat: check for isImageBlockEnabled and isTableEnabled (#1761)

  ## Fix

  - fix: 🐛 backward select text in table cell (#1766)
  - fix: table enter and minimal rows (#1738)

  ## Chore

  - chore: update readme

  ## Style

  - style: 💄 enable more oxlint rules (#1767)

### Patch Changes

- Updated dependencies [58e628c]
  - @milkdown/exception@7.7.0

## 7.6.4

### Patch Changes

- fbd3cf7: Milkdown patch version release.

  ## Fix

  - fix: multi block handle (#1731)
  - fix: should not support blockquote in list (#1730)
  - fix: image upload button stop working when selected (#1718)
  - fix: should disable image resizer for readonly mode (#1717)

  ## Chore

  - chore: bump up refractor version to v5 (#1727)
  - chore: bump up shiki version to v3 (#1691)

  ## Build

  - build: disable minification #1709 (#1710)

- Updated dependencies [fbd3cf7]
  - @milkdown/exception@7.6.4

## 7.6.3

### Patch Changes

- 288bbed: Release milkdown patch version.

  ## Feat

  - feat: add math in slash menu (#1686)
  - feat: 🎸 add root option for tooltip,slash,block (#1681)

  ## Fix

  - fix: remove slugify for performance consideration (#1680)
  - fix: react and vue destroy when using crepe (#1679)
  - fix: allow running in insecure context (#1666)

  ## Chore

  - chore: Lock file maintenance (#1685)
  - chore: bump up pnpm to v10.4.1 (#1684)
  - chore: bump up all non-major dependencies to v20.4.4 (#1678)
  - chore: bump up pnpm to v10.4.0 (#1677)
  - chore: bump up all non-major dependencies to v20.4.3 (#1672)
  - chore: update readme
  - chore: use short nanoid (#1668)
  - chore: bump up pnpm to v10.3.0 (#1663)
  - chore: Lock file maintenance (#1661)
  - chore: bump up all non-major dependencies (#1660)
  - chore: bump up pnpm/action-setup action to v4.1.0 (#1659)
  - chore: bump up all non-major dependencies (#1658)
  - chore: bump up vitest version to v3.0.5 [SECURITY] (#1656)
  - chore: bump up pnpm to v10 (#1654)
  - chore: bump up pnpm to v9.15.5 (#1652)
  - chore: Lock file maintenance (#1653)

- Updated dependencies [288bbed]
  - @milkdown/exception@7.6.3

## 7.6.2

### Patch Changes

- 061f740: Release milkdown patch version.

  ## Feat

  - feat: make integrations accept crepe editor (#1649)
  - feat: add crepe ctx to make users can access crepe from editor (#1648)

  ## Fix

  - fix: 🐛 incompatibility between Promise.resolve and angular change detection mechanism (#1647)
  - fix: 🐛 remark transform error when no code block lang (#1642)

  ## Chore

  - chore: bump up tailwindcss version to v4 (#1638)
  - chore: bump up all non-major dependencies to v20.4.0 (#1646)
  - chore: Lock file maintenance (#1645)
  - chore: bump up all non-major dependencies to v20.3.3 (#1641)
  - chore: bump up vite version to v6.0.9 [SECURITY] (#1636)
  - chore: bump up shiki version to v2 (#1634)
  - chore: Lock file maintenance (#1633)
  - chore: bump up all non-major dependencies to v20.3.2 (#1632)
  - chore: bump up katex version to v0.16.21 [SECURITY] (#1631)

- Updated dependencies [061f740]
  - @milkdown/exception@7.6.2

## 7.6.1

### Patch Changes

- @milkdown/exception@7.6.1

## 7.6.0

### Minor Changes

- 9421082: Minor version release for milkdown.

  ## Feat

  - feat: 🎸 add `on` api for crepe (#1622)
  - feat: add markdown inspector in storybook (#1619)
  - feat: add latex feature for crepe (#1613)

  ## Chore

  - chore: use kit in integrations (#1626)
  - chore: bump prosemirror versions (#1621)
  - chore: remove math plugin since we provides latex in crepe (#1617)
  - chore: remove husky install since it's deprecated (#1616)

### Patch Changes

- Updated dependencies [9421082]
  - @milkdown/exception@7.6.0

## 7.5.9

### Patch Changes

- a3dde0c: Enable image proxy.
- Updated dependencies [a3dde0c]
  - @milkdown/exception@7.5.9

## 7.5.8

### Patch Changes

- db4ec60: Bug fixes and api improvements.

  # Crepe

  - Add image proxy config.
  - Fix link preview text not properly truncated.
  - Fix list item unstable selection.
  - Fix button types.
  - Reset index when slash menu out of bound.

  # Core

  - Prevent duplicate ids in the editor.
  - Allow options to floating ui.
  - Add undoable input rules.

- Updated dependencies [db4ec60]
  - @milkdown/exception@7.5.8

## 7.5.5

### Patch Changes

- 56af3f5: Optimize table drag behavior

## 7.5.4

### Patch Changes

- 705c263: Fix plugin block bugs

## 7.5.3

### Patch Changes

- 9cb69ae: Fix the link component will make the editor autofocus when loaded

## 7.5.0

### Minor Changes

- be28e7b: All in one kit package and crepe config.

  - Add all-in-one kit package.
  - Add crepe config for:
    - Widgets texts
    - Icons
  - Add new frame theme for crepe.
  - Add new table component.
  - Add GFM support for crepe.

### Patch Changes

- Updated dependencies [be28e7b]
  - @milkdown/exception@7.5.0
  - @milkdown/utils@7.5.0

## 7.4.0

### Minor Changes

- 849669b: ## Headless components and Crepe polish

  ### Feature

  #### Migrate from tippy to floating ui

  - feat: replace tippy with floating ui in plugin block in https://github.com/Milkdown/milkdown/pull/1356
  - feat: migrate tippy to floating ui in plugin slash in https://github.com/Milkdown/milkdown/pull/1375
  - feat: add offset for floating ui in https://github.com/Milkdown/milkdown/pull/1384
  - feat: migrate to floating ui in plugin tooltip in https://github.com/Milkdown/milkdown/pull/1373

  #### Components Improvements

  - feat: optimize code block behavior in https://github.com/Milkdown/milkdown/pull/1388
  - fix: image caption bug in https://github.com/Milkdown/milkdown/pull/1382
  - fix: list item block should respect readonly mode in https://github.com/Milkdown/milkdown/pull/1339
  - feat: remove styles in components in https://github.com/Milkdown/milkdown/pull/1346
  - feat: optimize block handle in https://github.com/Milkdown/milkdown/pull/1355
  - fix: slash menu scroll behavior in https://github.com/Milkdown/milkdown/pull/1386

  #### Crepe Improvements

  - feat: add better readonly support for crepe in https://github.com/Milkdown/milkdown/pull/1322
  - feat: add components in storybook in https://github.com/Milkdown/milkdown/pull/1323
  - fix: crepe destroy throw an error in https://github.com/Milkdown/milkdown/pull/1305
  - fix: improve styles for crepe in https://github.com/Milkdown/milkdown/pull/1306
  - feat: optimize ui for crepe theme in https://github.com/Milkdown/milkdown/pull/1383
  - feat: polish crepe image component ui in https://github.com/Milkdown/milkdown/pull/1385
  - feat: better drop cursor for crepe in https://github.com/Milkdown/milkdown/pull/1378
  - feat: migrate crepe theme to pure css in https://github.com/Milkdown/milkdown/pull/1358

  #### Misc

  - docs: update default config reference by @emmanuel-ferdman in https://github.com/Milkdown/milkdown/pull/1320
  - chore: remove copyright in https://github.com/Milkdown/milkdown/pull/1321
  - test: add list item block in stories in https://github.com/Milkdown/milkdown/pull/1338
  - chore: add inline image block in storybook in https://github.com/Milkdown/milkdown/pull/1340
  - chore: add link tooltip in storybook in https://github.com/Milkdown/milkdown/pull/1341
  - chore: add listener plugin in storybook in https://github.com/Milkdown/milkdown/pull/1342
  - fix: image block style offset in storybook in https://github.com/Milkdown/milkdown/pull/1345
  - chore: 🤖 adjust script names in https://github.com/Milkdown/milkdown/pull/1348
  - chore: adjust e2e folder in https://github.com/Milkdown/milkdown/pull/1354
  - chore: adjust folders in https://github.com/Milkdown/milkdown/pull/1357
  - chore: improve styles in story book in https://github.com/Milkdown/milkdown/pull/1359
  - fix: ordered list paste becomes unordered list in https://github.com/Milkdown/milkdown/pull/1368
  - feat: optimize storybook in https://github.com/Milkdown/milkdown/pull/1369
  - ci: use core pack in https://github.com/Milkdown/milkdown/pull/1387

### Patch Changes

- Updated dependencies [849669b]
  - @milkdown/exception@7.4.0
  - @milkdown/utils@7.4.0

## 7.3.6

### Patch Changes

- 151b789: Bug fix
- Updated dependencies [151b789]
  - @milkdown/exception@7.3.6
  - @milkdown/utils@7.3.6

## 7.3.5

### Patch Changes

- c2a5bcb: Resolve the tippy warning
- Updated dependencies [c2a5bcb]
  - @milkdown/exception@7.3.5
  - @milkdown/utils@7.3.5

## 7.3.4

### Patch Changes

- 2bca917: Fix some bugs and prepare for crepe editor.
- Updated dependencies [2bca917]
  - @milkdown/exception@7.3.4
  - @milkdown/utils@7.3.4

## 7.3.3

### Patch Changes

- 2770d92: Add inline image component and link tooltip component
- Updated dependencies [2770d92]
  - @milkdown/exception@7.3.3
  - @milkdown/utils@7.3.3

## 7.3.2

### Patch Changes

- 5c4a7571: Fix package issues
- Updated dependencies [5c4a7571]
  - @milkdown/exception@7.3.2
  - @milkdown/utils@7.3.2

## 7.3.1

### Patch Changes

- f199e63f: Add code block and list item block in components
- Updated dependencies [f199e63f]
  - @milkdown/exception@7.3.1
  - @milkdown/utils@7.3.1
