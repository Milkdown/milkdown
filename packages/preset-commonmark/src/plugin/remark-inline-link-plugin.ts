/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkInlineLinks from 'remark-inline-links'
import { withMeta } from '../__internal__'

/// This plugin wraps [remark-inline-links](https://github.com/remarkjs/remark-inline-links).
export const remarkInlineLinkPlugin = $remark(() => remarkInlineLinks)

withMeta(remarkInlineLinkPlugin, {
  displayName: 'Remark<remarkInlineLinkPlugin>',
  group: 'Remark',
})
