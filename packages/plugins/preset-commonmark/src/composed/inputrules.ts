import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  createCodeBlockInputRule,
  insertHrInputRule,
  wrapInBlockquoteInputRule,
  wrapInBulletListInputRule,
  wrapInHeadingInputRule,
  wrapInOrderedListInputRule,
} from '../node'
import {
  emphasisStarInputRule,
  emphasisUnderscoreInputRule,
  inlineCodeInputRule,
  strongInputRule,
} from '../mark'

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
