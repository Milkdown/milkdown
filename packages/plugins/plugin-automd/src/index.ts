import type { MilkdownPlugin } from '@milkdown/ctx'
import { inlineSyncConfig } from './config'
import { inlineSyncPlugin } from './inline-sync-plugin'

export * from './config'
export * from './inline-sync-plugin'

export const automd: MilkdownPlugin[] = [inlineSyncConfig, inlineSyncPlugin]
