# @milkdown/plugin-highlight

## 7.17.2

### Patch Changes

- 998d472: Milkdown patch version release.

  ## Feat
  - feat: upgrade prosemirror packages versions (#2177)

  ## Fix
  - fix: 🐛 Submit button on the inline edit confirm button (#2163)

- Updated dependencies [998d472]
  - @milkdown/core@7.17.2
  - @milkdown/ctx@7.17.2
  - @milkdown/utils@7.17.2

## 7.17.1

### Patch Changes

- bf8b561: Milkdown patch version release

  ## Ci
  - ci: 🎡 release with OIDC

  This version does not contain any user-facing changes.
  We've migrated our release workflow to use OpenID Connect (OIDC) for authentication. This change enhances security by eliminating the need for long-lived personal access tokens, thereby reducing the risk of token leakage. The new setup allows GitHub Actions to securely authenticate with our package registry using short-lived tokens, ensuring a more robust and secure release process.

- Updated dependencies [bf8b561]
  - @milkdown/core@7.17.1
  - @milkdown/ctx@7.17.1
  - @milkdown/utils@7.17.1

## 7.17.0

### Minor Changes

- 4ced9da: Milkdown minor release.

  ## Feat
  - feat: 🎸 add paste rule (#2126)
  - feat: support to render async preview in code block (#2117)

### Patch Changes

- Updated dependencies [4ced9da]
  - @milkdown/core@7.17.0
  - @milkdown/ctx@7.17.0
  - @milkdown/utils@7.17.0

## 7.16.0

### Minor Changes

- 1d330d7: Milkdown minor version release.

  ## Feat
  - feat: add drop indicator plugin (#2097)
  - feat: add new highlight plugin (#2067)

  ## Fix
  - fix: 🐛 image proxy time sequence (#2110)
  - fix: 🐛 missing doc tag for highlight plugin

  ## Chore
  - chore: 🤖 enable knip and remove dead code and export (#2099)

  ## Refactor
  - refactor: 💡 use api from prosemirror-tables (#2083)

  ## Test
  - test: 💍 improve unit test of transformer (#2109)

  ## Ci
  - ci: 🎡 add pkg-pr-new (#2082)

### Patch Changes

- Updated dependencies [1d330d7]
  - @milkdown/core@7.16.0
  - @milkdown/ctx@7.16.0
  - @milkdown/utils@7.16.0
