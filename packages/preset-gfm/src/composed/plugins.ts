/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { autoInsertZeroSpaceInTablePlugin, columnResizingPlugin, remarkGFMPlugin, tableEditingPlugin } from '../plugin'

export const plugins: MilkdownPlugin[] = [
  autoInsertZeroSpaceInTablePlugin,
  columnResizingPlugin,
  tableEditingPlugin,
  remarkGFMPlugin,
]
