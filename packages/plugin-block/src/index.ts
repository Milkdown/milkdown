/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/core'
import { blockConfig, blockPlugin, blockService, blockView } from './block-plugin'

export * from './block-provider'
export * from './block-service'
export * from './block-plugin'

export const block: MilkdownPlugin[] = [blockView, blockConfig, blockService, blockPlugin]
