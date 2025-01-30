# @milkdown/kit

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
  - @milkdown/components@7.6.2
  - @milkdown/core@7.6.2
  - @milkdown/ctx@7.6.2
  - @milkdown/plugin-block@7.6.2
  - @milkdown/plugin-clipboard@7.6.2
  - @milkdown/plugin-cursor@7.6.2
  - @milkdown/plugin-history@7.6.2
  - @milkdown/plugin-indent@7.6.2
  - @milkdown/plugin-listener@7.6.2
  - @milkdown/plugin-slash@7.6.2
  - @milkdown/plugin-tooltip@7.6.2
  - @milkdown/plugin-trailing@7.6.2
  - @milkdown/plugin-upload@7.6.2
  - @milkdown/preset-commonmark@7.6.2
  - @milkdown/preset-gfm@7.6.2
  - @milkdown/prose@7.6.2
  - @milkdown/transformer@7.6.2
  - @milkdown/utils@7.6.2

## 7.6.1

### Patch Changes

- @milkdown/components@7.6.1
- @milkdown/core@7.6.1
- @milkdown/ctx@7.6.1
- @milkdown/plugin-block@7.6.1
- @milkdown/plugin-clipboard@7.6.1
- @milkdown/plugin-cursor@7.6.1
- @milkdown/plugin-history@7.6.1
- @milkdown/plugin-indent@7.6.1
- @milkdown/plugin-listener@7.6.1
- @milkdown/plugin-slash@7.6.1
- @milkdown/plugin-tooltip@7.6.1
- @milkdown/plugin-trailing@7.6.1
- @milkdown/plugin-upload@7.6.1
- @milkdown/preset-commonmark@7.6.1
- @milkdown/preset-gfm@7.6.1
- @milkdown/prose@7.6.1
- @milkdown/transformer@7.6.1
- @milkdown/utils@7.6.1

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
  - @milkdown/components@7.6.0
  - @milkdown/core@7.6.0
  - @milkdown/ctx@7.6.0
  - @milkdown/plugin-block@7.6.0
  - @milkdown/plugin-clipboard@7.6.0
  - @milkdown/plugin-cursor@7.6.0
  - @milkdown/plugin-history@7.6.0
  - @milkdown/plugin-indent@7.6.0
  - @milkdown/plugin-listener@7.6.0
  - @milkdown/plugin-slash@7.6.0
  - @milkdown/plugin-tooltip@7.6.0
  - @milkdown/plugin-trailing@7.6.0
  - @milkdown/plugin-upload@7.6.0
  - @milkdown/preset-commonmark@7.6.0
  - @milkdown/preset-gfm@7.6.0
  - @milkdown/prose@7.6.0
  - @milkdown/transformer@7.6.0
  - @milkdown/utils@7.6.0

## 7.5.9

### Patch Changes

- a3dde0c: Enable image proxy.
- Updated dependencies [a3dde0c]
  - @milkdown/components@7.5.9
  - @milkdown/core@7.5.9
  - @milkdown/ctx@7.5.9
  - @milkdown/plugin-block@7.5.9
  - @milkdown/plugin-clipboard@7.5.9
  - @milkdown/plugin-cursor@7.5.9
  - @milkdown/plugin-history@7.5.9
  - @milkdown/plugin-indent@7.5.9
  - @milkdown/plugin-listener@7.5.9
  - @milkdown/plugin-slash@7.5.9
  - @milkdown/plugin-tooltip@7.5.9
  - @milkdown/plugin-trailing@7.5.9
  - @milkdown/plugin-upload@7.5.9
  - @milkdown/preset-commonmark@7.5.9
  - @milkdown/preset-gfm@7.5.9
  - @milkdown/prose@7.5.9
  - @milkdown/transformer@7.5.9
  - @milkdown/utils@7.5.9

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
  - @milkdown/components@7.5.8
  - @milkdown/core@7.5.8
  - @milkdown/ctx@7.5.8
  - @milkdown/plugin-block@7.5.8
  - @milkdown/plugin-clipboard@7.5.8
  - @milkdown/plugin-cursor@7.5.8
  - @milkdown/plugin-history@7.5.8
  - @milkdown/plugin-indent@7.5.8
  - @milkdown/plugin-listener@7.5.8
  - @milkdown/plugin-slash@7.5.8
  - @milkdown/plugin-tooltip@7.5.8
  - @milkdown/plugin-trailing@7.5.8
  - @milkdown/plugin-upload@7.5.8
  - @milkdown/preset-commonmark@7.5.8
  - @milkdown/preset-gfm@7.5.8
  - @milkdown/prose@7.5.8
  - @milkdown/transformer@7.5.8
  - @milkdown/utils@7.5.8

## 7.5.5

### Patch Changes

- 56af3f5: Optimize table drag behavior
- Updated dependencies [56af3f5]
  - @milkdown/components@7.5.5

## 7.5.4

### Patch Changes

- 705c263: Fix plugin block bugs
- Updated dependencies [705c263]
  - @milkdown/plugin-block@7.5.4
  - @milkdown/components@7.5.4

## 7.5.3

### Patch Changes

- 9cb69ae: Fix the link component will make the editor autofocus when loaded
- Updated dependencies [9cb69ae]
  - @milkdown/components@7.5.3
  - @milkdown/plugin-tooltip@7.5.3

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
  - @milkdown/components@7.5.0
  - @milkdown/core@7.5.0
  - @milkdown/ctx@7.5.0
  - @milkdown/plugin-block@7.5.0
  - @milkdown/plugin-clipboard@7.5.0
  - @milkdown/plugin-cursor@7.5.0
  - @milkdown/plugin-history@7.5.0
  - @milkdown/plugin-indent@7.5.0
  - @milkdown/plugin-listener@7.5.0
  - @milkdown/plugin-slash@7.5.0
  - @milkdown/plugin-tooltip@7.5.0
  - @milkdown/plugin-trailing@7.5.0
  - @milkdown/plugin-upload@7.5.0
  - @milkdown/preset-commonmark@7.5.0
  - @milkdown/preset-gfm@7.5.0
  - @milkdown/prose@7.5.0
  - @milkdown/transformer@7.5.0
  - @milkdown/utils@7.5.0
