/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { createCodeBlockInputRule, insertHrInputRule, wrapInBlockquoteInputRule, wrapInBulletListInputRule, wrapInHeadingInputRule, wrapInOrderedListInputRule } from '../node'

export const inputrules: MilkdownPlugin[] = [
  wrapInBlockquoteInputRule,
  wrapInBulletListInputRule,
  wrapInOrderedListInputRule,
  createCodeBlockInputRule,
  insertHrInputRule,
  wrapInHeadingInputRule,
].flat()
