import type { SliceType } from '@milkdown/ctx'
import type { PluginSpec } from '@milkdown/prose/state'
import type { $Ctx, $Prose } from '@milkdown/utils'
import type { FilterNodes } from './block-config'
import { blockConfig } from './block-config'
import { blockPlugin, blockService, blockSpec } from './block-plugin'
import type { BlockService } from './block-service'

export * from './block-plugin'
export * from './block-provider'
export * from './block-service'
export * from './block-config'
export * from './types'

/// @internal
export type BlockPlugin = [
  $Ctx<PluginSpec<any>, 'blockSpec'>,
  $Ctx<{ filterNodes: FilterNodes }, 'blockConfig'>,
  $Ctx<BlockService, 'blockService'>,
  $Prose,
] & {
  key: SliceType<PluginSpec<any>, 'blockSpec'>
  pluginKey: $Prose['key']
}

/// All plugins exported by this package.
export const block = [blockSpec, blockConfig, blockService, blockPlugin] as BlockPlugin
block.key = blockSpec.key
block.pluginKey = blockPlugin.key
