import { commands, inputRules, keymap, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// Pandoc Essentials preset for milkdown.
/// This preset adds support for:
///
/// - **Superscript**: `^text^` becomes superscript (H^2^O → H²O)
///
/// - **Text spans with attributes** (two syntaxes supported):
///   - Pandoc native: `[text]{#id .class key=value}`
///   - Directive syntax: `:span[text]{#id .class}`
///   - Example: `[Small Caps]{.smallcaps}` for small caps text
///
/// - **Fenced divs**: `:::name{#id .class}\ncontent\n:::`
///   - Example: `:::warning\nThis is a warning\n:::`
///
/// - **Heading attributes**: `# Heading {#id .class key=value}`
///   - Example: `# Introduction {#intro .chapter}`
///
/// Note: This preset should be used together with the commonmark preset.
///
/// Usage:
/// ```typescript
/// import { Editor } from '@milkdown/kit/core'
/// import { commonmark } from '@milkdown/kit/preset/commonmark'
/// import { pandocEssentials } from '@milkdown/preset-pandoc-essentials'
///
/// Editor.make().use(commonmark).use(pandocEssentials).create()
/// ```
export const pandocEssentials = [
  schema,
  inputRules,
  keymap,
  commands,
  plugins,
].flat()
