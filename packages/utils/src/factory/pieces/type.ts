/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/core'
import type { MarkType, NodeType } from '@milkdown/prose/model'

export type PluginType = Record<string, NodeType | MarkType>
export const typePipeCtx = createSlice<PluginType, 'Type'>({} as PluginType, 'Type')
