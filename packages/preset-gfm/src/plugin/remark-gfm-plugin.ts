import type { $Remark } from '@milkdown/utils'
import { $remark } from '@milkdown/utils'
import type { Options } from 'remark-gfm'
import remarkGFM from 'remark-gfm'
import { withMeta } from '../__internal__'

/// This plugin is wrapping the [remark-gfm](https://github.com/remarkjs/remark-gfm).
export const remarkGFMPlugin: $Remark<'remarkGFM', Options | null | undefined> = $remark('remarkGFM', () => remarkGFM)

withMeta(remarkGFMPlugin.plugin, {
  displayName: 'Remark<remarkGFMPlugin>',
  group: 'Remark',
})

withMeta(remarkGFMPlugin.options, {
  displayName: 'RemarkConfig<remarkGFMPlugin>',
  group: 'Remark',
})
