/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { insertTableInputRule, wrapInTaskListInputRule } from '../node'

/// @internal
export const inputrules: MilkdownPlugin[] = [
  insertTableInputRule,
  wrapInTaskListInputRule,
]
