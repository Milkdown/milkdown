/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { insertTableInputRule } from '../node'

export const inputrules: MilkdownPlugin[] = [
  insertTableInputRule,
]
