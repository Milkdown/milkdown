/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import type { PluginSpec } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

import { BlockService } from './block-service'
import { withMeta } from './__internal__/with-meta'

/// @internal
export type FilterNodes = (node: Node) => boolean

/// @internal
export const defaultNodeFilter: FilterNodes = (node) => {
  const { name } = node.type
  if (name.startsWith('table') && name !== 'table')
    return false

  return true
}

/// A slice contains the block config.
/// Possible properties:
/// - `filterNodes`: A function to filter nodes that can be dragged.
export const blockConfig = $ctx<{ filterNodes: FilterNodes }, 'blockConfig'>({ filterNodes: defaultNodeFilter }, 'blockConfig')

withMeta(blockConfig, {
  displayName: 'Ctx<blockConfig>',
})

/// @internal
export const blockService = $ctx(new BlockService(), 'blockService')

withMeta(blockConfig, {
  displayName: 'Ctx<blockService>',
})

/// A slice contains a factory that will return a plugin spec.
/// Users can use this slice to customize the plugin.
export const blockSpec = $ctx<PluginSpec<any>, 'blockSpec'>({}, 'blockSpec')

withMeta(blockConfig, {
  displayName: 'Ctx<blockSpec>',
})

/// The block prosemirror plugin.
export const blockPlugin = $prose((ctx) => {
  const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK')
  const service = ctx.get(blockService.key)
  const spec = ctx.get(blockSpec.key)

  return new Plugin({
    key: milkdownPluginBlockKey,
    ...spec,
    props: {
      ...spec.props,
      handleDOMEvents: {
        drop: (view, event) => {
          return service.dropCallback(view, event)
        },
        mousemove: (view, event) => {
          return service.mousemoveCallback(view, event)
        },
        keydown: () => {
          return service.keydownCallback()
        },
        dragover: (view, event) => {
          return service.dragoverCallback(view, event)
        },
        dragleave: () => {
          return service.dragleaveCallback()
        },
        dragenter: () => {
          return service.dragenterCallback()
        },
      },
    },
  })
})

withMeta(blockPlugin, {
  displayName: 'Prose<block>',
})
