import type { MilkdownPlugin } from '@milkdown/ctx'
import { tableView } from './view'

export const tableBlock: MilkdownPlugin[] = [
  tableView,
]
