import {
  editorViewOptionsCtx,
  parserCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { getNodeFromSchema, isTextOnlySlice } from '@milkdown/prose'
import {
  DOMParser,
  DOMSerializer,
  type Node as ProsemirrorNode,
  type Slice,
} from '@milkdown/prose/model'
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state'

import type { EditorView } from '@milkdown/prose/view'

import { $prose } from '@milkdown/utils'

import { isPureText } from './__internal__/is-pure-text'
import { withMeta } from './__internal__/with-meta'

function dispatchPasteSlice(view: EditorView, slice: Slice): boolean {
  const node = isTextOnlySlice(slice)
  if (node) {
    view.dispatch(view.state.tr.replaceSelectionWith(node, true))
    return true
  }

  try {
    view.dispatch(view.state.tr.replaceSelection(slice))
    return true
  } catch {
    return false
  }
}

/// The prosemirror plugin for clipboard.
export const clipboard = $prose((ctx) => {
  const schema = ctx.get(schemaCtx)

  // Set editable props for https://github.com/Milkdown/milkdown/issues/190
  ctx.update(editorViewOptionsCtx, (prev) => ({
    ...prev,
    editable: prev.editable ?? (() => true),
    transformPastedHTML: (html: string, view: EditorView) => {
      const prevTransform = prev.transformPastedHTML
      if (prevTransform) html = prevTransform(html, view)

      // Google Docs wraps pasted content in <b style="font-weight:normal;" id="docs-internal-guid-...">
      // This wrapper causes ProseMirror's parser to fail when parsing multiple tables.
      // Strip it so block content is at the top level.
      if (html.includes('docs-internal-guid')) {
        html = html.replace(
          /<b[^>]*id="docs-internal-guid[^"]*"[^>]*>([\s\S]*)<\/b>/,
          '$1'
        )
        // Also unwrap <div> elements that wrap tables.
        // Google Docs wraps each table in <div dir="ltr" ...><table>...</table></div>
        // These wrappers interfere with ProseMirror's parseSlice for multiple tables.
        html = html.replace(/<div[^>]*>(<table[\s\S]*?<\/table>)<\/div>/g, '$1')
      }
      return html
    },
  }))

  const key = new PluginKey('MILKDOWN_CLIPBOARD')
  const plugin = new Plugin({
    key,
    props: {
      handlePaste: (view, event, preProcessedSlice) => {
        const parser = ctx.get(parserCtx)
        const editable = view.props.editable?.(view.state)
        const { clipboardData } = event
        if (!editable || !clipboardData) return false

        const currentNode = view.state.selection.$from.node()
        if (currentNode.type.spec.code) return false

        const text = clipboardData.getData('text/plain')

        // if is copied from vscode, try to create a code block
        const vscodeData = clipboardData.getData('vscode-editor-data')
        if (vscodeData) {
          const data = JSON.parse(vscodeData)
          const language = data?.mode
          if (text && language) {
            const { tr } = view.state
            const codeBlock = getNodeFromSchema('code_block', schema)

            tr.replaceSelectionWith(codeBlock.create({ language }))
              .setSelection(
                TextSelection.near(
                  tr.doc.resolve(Math.max(0, tr.selection.from - 2))
                )
              )
              .insertText(text.replace(/\r\n?/g, '\n'))

            view.dispatch(tr)
            return true
          }
        }

        const html = clipboardData.getData('text/html')
        if (html.length === 0 && text.length === 0) return false

        // When HTML is present, use the pre-processed Slice from ProseMirror.
        // ProseMirror's parseFromClipboard already ran transformPastedHTML
        // (e.g. Google Docs wrapper stripping) and transformPasted (paste rules
        // like table header fix), producing a better Slice than re-parsing here.
        if (html.length > 0 && preProcessedSlice) {
          return dispatchPasteSlice(view, preProcessedSlice)
        }

        const domParser = DOMParser.fromSchema(schema)
        let dom: Node
        if (html.length === 0) {
          const slice = parser(text)
          if (!slice || typeof slice === 'string') return false

          dom = DOMSerializer.fromSchema(schema).serializeFragment(
            slice.content
          )
        } else {
          const template = document.createElement('template')
          template.innerHTML = html
          dom = template.content.cloneNode(true)
          template.remove()
        }

        const slice = domParser.parseSlice(dom)
        return dispatchPasteSlice(view, slice)
      },
      clipboardTextSerializer: (slice) => {
        const serializer = ctx.get(serializerCtx)
        const isText = isPureText(slice.content.toJSON())
        if (isText)
          return (slice.content as unknown as ProsemirrorNode).textBetween(
            0,
            slice.content.size,
            '\n\n'
          )

        const doc = schema.topNodeType.createAndFill(undefined, slice.content)
        if (!doc) return ''
        const value = serializer(doc)
        return value
      },
    },
  })

  return plugin
})

withMeta(clipboard, { displayName: 'Prose<clipboard>' })
