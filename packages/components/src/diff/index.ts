import type { MilkdownPlugin } from '@milkdown/ctx'

import { diffComponentConfig } from './config'
import { diffDecorationPlugin } from './diff-decoration-plugin'

export * from './config'
export { diffDecorationPlugin } from './diff-decoration-plugin'

export const diffComponent: MilkdownPlugin[] = [
  diffComponentConfig,
  diffDecorationPlugin,
]
