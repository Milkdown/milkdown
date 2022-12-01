/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'

export const remarkGFMPlugin = $remark(() => remarkGFM)
