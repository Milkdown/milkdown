import type { $Remark } from '@milkdown/utils'

import { $remark } from '@milkdown/utils'
import remarkDirective from 'remark-directive'

import { withMeta } from '../__internal__'

/// This plugin wraps [remark-directive](https://github.com/remarkjs/remark-directive)
/// to enable Pandoc-style fenced divs and spans.
///
/// Syntax supported:
/// - Container directives (divs): :::name{#id .class}\ncontent\n:::
/// - Text directives (spans): :span[text]{#id .class}
///
/// Note: For full Pandoc compatibility, you may need additional plugins.
export const remarkDirectivePlugin: $Remark<
  'remarkDirective',
  Parameters<typeof remarkDirective>[0]
> = $remark('remarkDirective', () => remarkDirective)

withMeta(remarkDirectivePlugin.plugin, {
  displayName: 'Remark<remarkDirective>',
  group: 'Remark',
})

withMeta(remarkDirectivePlugin.options, {
  displayName: 'RemarkConfig<remarkDirective>',
  group: 'Remark',
})
