/* Copyright 2021, Milkdown by Mirone. */
import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import type { Node } from '@milkdown/prose/model'
import { c } from 'atomico'
import { imageBlockSchema } from '../schema'
import { imageBlockConfig } from '../config'
import type { ImageComponentProps } from './component'
import { imageComponent } from './component'

export const imageBlockView = $view(imageBlockSchema.node, (ctx): NodeViewConstructor => {
  customElements.define('milkdown-image-block', c(imageComponent))

  return (initialNode, view, getPos) => {
    const dom = document.createElement('milkdown-image-block') as HTMLElement & ImageComponentProps
    const config = ctx.get(imageBlockConfig.key)
    const bindAttrs = (node: Node) => {
      dom.src = node.attrs.src
      dom.ratio = node.attrs.ratio
      dom.caption = node.attrs.caption
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
    }
  }
})
