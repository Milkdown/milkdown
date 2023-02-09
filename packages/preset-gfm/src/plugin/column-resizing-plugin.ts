/* Copyright 2021, Milkdown by Mirone. */
import { columnResizing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'

/// This plugin is wrapping the `columnResizing` plugin from [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).
export const columnResizingPlugin = $prose(() => columnResizing({}))
