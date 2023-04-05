/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'
import { withMeta } from '../__internal__'

/// This plugin is wrapping the [remark-gfm](https://github.com/remarkjs/remark-gfm).
export const remarkGFMPlugin = $remark(() => remarkGFM)

withMeta(remarkGFMPlugin, {
  displayName: 'Remark<remarkGFMPlugin>',
  group: 'Remark',
})
