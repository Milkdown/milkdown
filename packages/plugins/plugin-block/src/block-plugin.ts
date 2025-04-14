import type { PluginSpec } from '@milkdown/prose/state'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

import { withMeta } from './__internal__/with-meta'
import { BlockService } from './block-service'

/// @internal
export const blockService = $ctx(() => new BlockService(), 'blockService')

/// @internal
export const blockServiceInstance = $ctx(
  {} as BlockService,
  'blockServiceInstance'
)

withMeta(blockService, {
  displayName: 'Ctx<blockService>',
})

withMeta(blockServiceInstance, {
  displayName: 'Ctx<blockServiceInstance>',
})

/// A slice contains a factory that will return a plugin spec.
/// Users can use this slice to customize the plugin.
export const blockSpec = $ctx<PluginSpec<any>, 'blockSpec'>({}, 'blockSpec')

withMeta(blockSpec, {
  displayName: 'Ctx<blockSpec>',
})

/// The block prosemirror plugin.
export const blockPlugin = $prose((ctx) => {
  const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK')
  const getService = ctx.get(blockService.key)
  const service = getService()
  ctx.set(blockServiceInstance.key, service)
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
