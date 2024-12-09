import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'
import { headingIdGenerator, headingSchema } from '../node/heading'
import { withMeta } from '../__internal__'

/// This plugin is used to sync the heading id when the heading content changes.
/// It will use the `headingIdGenerator` to generate the id.
export const syncHeadingIdPlugin = $prose((ctx) => {
  const headingIdPluginKey = new PluginKey('MILKDOWN_HEADING_ID')

  const updateId = (view: EditorView) => {
    if (view.composing) return

    const getId = ctx.get(headingIdGenerator.key)
    const tr = view.state.tr.setMeta('addToHistory', false)

    let found = false
    const idMap: Record<string, number> = {}

    view.state.doc.descendants((node, pos) => {
      if (node.type === headingSchema.type(ctx)) {
        if (node.textContent.trim().length === 0) return

        const attrs = node.attrs
        let id = getId(node)
        if (idMap[id]) {
          idMap[id]! += 1
          id += `-#${idMap[id]}`
        } else {
          idMap[id] = 1
        }

        if (attrs.id !== id) {
          found = true
          tr.setMeta(headingIdPluginKey, true).setNodeMarkup(pos, undefined, {
            ...attrs,
            id,
          })
        }
      }
    })

    if (found) view.dispatch(tr)
  }

  return new Plugin({
    key: headingIdPluginKey,
    view: (view) => {
      updateId(view)

      return {
        update: (view, prevState) => {
          if (view.state.doc.eq(prevState.doc)) return
          updateId(view)
        },
      }
    },
  })
})

withMeta(syncHeadingIdPlugin, {
  displayName: 'Prose<syncHeadingIdPlugin>',
  group: 'Prose',
})
