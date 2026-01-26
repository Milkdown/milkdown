import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  remarkDirectivePlugin,
  remarkHeadingAttrsPlugin,
  remarkSpanPlugin,
  remarkSpanStringifyPlugin,
  remarkSuperscriptPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  // Directive plugin for ::: divs and :span syntax
  remarkDirectivePlugin.plugin,
  remarkDirectivePlugin.options,
  // Superscript: ^text^
  remarkSuperscriptPlugin.plugin,
  remarkSuperscriptPlugin.options,
  // Heading attributes: # Title {#id .class}
  remarkHeadingAttrsPlugin.plugin,
  remarkHeadingAttrsPlugin.options,
  // Pandoc native span syntax: [text]{.class}
  remarkSpanPlugin.plugin,
  remarkSpanPlugin.options,
  remarkSpanStringifyPlugin.plugin,
  remarkSpanStringifyPlugin.options,
]
