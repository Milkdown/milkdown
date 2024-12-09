import { $remark } from '@milkdown/utils'
import remarkInlineLinks from 'remark-inline-links'
import { withMeta } from '../__internal__'

/// This plugin wraps [remark-inline-links](https://github.com/remarkjs/remark-inline-links).
export const remarkInlineLinkPlugin = $remark(
  'remarkInlineLink',
  () => remarkInlineLinks
)

withMeta(remarkInlineLinkPlugin.plugin, {
  displayName: 'Remark<remarkInlineLinkPlugin>',
  group: 'Remark',
})

withMeta(remarkInlineLinkPlugin.options, {
  displayName: 'RemarkConfig<remarkInlineLinkPlugin>',
  group: 'Remark',
})
