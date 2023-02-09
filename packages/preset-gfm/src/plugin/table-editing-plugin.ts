/* Copyright 2021, Milkdown by Mirone. */
import { tableEditing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'

/// This plugin is wrapping the `tableEditing` plugin from [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).
export const tableEditingPlugin = $prose(() => tableEditing())
