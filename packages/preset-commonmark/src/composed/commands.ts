/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { toggleEmphasisCommand, toggleInlineCodeCommand, toggleLinkCommand, toggleStrongCommand, updateLinkCommand } from '../mark'
import { createCodeBlockCommand, downgradeHeadingCommand, insertHardbreakCommand, insertHrCommand, insertImageCommand, liftListItemCommand, sinkListItemCommand, splitListItemCommand, turnIntoTextCommand, updateImageCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInHeadingCommand, wrapInOrderedListCommand } from '../node'

export const commands: MilkdownPlugin[] = [
  turnIntoTextCommand,
  wrapInBlockquoteCommand,
  wrapInHeadingCommand,
  downgradeHeadingCommand,
  createCodeBlockCommand,
  insertHardbreakCommand,
  insertHrCommand,

  insertImageCommand,
  updateImageCommand,

  wrapInOrderedListCommand,
  wrapInBulletListCommand,
  sinkListItemCommand,
  splitListItemCommand,
  liftListItemCommand,

  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,

  toggleLinkCommand,
  updateLinkCommand,
]
