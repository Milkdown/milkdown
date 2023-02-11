/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/ctx'
import { blockConfig, blockPlugin, blockService, blockView } from './block-plugin'

export * from './block-provider'
export * from './block-service'
export * from './block-plugin'

/// All plugins exported by this package.
export const block: MilkdownPlugin[] = [blockView, blockConfig, blockService, blockPlugin]
