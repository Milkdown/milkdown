import type { $Remark } from '@milkdown/utils'
import type { Options } from 'remark-gfm'

import { $remark } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'

import { withMeta } from '../__internal__'

/// This plugin wraps
/// [remark-gfm](https://github.com/remarkjs/remark-gfm).
///
/// Its options decide how a table is written. By default the serializer
/// pads every cell so the pipes line up. Turn that off with
/// `tablePipeAlign`:
///
/// ```typescript
/// ctx.set(remarkGFMPlugin.options.key, { tablePipeAlign: false })
/// ```
export const remarkGFMPlugin: $Remark<'remarkGFM', Options | null | undefined> =
  $remark('remarkGFM', () => remarkGFM)

withMeta(remarkGFMPlugin.plugin, {
  displayName: 'Remark<remarkGFMPlugin>',
  group: 'Remark',
})

withMeta(remarkGFMPlugin.options, {
  displayName: 'RemarkConfig<remarkGFMPlugin>',
  group: 'Remark',
})
