import { commands, inputRules, keymap, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// Pandoc Essentials preset for milkdown.
/// This preset adds support for:
/// - Superscript: ^text^ becomes superscript
/// - Text spans with attributes: :span[text]{#id .class} (using directive syntax)
/// - Fenced divs: :::name{#id .class}\ncontent\n:::
/// - Heading attributes: # Heading {#id .class key=value}
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
