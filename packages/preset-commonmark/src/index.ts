/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils'

import { ModifyLink, ToggleBold, ToggleInlineCode, ToggleItalic, ToggleLink, marks } from './mark'
import {
  InsertHardbreak,
  InsertHr,
  InsertImage,
  LiftListItem,
  ModifyImage,
  SinkListItem,
  SplitListItem,
  TurnIntoCodeFence,
  TurnIntoHeading,
  TurnIntoText,
  WrapInBlockquote,
  WrapInBulletList,
  WrapInOrderedList,
  nodes,
} from './node'
import { commonmarkPlugins } from './plugin'

export * from './mark'
export * from './node'
export { inlineSyncConfigCtx } from './plugin'
export * from './supported-keys'

export const commonmarkNodes = AtomList.create([...nodes, ...marks])
export { commonmarkPlugins }
export const commonmark = AtomList.create([...commonmarkPlugins, ...commonmarkNodes])

export const commands = {
  ToggleInlineCode,
  ToggleItalic,
  ToggleLink,
  ToggleBold,

  ModifyLink,
  ModifyImage,

  WrapInBlockquote,
  WrapInBulletList,
  WrapInOrderedList,

  TurnIntoCodeFence,
  TurnIntoHeading,
  TurnIntoText,

  InsertHardbreak,
  InsertHr,
  InsertImage,

  SplitListItem,
  SinkListItem,
  LiftListItem,
} as const
export type Commands = typeof commands
