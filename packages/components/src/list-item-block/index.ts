/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { listItemBlockView } from './view'
import { listItemBlockConfig } from './config'

export * from './component'
export * from './config'
export * from './view'

export const listItemBlockComponent: MilkdownPlugin[] = [
  listItemBlockConfig,
  listItemBlockView,
]
