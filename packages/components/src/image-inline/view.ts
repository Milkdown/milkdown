import type { Node } from '@milkdown/prose/model'
import type { NodeViewConstructor } from '@milkdown/prose/view'

import { imageSchema } from '@milkdown/preset-commonmark'
import { $view } from '@milkdown/utils'
import DOMPurify from 'dompurify'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../__internal__/meta'
import { createSrcBinder } from '../__internal__/src-binder'
import { MilkdownImageInline } from './components/image-inline'
import { inlineImageConfig } from './config'

export const inlineImageView = $view(
  imageSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      const src = ref(initialNode.attrs.src)
      const alt = ref(initialNode.attrs.alt)
      const title = ref(initialNode.attrs.title)
      const selected = ref(false)
      const readonly = ref(!view.editable)
      const setAttr = (attr: string, value: unknown) => {
        if (!view.editable) return
        const pos = getPos()
        if (pos == null) return
        view.dispatch(
          view.state.tr.setNodeAttribute(
            pos,
            attr,
            attr === 'src' ? DOMPurify.sanitize(value as string) : value
          )
        )
      }

      const config = ctx.get(inlineImageConfig.key)
      const app = createApp(MilkdownImageInline, {
        src,
        alt,
        title,
        selected,
        readonly,
        setAttr,
        config,
      })
      const dom = document.createElement('span')
      dom.className = 'milkdown-image-inline'
      const disposeSelectedWatcher = watchEffect(() => {
        const isSelected = selected.value
        if (isSelected) {
          dom.classList.add('selected')
        } else {
          dom.classList.remove('selected')
        }
      })
      const bindSrc = createSrcBinder(src, config.proxyDomURL)
      const bindAttrs = (node: Node) => {
        bindSrc(node.attrs.src)
        alt.value = node.attrs.alt
        title.value = node.attrs.title
      }
      let currentNode = initialNode
      bindAttrs(initialNode)
      app.mount(dom)

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) return false
          if (updatedNode.attrs.src !== currentNode.attrs.src) return false

          bindAttrs(updatedNode)
          currentNode = updatedNode
          return true
        },
        stopEvent: (e) => {
          if (e.target instanceof HTMLInputElement) return true

          return false
        },
        selectNode: () => {
          selected.value = true
        },
        deselectNode: () => {
          selected.value = false
        },
        destroy: () => {
          disposeSelectedWatcher()
          app.unmount()
          dom.remove()
        },
      }
    }
  }
)

withMeta(inlineImageView, {
  displayName: 'NodeView<image-inline>',
  group: 'ImageInline',
})
