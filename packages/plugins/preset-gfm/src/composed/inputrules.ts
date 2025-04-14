import type { MilkdownPlugin } from '@milkdown/ctx'

import { strikethroughInputRule } from '../mark'
import { insertTableInputRule, wrapInTaskListInputRule } from '../node'

/// @internal
export const inputRules: MilkdownPlugin[] = [
  insertTableInputRule,
  wrapInTaskListInputRule,
]

export const markInputRules: MilkdownPlugin[] = [strikethroughInputRule]
