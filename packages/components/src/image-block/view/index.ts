import type { Node } from '@milkdown/prose/model'
import type { NodeViewConstructor } from '@milkdown/prose/view'

import { $view } from '@milkdown/utils'
import DOMPurify from 'dompurify'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../../__internal__/meta'
import { createSrcBinder } from '../../__internal__/src-binder'
import { isDefaultRatio } from '../alt'
import { imageBlockConfig } from '../config'
import { imageBlockSchema } from '../schema'
import { MilkdownImageBlock } from './components/image-block'

export const imageBlockView = $view(
  imageBlockSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      const src = ref(initialNode.attrs.src)
      const alt = ref(initialNode.attrs.alt)
      const caption = ref(initialNode.attrs.caption)
      const ratio = ref(initialNode.attrs.ratio)
      const selected = ref(false)
      const readonly = ref(!view.editable)
      const setAttr = (attr: string, value: unknown) => {
        if (!view.editable) return
        const pos = getPos()
        if (pos == null) return
        const node = view.state.doc.nodeAt(pos)
        // Releasing the resize handle without a drag sets the ratio that the
        // node already has, which is not a resize.
        if (attr === 'ratio' && node?.attrs.ratio === value) return
        const tr = view.state.tr.setNodeAttribute(
          pos,
          attr,
          attr === 'src' ? DOMPurify.sanitize(value as string) : value
        )
        // An empty alt has no text to keep. Dropping it on a resize saves the
        // image in the ratio-only form, which older versions can read.
        if (
          attr === 'ratio' &&
          node?.attrs.alt === '' &&
          !isDefaultRatio(value as number)
        )
          tr.setNodeAttribute(pos, 'alt', null)
        view.dispatch(tr)
      }
      const config = ctx.get(imageBlockConfig.key)
      const app = createApp(MilkdownImageBlock, {
        src,
        alt,
        caption,
        ratio,
        selected,
        readonly,
        setAttr,
        config,
      })
      const dom = document.createElement('div')
      dom.className = 'milkdown-image-block'
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
        ratio.value = node.attrs.ratio
        alt.value = node.attrs.alt
        caption.value = node.attrs.caption

        readonly.value = !view.editable
      }

      bindAttrs(initialNode)
      app.mount(dom)

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== initialNode.type) return false
          // The img keeps the old picture until the new src loads. ProseMirror
          // also offers this view to a new image inserted before it.
          if (updatedNode.attrs.src !== initialNode.attrs.src) return false

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
