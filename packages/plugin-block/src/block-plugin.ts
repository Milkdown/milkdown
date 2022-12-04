/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import type { PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $ctx, $prose } from '@milkdown/utils'

import { BlockService } from './block-service'

export type FilterNodes = (node: Node) => boolean

export const defaultNodeFilter: FilterNodes = (node) => {
  const { name } = node.type
  if (name.startsWith('table') && name !== 'table')
    return false

  return true
}

export const blockConfig = $ctx<{ filterNodes: FilterNodes }, 'blockConfig'>({
  filterNodes: defaultNodeFilter,
}, 'blockConfig')
export const blockService = $ctx(new BlockService(), 'blockService')

export type BlockViewFactory = (view: EditorView) => PluginView

export const blockView = $ctx<BlockViewFactory, 'blockView'>(() => ({}), 'blockView')

export const blockPlugin = $prose((ctx) => {
  const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK')
  const service = ctx.get(blockService.key)
  const view = ctx.get(blockView.key)

  return new Plugin({
    key: milkdownPluginBlockKey,
    props: {
      handleDOMEvents: {
        drop: (view, event) => {
          return service.dropCallback(view, event as DragEvent)
        },
        mousemove: (view, event) => {
          return service.mousemoveCallback(view, event as MouseEvent)
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
      },
    },
    view,
  })
})
