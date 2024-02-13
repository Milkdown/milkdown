# @milkdown/theme-nord

## 7.3.4

### Patch Changes

- 2bca917: Fix some bugs and prepare for crepe editor.

## 7.3.3

### Patch Changes

- 2770d92: Add inline image component and link tooltip component

## 7.3.2

### Patch Changes

- 5c4a7571: Fix package issues

## 7.3.1

### Patch Changes

- f199e63f: Add code block and list item block in components

## 7.3.0

### Minor Changes

- 971ff4c0: Improvement features and bug fix.

  Add support for remark plugin config. (#1085)

  Add support for escape character in inline sync plugin. (#1094)

  Fix missing type error in theme nord. (#1095)

## 7.2.4

### Patch Changes

- 37b2f22a: Bug fix.

  Expose trigger key for slash plugin. (#1018)

  Fix heading commands for h4-h6. (#1033)

  Rollback to toggle mark command. (#1035)

  Fix the issue that commands not work for multi editor instances. (#1038)

  Fix the issue that marks won't be extends when pasting pure text from HTML. (#1040)

  Bump prosemirror versions. (#1041)

## 7.2.3

### Patch Changes

- 84fce58e: Optimize the behavior of inline sync plugin.

## 7.2.2

### Patch Changes

- 01174470: Bug fixes and small improvements.

  Add gapcursor css in prose package. (3d0832e)
  Add option for `getContent` in slash provider. (6c47b3d)
  Add a command to lift first lit item. (#1003)

## 7.2.1

### Patch Changes

- df03a2cb: Bug fix

  Fix commands not working for multiple editors. #977
  Fix inline math conflicts with inline sync plugin. #983

## 7.2.0

### Minor Changes

- f5e00085: Add inspector and telemetry.

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- c69f3076: Rename inspection to telemetry
- 10139088: Fix incorrect system plugin store ref.
- 828cceb9: Add support for editor inspector #960

## 7.1.2-next.3

### Patch Changes

- 10139088: Fix incorrect system plugin store ref.

## 7.1.2-next.2

### Patch Changes

- c69f3076: Rename inspection to telemetry

## 7.1.2-next.1

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.

## 7.1.2-next.0

### Patch Changes

- 828cceb9: Add support for editor inspector #960
- Updated dependencies [828cceb9]
  - @milkdown/core@7.1.2-next.0
  - @milkdown/ctx@7.1.2-next.0
  - @milkdown/prose@7.1.2-next.0

## 7.1.1

### Patch Changes

- f4aaf467: Use slugify to create id for heading nodes
  Fix inline sync plugin causes unneeded changes #924
  Upgrade typescript version to 5 #943
  Add hard break leafText #944

## 7.1.0

### Minor Changes

- 4a60eae7: Add support for HTML nodes.
  Export css files from prosemirror packages.

## 7.0.1

### Patch Changes

- 52dcbbe8: Bug fix.

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

## 7.0.0-next.6

### Patch Changes

- cbe8b734: Upgrade prosemirror version and rename collab plugin

## 7.0.0-next.5

### Patch Changes

- 76bed778: Align the API of block plugin with slash and tooltip.

## 7.0.0-next.4

### Patch Changes

- 46010daf: Fix bugs of async composables.

## 7.0.0-next.3

### Patch Changes

- ff8a568b: Fix issues in nord-theme and block-plugin.

## 7.0.0-next.2

### Patch Changes

- fc2f4f94: Bug fix version

## 7.0.0-next.1

### Patch Changes

- 2ad4b566: Fix some bugs for rc version.

## 7.0.0-next.0

### Major Changes

- 069d719b: Pre-release for milkdown v7.

### Patch Changes

- Updated dependencies [069d719b]
  - @milkdown/core@7.0.0-next.0
  - @milkdown/ctx@7.0.0-next.0
  - @milkdown/prose@7.0.0-next.0
