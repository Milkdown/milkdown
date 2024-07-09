import type { MilkdownPlugin } from '@milkdown/ctx'
import { tableBlockView } from './view'
import { tableBlockConfig } from './config'

export * from './view'
export * from './config'

export const tableBlock: MilkdownPlugin[] = [
  tableBlockConfig,
  tableBlockView,
]
