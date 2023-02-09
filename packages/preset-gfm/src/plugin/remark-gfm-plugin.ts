/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'

/// This plugin is wrapping the [remark-gfm](https://github.com/remarkjs/remark-gfm).
export const remarkGFMPlugin = $remark(() => remarkGFM)
