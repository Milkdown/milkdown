/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'
import { withMeta } from '../__internal__'

/// This plugin is wrapping the [remark-gfm](https://github.com/remarkjs/remark-gfm).
export const remarkGFMPlugin = $remark('remarkGFM', () => remarkGFM)

withMeta(remarkGFMPlugin.plugin, {
  displayName: 'Remark<remarkGFMPlugin>',
  group: 'Remark',
})

withMeta(remarkGFMPlugin.options, {
  displayName: 'RemarkConfig<remarkGFMPlugin>',
  group: 'Remark',
})
