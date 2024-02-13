# @milkdown/preset-commonmark

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

## 7.3.0

### Minor Changes

- 971ff4c0: Improvement features and bug fix.

  Add support for remark plugin config. (#1085)

  Add support for escape character in inline sync plugin. (#1094)

  Fix missing type error in theme nord. (#1095)

### Patch Changes

- Updated dependencies [971ff4c0]
  - @milkdown/exception@7.3.0
  - @milkdown/utils@7.3.0

## 7.2.4

### Patch Changes

- 37b2f22a: Bug fix.

  Expose trigger key for slash plugin. (#1018)

  Fix heading commands for h4-h6. (#1033)

  Rollback to toggle mark command. (#1035)

  Fix the issue that commands not work for multi editor instances. (#1038)

  Fix the issue that marks won't be extends when pasting pure text from HTML. (#1040)

  Bump prosemirror versions. (#1041)

- Updated dependencies [37b2f22a]
  - @milkdown/exception@7.2.4
  - @milkdown/utils@7.2.4

## 7.2.3

### Patch Changes

- 84fce58e: Optimize the behavior of inline sync plugin.
- Updated dependencies [84fce58e]
  - @milkdown/exception@7.2.3
  - @milkdown/utils@7.2.3

## 7.2.2

### Patch Changes

- 01174470: Bug fixes and small improvements.

  Add gapcursor css in prose package. (3d0832e)
  Add option for `getContent` in slash provider. (6c47b3d)
  Add a command to lift first lit item. (#1003)

- Updated dependencies [01174470]
  - @milkdown/exception@7.2.2
  - @milkdown/utils@7.2.2

## 7.2.1

### Patch Changes

- df03a2cb: Bug fix

  Fix commands not working for multiple editors. #977
  Fix inline math conflicts with inline sync plugin. #983

- Updated dependencies [df03a2cb]
  - @milkdown/exception@7.2.1
  - @milkdown/utils@7.2.1

## 7.2.0

### Minor Changes

- f5e00085: Add inspector and telemetry.

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- c69f3076: Rename inspection to telemetry
- 10139088: Fix incorrect system plugin store ref.
- 828cceb9: Add support for editor inspector #960
- Updated dependencies [f5e00085]
- Updated dependencies [45cd3c76]
- Updated dependencies [c69f3076]
- Updated dependencies [10139088]
- Updated dependencies [828cceb9]
  - @milkdown/exception@7.2.0
  - @milkdown/utils@7.2.0

## 7.1.2-next.3

### Patch Changes

- 10139088: Fix incorrect system plugin store ref.
- Updated dependencies [10139088]
  - @milkdown/exception@7.1.2-next.3
  - @milkdown/utils@7.1.2-next.3

## 7.1.2-next.2

### Patch Changes

- c69f3076: Rename inspection to telemetry
- Updated dependencies [c69f3076]
  - @milkdown/exception@7.1.2-next.2
  - @milkdown/utils@7.1.2-next.2

## 7.1.2-next.1

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- Updated dependencies [45cd3c76]
  - @milkdown/exception@7.1.2-next.1
  - @milkdown/utils@7.1.2-next.1

## 7.1.2-next.0

### Patch Changes

- 828cceb9: Add support for editor inspector #960
- Updated dependencies [828cceb9]
  - @milkdown/core@7.1.2-next.0
  - @milkdown/ctx@7.1.2-next.0
  - @milkdown/exception@7.1.2-next.0
  - @milkdown/prose@7.1.2-next.0
  - @milkdown/transformer@7.1.2-next.0
  - @milkdown/utils@7.1.2-next.0

## 7.1.1

### Patch Changes

- f4aaf467: Use slugify to create id for heading nodes
  Fix inline sync plugin causes unneeded changes #924
  Upgrade typescript version to 5 #943
  Add hard break leafText #944
- Updated dependencies [f4aaf467]
  - @milkdown/exception@7.1.1
  - @milkdown/utils@7.1.1

## 7.1.0

### Minor Changes

- 4a60eae7: Add support for HTML nodes.
  Export css files from prosemirror packages.

### Patch Changes

- Updated dependencies [4a60eae7]
  - @milkdown/exception@7.1.0
  - @milkdown/utils@7.1.0

## 7.0.1

### Patch Changes

- 52dcbbe8: Bug fix.
- Updated dependencies [52dcbbe8]
  - @milkdown/exception@7.0.1
  - @milkdown/utils@7.0.1

## 7.0.0

### Major Changes

- 069d719b: Milkdown v7.

  - The editor becomes a first-class headless component.
  - Factory plugins are deprecated and replaced by composable plugins.
  - Runtime plugin toggle.
  - Universal widget plugins.
  - Better Vue and React support.
  - API documentation.

### Patch Changes

- 46010daf: Fix bugs of async composables.
- 2ad4b566: Fix some bugs for rc version.
- ff8a568b: Fix issues in nord-theme and block-plugin.
- 76bed778: Align the API of block plugin with slash and tooltip.
- fc2f4f94: Bug fix version
- cbe8b734: Upgrade prosemirror version and rename collab plugin
- Updated dependencies [46010daf]
- Updated dependencies [2ad4b566]
- Updated dependencies [ff8a568b]
- Updated dependencies [76bed778]
- Updated dependencies [fc2f4f94]
- Updated dependencies [cbe8b734]
- Updated dependencies [069d719b]
  - @milkdown/exception@7.0.0
  - @milkdown/utils@7.0.0

## 7.0.0-next.6

### Patch Changes

- cbe8b734: Upgrade prosemirror version and rename collab plugin
- Updated dependencies [cbe8b734]
  - @milkdown/exception@7.0.0-next.6
  - @milkdown/utils@7.0.0-next.6

## 7.0.0-next.5

### Patch Changes

- 76bed778: Align the API of block plugin with slash and tooltip.
- Updated dependencies [76bed778]
  - @milkdown/exception@7.0.0-next.5
  - @milkdown/utils@7.0.0-next.5

## 7.0.0-next.4

### Patch Changes

- 46010daf: Fix bugs of async composables.
- Updated dependencies [46010daf]
  - @milkdown/exception@7.0.0-next.4
  - @milkdown/utils@7.0.0-next.4

## 7.0.0-next.3

### Patch Changes

- ff8a568b: Fix issues in nord-theme and block-plugin.
- Updated dependencies [ff8a568b]
  - @milkdown/exception@7.0.0-next.3
  - @milkdown/utils@7.0.0-next.3

## 7.0.0-next.2

### Patch Changes

- fc2f4f94: Bug fix version
- Updated dependencies [fc2f4f94]
  - @milkdown/exception@7.0.0-next.2
  - @milkdown/utils@7.0.0-next.2

## 7.0.0-next.1

### Patch Changes

- 2ad4b566: Fix some bugs for rc version.
- Updated dependencies [2ad4b566]
  - @milkdown/exception@7.0.0-next.1
  - @milkdown/utils@7.0.0-next.1

## 7.0.0-next.0

### Major Changes

- 069d719b: Pre-release for milkdown v7.

### Patch Changes

- Updated dependencies [069d719b]
  - @milkdown/core@7.0.0-next.0
  - @milkdown/ctx@7.0.0-next.0
  - @milkdown/exception@7.0.0-next.0
  - @milkdown/prose@7.0.0-next.0
  - @milkdown/utils@7.0.0-next.0

## 6.5.4

### Patch Changes

- b4003d9: Fix bugs and make some small improvements.
- Updated dependencies [b4003d9]
  - @milkdown/exception@6.5.4
  - @milkdown/utils@6.5.4

## 6.5.3

### Patch Changes

- d5c337d: Ux improvements and bug fix.
- Updated dependencies [d5c337d]
  - @milkdown/exception@6.5.3
  - @milkdown/utils@6.5.3

## 6.5.2

### Patch Changes

- 3cb8683: Fix floating widget positions by @iHaPBoy
- Updated dependencies [3cb8683]
  - @milkdown/exception@6.5.2
  - @milkdown/utils@6.5.2

## 6.5.1

### Patch Changes

- 1162c30: Bug fix for link inline sync and emoji.

## 6.5.0

### Minor Changes

- 77ae1d3: Removable plugins, editor status, table inputrule and `injectSlices` factory options.

### Patch Changes

- Updated dependencies [77ae1d3]
  - @milkdown/exception@6.5.0
  - @milkdown/utils@6.5.0

## 6.4.2

### Patch Changes

- 2fd57da4: Bug fix and performance improvements.

## 6.4.1

### Patch Changes

- c1fd2fe2: Bug fix for android list and prism SSR.
- Updated dependencies [c1fd2fe2]
  - @milkdown/exception@6.4.1
  - @milkdown/utils@6.4.1

## 6.4.0

### Minor Changes

- cd6a6139: Inline sync plugin, vscode paste support, and new internal ctx.

### Patch Changes

- Updated dependencies [cd6a6139]
  - @milkdown/exception@6.4.0
  - @milkdown/utils@6.4.0

## 6.3.2

### Patch Changes

- 161d7104: Fix bug of plugin-menu, react strict mode and muptiple editors.
- Updated dependencies [161d7104]
  - @milkdown/exception@6.3.2
  - @milkdown/utils@6.3.2

## 6.3.1

### Patch Changes

- 8478db7a: Fix bug for memory leak, hardbreak and em to px.
- Updated dependencies [8478db7a]
  - @milkdown/exception@6.3.1
  - @milkdown/utils@6.3.1

## 6.3.0

### Minor Changes

- d3b2bd9d: https://github.com/Saul-Mirone/milkdown/milestone/4

### Patch Changes

- Updated dependencies [d3b2bd9d]
  - @milkdown/exception@6.3.0
  - @milkdown/utils@6.3.0

## 6.2.0

### Minor Changes

- 26afcdaf: New react and vue API, custom heading id, prosemirror upgrade, and async composable API.

### Patch Changes

- Updated dependencies [26afcdaf]
  - @milkdown/utils@6.2.0

## 6.1.5

### Patch Changes

- ccf70357: Fix extended factories cannot inject slices
- Updated dependencies [ccf70357]
  - @milkdown/utils@6.1.5

## 6.1.4

### Patch Changes

- d866dded: Fix bugs for clipboard plugin and i18 support
- Updated dependencies [d866dded]
  - @milkdown/utils@6.1.4

## 6.1.3

### Patch Changes

- b5bb4c3f: Fix bugs: inline nodes cursor, theme & emoji for next/nuxt, hardbreak only paragraph.
- Updated dependencies [b5bb4c3f]
  - @milkdown/utils@6.1.3

## 6.1.2

### Patch Changes

- 2c651a96: Fix bugs for collab editing and theme.
- Updated dependencies [2c651a96]
  - @milkdown/utils@6.1.2

## 6.1.1

### Patch Changes

- 1b52931a: Fix input chip bug
- Updated dependencies [1b52931a]
  - @milkdown/utils@6.1.1

## 6.1.0

### Minor Changes

- 1daf87dd: Improve support for collaborative editing.

### Patch Changes

- Updated dependencies [1daf87dd]
  - @milkdown/utils@6.1.0

## 6.0.2

### Patch Changes

- e956c5e3: Fix bugs for collaboration mode
- Updated dependencies [e956c5e3]
  - @milkdown/utils@6.0.2

## 6.0.1

### Patch Changes

- 08a442de: Fix peer dependency error
- Updated dependencies [08a442de]
  - @milkdown/utils@6.0.1

## 6.0.0

### Major Changes

- 00dcdee9: Release milkdown@6
- 4c2846d5: Release milkdown@v6 next.

### Patch Changes

- e27e7e62: Improve UX and API.
- Updated dependencies [e27e7e62]
- Updated dependencies [00dcdee9]
- Updated dependencies [4c2846d5]
  - @milkdown/utils@6.0.0

## 6.0.0-next.1

### Patch Changes

- e27e7e62: Improve UX and API.
- Updated dependencies [e27e7e62]
  - @milkdown/utils@6.0.0-next.1

## 6.0.0-next.0

### Major Changes

- 4c2846d5: Release milkdown@v6 next.

### Patch Changes

- Updated dependencies [4c2846d5]
  - @milkdown/core@6.0.0-next.0
  - @milkdown/prose@6.0.0-next.0
  - @milkdown/utils@6.0.0-next.0

## 5.5.0

### Minor Changes

- d79264e6: Prism plugin now can be configured. And bug fixes with UX optimization.

### Patch Changes

- Updated dependencies [d79264e6]
  - @milkdown/utils@5.5.0

## 5.4.1

### Patch Changes

- 1a882652: Quick fix for new dep orgnization
- Updated dependencies [1a882652]
  - @milkdown/utils@5.4.1

## 5.4.0

### Minor Changes

- 6eef6cd1: Bug fixes, UX improvements and dependency optimization.

### Patch Changes

- Updated dependencies [6eef6cd1]
  - @milkdown/utils@5.4.0

## 5.3.5

### Patch Changes

- d28d71c1: Bug fixes and ux improvements
- Updated dependencies [d28d71c1]
  - @milkdown/core@5.3.5
  - @milkdown/design-system@5.3.5
  - @milkdown/prose@5.3.5
  - @milkdown/utils@5.3.5

## 5.3.4

### Patch Changes

- 1e8cce33: Image load status improvement and support for heading id
- Updated dependencies [1e8cce33]
  - @milkdown/core@5.3.4
  - @milkdown/design-system@5.3.4
  - @milkdown/prose@5.3.4
  - @milkdown/utils@5.3.4

## 5.3.3

### Patch Changes

- f7609d48: Bug fix and ux improvements
- Updated dependencies [f7609d48]
  - @milkdown/core@5.3.3
  - @milkdown/design-system@5.3.3
  - @milkdown/prose@5.3.3
  - @milkdown/utils@5.3.3

## 5.3.2

### Patch Changes

- d62a6011: Bug fixes and new listener API
- Updated dependencies [d62a6011]
  - @milkdown/core@5.3.2
  - @milkdown/design-system@5.3.2
  - @milkdown/prose@5.3.2
  - @milkdown/utils@5.3.2

## 5.3.1

### Patch Changes

- 0f32decd: Bug fixe and ux improvement
- Updated dependencies [0f32decd]
  - @milkdown/utils@5.3.1

## 5.3.0

### Minor Changes

- ed679a03: Optimize vue and react renderer.

### Patch Changes

- Updated dependencies [ed679a03]
  - @milkdown/utils@5.3.0

## 5.2.1

### Patch Changes

- eb74e3b5: Add es and cjs bundle, fix bugs and improve ux
- Updated dependencies [eb74e3b5]
  - @milkdown/utils@5.2.1

## 5.2.0

### Minor Changes

- 42055660: Add menu plugin and lots of optimize.

### Patch Changes

- Updated dependencies [42055660]
  - @milkdown/utils@5.2.0

## 5.1.2

### Patch Changes

- b25da66e: Fix add mark issue for hr
- Updated dependencies [b25da66e]
  - @milkdown/utils@5.1.2

## 5.1.1

### Patch Changes

- e7c701a1: Fix view configuration.
- Updated dependencies [e7c701a1]
  - @milkdown/utils@5.1.1

## 5.1.0

### Minor Changes

- 9519c4c4: Add composable plugins API.

### Patch Changes

- Updated dependencies [9519c4c4]
  - @milkdown/utils@5.1.0

## 5.0.1

### Patch Changes

- 1538bd4a: Fix bugs
- Updated dependencies [1538bd4a]
  - @milkdown/utils@5.0.1

## 5.0.0

### Major Changes

- 35e76858: Refactor the plugin system

### Patch Changes

- Updated dependencies [35e76858]
  - @milkdown/utils@5.0.0

## 4.14.2

### Patch Changes

- 29861bee: Upgrade remark version
- Updated dependencies [29861bee]
  - @milkdown/utils@4.14.2

## 4.14.1

### Patch Changes

- b2618f24: Rollback heading slug feature.
- Updated dependencies [b2618f24]
  - @milkdown/utils@4.14.1

## 4.14.0

### Minor Changes

- e942946d: Add prose and ctx package, improve UX and fix bugs.

### Patch Changes

- Updated dependencies [e942946d]
  - @milkdown/utils@4.14.0

## 4.13.3

### Patch Changes

- db2e3e59: Add indent plugin and upload plugin
- Updated dependencies [db2e3e59]
  - @milkdown/utils@4.13.3

## 4.13.2

### Patch Changes

- 5d6ec991: Fix image command bug
- Updated dependencies [5d6ec991]
  - @milkdown/utils@4.13.2

## 4.13.1

### Patch Changes

- bd5925e3: Fix sourcemap missing files issue
- Updated dependencies [bd5925e3]
  - @milkdown/utils@4.13.1

## 4.13.0

### Minor Changes

- 2d339e90: UX and binding optimize

### Patch Changes

- Updated dependencies [2d339e90]
  - @milkdown/utils@4.13.0

## 4.12.0

### Minor Changes

- 4207ca0e: Support diagram plugin.

### Patch Changes

- Updated dependencies [4207ca0e]
  - @milkdown/utils@4.12.0

## 4.11.2

### Patch Changes

- dfe441db: Add config for slash, tooltip and image
- Updated dependencies [dfe441db]
  - @milkdown/utils@4.11.2

## 4.11.1

### Patch Changes

- fca77942: Export theme module
- Updated dependencies [fca77942]
  - @milkdown/utils@4.11.1

## 4.11.0

### Minor Changes

- 80a0c815: Add slots in design system and headless mode for all plugins.

### Patch Changes

- Updated dependencies [80a0c815]
  - @milkdown/utils@4.11.0

## 4.10.5

### Patch Changes

- 8e2d440: rgba color fix
- Updated dependencies [8e2d440]
  - @milkdown/utils@4.10.5

## 4.10.4

### Patch Changes

- 3b5bbdf: Add rgb and rgba support for theme
- Updated dependencies [3b5bbdf]
  - @milkdown/utils@4.10.4

## 4.10.3

### Patch Changes

- 3903547: Add HTML filter plugin
- Updated dependencies [3903547]
  - @milkdown/utils@4.10.3

## 4.10.2

### Patch Changes

- 447044b: Fix list issue in gfm
- Updated dependencies [447044b]
  - @milkdown/utils@4.10.2

## 4.10.1

### Patch Changes

- 61d847d: Add side effect marker
- Updated dependencies [61d847d]
  - @milkdown/utils@4.10.1

## 4.10.0

### Minor Changes

- 5868165: Add design system for write theme easily.

### Patch Changes

- Updated dependencies [5868165]
  - @milkdown/utils@4.10.0

## 4.9.6

### Patch Changes

- f4a9bb1: Fix circular deps for preset-gfm
- Updated dependencies [f4a9bb1]
  - @milkdown/utils@4.9.6

## 4.9.5

### Patch Changes

- 22d5c36: UI optimize and bug fix.
- Updated dependencies [22d5c36]
  - @milkdown/utils@4.9.5

## 4.9.4

### Patch Changes

- abd6ed9: Add license and fix bugs.
- Updated dependencies [abd6ed9]
  - @milkdown/utils@4.9.4

## 4.9.3

### Patch Changes

- 566d83f: Release to github release packages.
- Updated dependencies [566d83f]
  - @milkdown/utils@4.9.3

## 4.9.2

### Patch Changes

- 7c84b8e: Release for github
- Updated dependencies [7c84b8e]
  - @milkdown/utils@4.9.2

## 4.9.1

### Patch Changes

- 59065b6: Fix ci issues
- Updated dependencies [59065b6]
  - @milkdown/utils@4.9.1

## 4.9.0

### Minor Changes

- cbce961: Add command manager.

### Patch Changes

- Updated dependencies [cbce961]
  - @milkdown/utils@4.9.0

## 4.8.2

### Patch Changes

- 83ad3c9: Make performance and ux improvements.
- Updated dependencies [83ad3c9]
  - @milkdown/utils@4.8.2

## 4.8.1

### Patch Changes

- 6d801db: Refactor for small improvements.
- Updated dependencies [6d801db]
  - @milkdown/utils@4.8.1

## 4.8.0

### Minor Changes

- 501ad84: Add emoji plugin

### Patch Changes

- Updated dependencies [501ad84]
  - @milkdown/utils@4.8.0

## 4.7.1

### Patch Changes

- 7ab83ca: Fix dep list.
- Updated dependencies [7ab83ca]
  - @milkdown/utils@4.7.1

## 4.7.0

### Minor Changes

- 804cbb5: Add support for clipboard and collaborative abilities.

### Patch Changes

- Updated dependencies [804cbb5]
  - @milkdown/utils@4.7.0

## 4.6.9

### Patch Changes

- 483093c: Fix serializer issue of inline code.
- Updated dependencies [483093c]
  - @milkdown/utils@4.6.9

## 4.6.8

### Patch Changes

- c6e6b5a: Fix some issues and improve the binding packages.
- Updated dependencies [c6e6b5a]
  - @milkdown/utils@4.6.8

## 4.6.7

### Patch Changes

- c0a50be: Bug fix for CRA.
- Updated dependencies [c0a50be]
  - @milkdown/utils@4.6.7

## 4.6.6

### Patch Changes

- 361c760: Fix style issues.
- Updated dependencies [361c760]
  - @milkdown/utils@4.6.6

## 4.6.5

### Patch Changes

- 58158e3: Add cursor package and fix config bug.
- Updated dependencies [58158e3]
  - @milkdown/utils@4.6.5

## 4.6.4

### Patch Changes

- 2fec317: Fix some issues.
- Updated dependencies [2fec317]
  - @milkdown/utils@4.6.4

## 4.6.3

### Patch Changes

- 8f0ce59: Extract listener plugin.
- Updated dependencies [8f0ce59]
  - @milkdown/utils@4.6.3

## 4.6.2

### Patch Changes

- bf809ed: Fix for singleton and vite.
- Updated dependencies [bf809ed]
  - @milkdown/utils@4.6.2

## 4.6.1

### Patch Changes

- 01477a8: Update versions of dependencies and solve conflicts.
- Updated dependencies [01477a8]
  - @milkdown/utils@4.6.1

## 4.6.0

### Minor Changes

- e1fbf79: Refactor the plugin system to functional plugin for better extension ability.

### Patch Changes

- Updated dependencies [e1fbf79]
  - @milkdown/utils@4.6.0

## 4.5.3

### Patch Changes

- 9311f7c: Styles for preset commonmark.

## 4.5.2

### Patch Changes

- 0dd0320: Add configurable keyboard shortcuts feature.

## 4.5.1

### Patch Changes

- e5bc443: Add default value type for html and json.

## 4.5.0

### Minor Changes

- f0b957a: Make some improvements and add history plugin.

## 4.4.0

### Minor Changes

- 892909e: Use remark to replace markdown-it.

## 4.3.0

### Minor Changes

- de11ad1: Add vue and react integration ability.

## 4.2.0

### Minor Changes

- f614070: Add the ability to configure the commonmark nodes.

## 4.1.2

### Patch Changes

- ed365e5: Add readme and fix some issues.

## 4.1.1

### Patch Changes

- 77ed566: Fix some issues.

## 4.1.0

### Minor Changes

- 964b518: Optimize load state for all loaders.

## 4.0.0

### Minor Changes

- f73794a: Add support for table, theme, slash commands and more optimization.

### Patch Changes

- Updated dependencies [f73794a]
  - @milkdown/core@4.0.0

## 3.0.0

### Major Changes

- 804890b: First release of core, preset-commonmark, theme-nord, plugin-math, plugin-tooltip and plugin-prism

### Patch Changes

- First release
- Updated dependencies [804890b]
- Updated dependencies [undefined]
  - @milkdown/core@3.0.0
