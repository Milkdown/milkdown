/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import type { Node } from '@milkdown/prose/model'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { ThemeUtils } from '@milkdown/utils'

import { BlockService } from './block-service'
import type { ConfigBuilder } from './config'

export type FilterNodes = (node: Node) => boolean
const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK')

export const createBlockPlugin = (
  ctx: Ctx,
  utils: ThemeUtils,
  filterNodes: FilterNodes,
  configBuilder: ConfigBuilder,
) => {
  const blockHandle = new BlockService(ctx, utils, filterNodes, configBuilder)

  return new Plugin({
    key: milkdownPluginBlockKey,
    props: {
      handleDOMEvents: {
        drop: (view, event) => {
          return blockHandle.dropCallback(view, event as DragEvent)
        },
        mousemove: (view, event) => {
          return blockHandle.mousemoveCallback(view, event as MouseEvent)
        },
        mousedown: () => {
          return blockHandle.mousedownCallback()
        },
        keydown: () => {
          return blockHandle.keydownCallback()
        },
        dragover: (view, event) => {
          return blockHandle.dragoverCallback(view, event)
        },
      },
    },
    view: (view) => {
      blockHandle.mount(view)
      return {
        destroy: () => {
          blockHandle.unmount()
        },
      }
    },
  })
}
