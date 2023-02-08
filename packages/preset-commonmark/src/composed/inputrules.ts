/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { createCodeBlockInputRule, insertHrInputRule, wrapInBlockquoteInputRule, wrapInBulletListInputRule, wrapInHeadingInputRule, wrapInOrderedListInputRule } from '../node'

/// @internal
export const inputrules: MilkdownPlugin[] = [
  wrapInBlockquoteInputRule,
  wrapInBulletListInputRule,
  wrapInOrderedListInputRule,
  createCodeBlockInputRule,
  insertHrInputRule,
  wrapInHeadingInputRule,
].flat()
