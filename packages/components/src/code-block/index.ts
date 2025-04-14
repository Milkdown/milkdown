import type { MilkdownPlugin } from '@milkdown/ctx'

import { codeBlockConfig } from './config'
import { codeBlockView } from './view'

export * from './config'
export * from './view'

export const codeBlockComponent: MilkdownPlugin[] = [
  codeBlockView,
  codeBlockConfig,
]
