import type { MilkdownPlugin } from '@milkdown/ctx'

import { listItemBlockConfig } from './config'
import { listItemBlockView } from './view'

export * from './component'
export * from './config'
export * from './view'

export const listItemBlockComponent: MilkdownPlugin[] = [
  listItemBlockConfig,
  listItemBlockView,
]
