/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkInlineLinks from 'remark-inline-links'

export const remarkInlineLinkPlugin = $remark(() => remarkInlineLinks)
