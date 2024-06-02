import type { MilkdownPlugin } from '@milkdown/ctx'
import { insertTableInputRule, wrapInTaskListInputRule } from '../node'
import { strikethroughInputRule } from '../mark'

/// @internal
export const inputRules: MilkdownPlugin[] = [
  insertTableInputRule,
  wrapInTaskListInputRule,
]

export const markInputRules: MilkdownPlugin[] = [
  strikethroughInputRule,
]
