/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { emphasisKeymap, inlineCodeKeymap, strongKeymap } from '../mark'
import { blockquoteKeymap, bulletListKeymap, codeBlockKeymap, hardbreakKeymap, headingKeymap, listItemKeymap, orderedListKeymap, paragraphKeymap } from '../node'

export const keymap: MilkdownPlugin[] = [
  blockquoteKeymap,
  codeBlockKeymap,
  hardbreakKeymap,
  headingKeymap,
  listItemKeymap,
  orderedListKeymap,
  bulletListKeymap,
  paragraphKeymap,

  emphasisKeymap,
  inlineCodeKeymap,
  strongKeymap,
].flat()
