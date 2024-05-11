import type { MilkdownPlugin } from '@milkdown/ctx'
import { codeBlockView } from './view'
import { codeBlockConfig } from './config'

export * from './config'
export * from './view'

export const codeBlockComponent: MilkdownPlugin[] = [
  codeBlockView,
  codeBlockConfig,
]
