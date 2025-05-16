import type { Node } from '@milkdown/prose/model'
import type { NodeViewConstructor } from '@milkdown/prose/view'

import { $view } from '@milkdown/utils'
import DOMPurify from 'dompurify'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../../__internal__/meta'
import { imageBlockConfig } from '../config'
import { imageBlockSchema } from '../schema'
import { MilkdownImageBlock } from './components/image-block'

export const imageBlockView = $view(
  imageBlockSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      const src = ref(initialNode.attrs.src)
      const caption = ref(initialNode.attrs.caption)
      const ratio = ref(initialNode.attrs.ratio)
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
      const config = ctx.get(imageBlockConfig.key)
      const app = createApp(MilkdownImageBlock, {
        src,
        caption,
        ratio,
        selected,
        readonly,
        setAttr,
        config,
      })
      const dom = document.createElement('div')
      dom.className = 'milkdown-image-block'
      app.mount(dom)
      const disposeSelectedWatcher = watchEffect(() => {
        const isSelected = selected.value
        if (isSelected) {
          dom.classList.add('selected')
        } else {
          dom.classList.remove('selected')
        }
      })
      const proxyDomURL = config.proxyDomURL
      const bindAttrs = (node: Node) => {
        if (!proxyDomURL) {
          src.value = node.attrs.src
        } else {
          const proxiedURL = proxyDomURL(node.attrs.src)
          if (typeof proxiedURL === 'string') {
            src.value = proxiedURL
          } else {
            proxiedURL
              .then((url) => {
                src.value = url
              })
              .catch(console.error)
          }
        }
        ratio.value = node.attrs.ratio
        caption.value = node.attrs.caption

        readonly.value = !view.editable
      }

      bindAttrs(initialNode)
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== initialNode.type) return false

          bindAttrs(updatedNode)
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

withMeta(imageBlockView, {
  displayName: 'NodeView<image-block>',
  group: 'ImageBlock',
})
