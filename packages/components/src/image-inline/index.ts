import type { MilkdownPlugin } from '@milkdown/ctx'
import { inlineImageConfig } from './config'
import { inlineImageView } from './view'

export * from './config'
export * from './style'
export * from './view'

export const imageInlineComponent: MilkdownPlugin[] = [
  inlineImageConfig,
  inlineImageView,
]
