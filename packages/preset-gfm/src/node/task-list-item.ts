/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { listItemSchema } from '@milkdown/preset-commonmark'

export const extendListItemSchemaForTask = listItemSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx)
    return {
      ...baseSchema,
      attrs: {
        ...baseSchema.attrs,
        checked: {
          default: null,
        },
      },
      parseDOM: [
        {
          tag: 'li[data-item-type="task"]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            return {
              label: dom.dataset.label,
              listType: dom.dataset['list-type'],
              spread: dom.dataset.spread,
              checked: dom.dataset.checked ? dom.dataset.checked === 'true' : null,
            }
          },
        },
        ...baseSchema?.parseDOM || [],
      ],
      toDOM: (node) => {
        if (baseSchema.toDOM && node.attrs.checked == null)
          return baseSchema.toDOM(node)

        return [
          'li',
          {
            'data-item-type': 'task',
            'data-label': node.attrs.label,
            'data-list-type': node.attrs.listType,
            'data-spread': node.attrs.spread,
            'data-checked': node.attrs.checked,
          },
          0,
        ]
      },
      parseMarkdown: {
        match: ({ type }) => type === 'listItem',
        runner: (state, node, type) => {
          if (node.checked == null) {
            baseSchema.parseMarkdown.runner(state, node, type)
            return
          }

          const label = node.label != null ? `${node.label}.` : '•'
          const checked = node.checked != null ? Boolean(node.checked) : null
          const listType = node.label != null ? 'ordered' : 'bullet'
          const spread = node.spread != null ? `${node.spread}` : 'true'

          state.openNode(type, { label, listType, spread, checked })
          state.next(node.children)
          state.closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === 'list_item',
        runner: (state, node) => {
          if (node.attrs.checked == null) {
            baseSchema.toMarkdown.runner(state, node)
            return
          }

          const label = node.attrs.label
          const listType = node.attrs.listType
          const spread = node.attrs.spread === 'true'
          const checked = node.attrs.checked

          state.openNode('listItem', undefined, { label, listType, spread, checked })
          state.next(node.content)
          state.closeNode()
        },
      },
    }
  }
})

