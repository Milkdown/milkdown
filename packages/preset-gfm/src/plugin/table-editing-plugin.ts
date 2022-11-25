/* Copyright 2021, Milkdown by Mirone. */
import { tableEditing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'
export const tableEditingPlugin = $prose(() => tableEditing())
