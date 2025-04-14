import type { MilkdownPlugin } from '@milkdown/ctx'

import { imageBlockConfig } from './config'
import { remarkImageBlockPlugin } from './remark-plugin'
import { imageBlockSchema } from './schema'
import { imageBlockView } from './view'

export * from './schema'
export * from './remark-plugin'
export * from './config'
export * from './view'

export const imageBlockComponent: MilkdownPlugin[] = [
  remarkImageBlockPlugin,
  imageBlockSchema,
  imageBlockView,
  imageBlockConfig,
].flat()
