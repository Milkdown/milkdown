import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import type { Node } from '@milkdown/prose/model'
import { imageBlockSchema } from '../schema'
import { imageBlockConfig } from '../config'
import { withMeta } from '../../__internal__/meta'
import { defIfNotExists } from '../../__internal__/helper'
import type { ImageComponentProps } from './component'
import { ImageElement } from './component'

defIfNotExists('milkdown-image-block', ImageElement)
export const imageBlockView = $view(imageBlockSchema.node, (ctx): NodeViewConstructor => {
  return (initialNode, view, getPos) => {
    const dom = document.createElement('milkdown-image-block') as HTMLElement & ImageComponentProps
    const config = ctx.get(imageBlockConfig.key)
    const bindAttrs = (node: Node) => {
      dom.src = node.attrs.src
      dom.ratio = node.attrs.ratio
      dom.caption = node.attrs.caption

      dom.readonly = !view.editable
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
        if (e.target instanceof HTMLInputElement)
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

withMeta(imageBlockView, {
  displayName: 'NodeView<image-block>',
  group: 'ImageBlock',
})
