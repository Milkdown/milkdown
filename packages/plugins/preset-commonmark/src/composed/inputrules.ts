import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  emphasisStarInputRule,
  emphasisUnderscoreInputRule,
  inlineCodeInputRule,
  strongInputRule,
} from '../mark'
import {
  createCodeBlockInputRule,
  insertHrInputRule,
  wrapInBlockquoteInputRule,
  wrapInBulletListInputRule,
  wrapInHeadingInputRule,
  wrapInOrderedListInputRule,
} from '../node'

/// @internal
export const inputRules: MilkdownPlugin[] = [
  wrapInBlockquoteInputRule,
  wrapInBulletListInputRule,
  wrapInOrderedListInputRule,
  createCodeBlockInputRule,
  insertHrInputRule,
  wrapInHeadingInputRule,
].flat()

/// @internal
export const markInputRules: MilkdownPlugin[] = [
  emphasisStarInputRule,
  emphasisUnderscoreInputRule,
  inlineCodeInputRule,
  strongInputRule,
]
