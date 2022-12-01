/* Copyright 2021, Milkdown by Mirone. */
import { columnResizing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'
export const columnResizingPlugin = $prose(() => columnResizing({}))
