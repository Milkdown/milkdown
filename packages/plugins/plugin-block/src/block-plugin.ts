import type { PluginSpec } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

import { BlockService } from './block-service'
import { withMeta } from './__internal__/with-meta'
import { blockConfig } from './block-config'

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
        drop: (view) => {
          return service.dropCallback(view)
        },
        pointermove: (view, event) => {
          return service.mousemoveCallback(view, event)
        },
        keydown: (view) => {
          return service.keydownCallback(view)
        },
        dragover: (view, event) => {
          return service.dragoverCallback(view, event)
        },
        dragleave: (view, event) => {
          return service.dragleaveCallback(view, event)
        },
        dragenter: (view) => {
          return service.dragenterCallback(view)
        },
        dragend: (view) => {
          return service.dragendCallback(view)
        },
      },
    },
  })
})

withMeta(blockPlugin, {
  displayName: 'Prose<block>',
})
