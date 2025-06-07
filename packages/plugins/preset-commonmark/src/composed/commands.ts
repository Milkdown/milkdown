import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  addBlockTypeCommand,
  clearTextInCurrentBlockCommand,
  isMarkSelectedCommand,
  isNodeSelectedCommand,
  selectTextNearPosCommand,
  setBlockTypeCommand,
  wrapInBlockTypeCommand,
} from '../commands'
import {
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  toggleStrongCommand,
  updateLinkCommand,
} from '../mark'
import {
  createCodeBlockCommand,
  downgradeHeadingCommand,
  insertHardbreakCommand,
  insertHrCommand,
  insertImageCommand,
  liftFirstListItemCommand,
  liftListItemCommand,
  sinkListItemCommand,
  splitListItemCommand,
  turnIntoTextCommand,
  updateImageCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from '../node'

/// @internal
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
  liftFirstListItemCommand,

  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,

  toggleLinkCommand,
  updateLinkCommand,

  isMarkSelectedCommand,
  isNodeSelectedCommand,

  clearTextInCurrentBlockCommand,
  setBlockTypeCommand,
  wrapInBlockTypeCommand,
  addBlockTypeCommand,
  selectTextNearPosCommand,
]
