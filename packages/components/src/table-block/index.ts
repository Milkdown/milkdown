import type { MilkdownPlugin } from '@milkdown/ctx'

import { tableBlockConfig } from './config'
import { tableBlockView } from './view'

export * from './view'
export * from './config'

export const tableBlock: MilkdownPlugin[] = [tableBlockConfig, tableBlockView]
