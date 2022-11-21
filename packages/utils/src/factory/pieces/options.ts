/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx,
} from '@milkdown/core'
import {
  createSlice,
} from '@milkdown/core'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'
import type { CommonOptions } from '../../types'

export type PluginView = Record<string, NodeViewConstructor | MarkViewConstructor>
export type PluginOptions = Omit<CommonOptions<string, unknown>, 'view'> & { view?: (ctx: Ctx) => PluginView }

export const optionsPipeCtx = createSlice<PluginOptions>({}, 'optionsPipeCtx')
