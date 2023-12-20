/* Copyright 2021, Milkdown by Mirone. */
import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { imageSchema } from '@milkdown/preset-commonmark'
import type { Node } from '@milkdown/prose/model'
import { withMeta } from '../__internal__/meta'
import type { InlineImageComponentProps } from './component'
import { InlineImageElement } from './component'
import { inlineImageConfig } from './config'

export const inlineImageView = $view(imageSchema.node, (ctx): NodeViewConstructor => {
  customElements.define('milkdown-inline-image', InlineImageElement)

  return (initialNode, view, getPos) => {
    const dom = document.createElement('milkdown-inline-image') as HTMLElement & InlineImageComponentProps
    const config = ctx.get(inlineImageConfig.key)
    const bindAttrs = (node: Node) => {
      dom.src = node.attrs.src
      dom.alt = node.attrs.alt
      dom.title = node.attrs.title
    }
    bindAttrs(initialNode)
    dom.selected = false
    dom.setAttr = (attr, value) => {
      const pos = getPos()
      if (pos == null)
        return

      view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value))
    }
    dom.config = config
    return {
      dom,
      update: (updatedNode) => {
        if (updatedNode.type !== initialNode.type)
          return false

        bindAttrs(updatedNode)
        return true
      },
      stopEvent: (e) => {
        if (dom.selected && e.target instanceof HTMLInputElement)
          return true

        return false
      },
      selectNode: () => {
        dom.selected = true
      },
      deselectNode: () => {
        dom.selected = false
      },
      destroy: () => {
        dom.remove()
      },
    }
  }
})

withMeta(inlineImageView, {
  displayName: 'NodeView<inline-image>',
  group: 'InlineImage',
})
