import type { MilkdownPlugin } from '@milkdown/ctx'
import { tableBlockView } from './view'

export const tableBlock: MilkdownPlugin[] = [
  tableBlockView,
]
