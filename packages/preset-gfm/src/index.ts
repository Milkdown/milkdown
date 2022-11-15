/* Copyright 2021, Milkdown by Mirone. */
import { commonmark, commands as commonmarkCommands } from '@milkdown/preset-commonmark'
import { $remark, AtomList } from '@milkdown/utils'
import remarkGFM from 'remark-gfm'

import { footnoteReference } from './footnote'
import { footnoteDefinition } from './footnote/definition'
import { ToggleStrikeThrough, strikeThrough } from './strike-through'
import { table } from './table'
import {
  LiftTaskListItem,
  SinkTaskListItem,
  SplitTaskListItem,
  TurnIntoTaskList,
  taskListItem,
} from './task-list-item'

export * from './footnote'
export * from './strike-through'
export { SupportedKeys } from './supported-keys'
export {
  BreakTable,
  // command
  createTable,
  InsertTable,
  NextCell,
  PrevCell,
  // gather
  table,
} from './table'
export * from './task-list-item'
export {
  blockquote,
  bulletList,
  codeFence,
  codeInline,
  commonmark,
  // gather
  commonmarkNodes,
  commonmarkPlugins,
  // node
  doc,
  em,
  HardbreakFilterPluginKey as hardbreak,
  heading,
  hr,
  image,
  // command
  InsertHardbreak,
  InsertHr,
  InsertImage,
  LiftListItem,
  link,
  listItem,
  ModifyImage,
  ModifyLink,
  orderedList,
  paragraph,
  SinkListItem,
  SplitListItem,
  strong,
  text,
  ToggleBold,
  ToggleInlineCode,
  ToggleItalic,
  ToggleLink,
  TurnIntoCodeFence,
  TurnIntoHeading,
  TurnIntoText,
  WrapInBlockquote,
  WrapInBulletList,
  WrapInOrderedList,
} from '@milkdown/preset-commonmark'

export const gfm = AtomList.create([
  ...commonmark,
  $remark(() => remarkGFM),
  table(),
  strikeThrough(),
  taskListItem(),
  footnoteReference(),
  footnoteDefinition(),
])

export const commands = {
  ...commonmarkCommands,
  ToggleStrikeThrough,
  TurnIntoTaskList,
  SinkTaskListItem,
  LiftTaskListItem,
  SplitTaskListItem,
} as const
export type Commands = typeof commands
