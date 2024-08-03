import { editorViewCtx } from '@milkdown/kit/core'
import {
  blockquoteSchema,
  bulletListSchema,
  codeBlockSchema,
  headingSchema,
  hrSchema,
  listItemSchema,
  orderedListSchema,
  paragraphSchema,
} from '@milkdown/kit/preset/commonmark'
import { NodeSelection } from '@milkdown/kit/prose/state'
import { imageBlockSchema } from '@milkdown/kit/component/image-block'
import { createTable } from '@milkdown/kit/preset/gfm'
import {
  bulletListIcon,
  codeIcon,
  dividerIcon,
  h1Icon,
  h2Icon,
  h3Icon,
  h4Icon,
  h5Icon,
  h6Icon,
  imageIcon,
  orderedListIcon,
  quoteIcon,
  tableIcon,
  textIcon,
  todoListIcon,
} from '../../../icons'
import type { BlockEditFeatureConfig } from '../index'
import type { MenuItemGroup } from './utils'
import { clearContentAndAddBlockType, clearContentAndSetBlockType, clearContentAndWrapInBlockType, clearRange } from './utils'

export function getGroups(filter?: string, config?: BlockEditFeatureConfig) {
  let groups: MenuItemGroup<false>[] = [
    {
      key: 'text',
      label: 'Text',
      items: [
        {
          key: 'text',
          label: 'Text',
          icon: config?.slashMenuTextIcon?.() ?? textIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(paragraphSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'h1',
          label: 'Heading 1',
          icon: config?.slashMenuH1Icon?.() ?? h1Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 1 })
            command(state, dispatch)
          },
        },
        {
          key: 'h2',
          label: 'Heading 2',
          icon: config?.slashMenuH2Icon?.() ?? h2Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 2 })
            command(state, dispatch)
          },
        },
        {
          key: 'h3',
          label: 'Heading 3',
          icon: config?.slashMenuH3Icon?.() ?? h3Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 3 })
            command(state, dispatch)
          },
        },
        {
          key: 'h4',
          label: 'Heading 4',
          icon: config?.slashMenuH4Icon?.() ?? h4Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 4 })
            command(state, dispatch)
          },
        },
        {
          key: 'h5',
          label: 'Heading 5',
          icon: config?.slashMenuH5Icon?.() ?? h5Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 5 })
            command(state, dispatch)
          },
        },
        {
          key: 'h6',
          label: 'Heading 6',
          icon: config?.slashMenuH6Icon?.() ?? h6Icon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 6 })
            command(state, dispatch)
          },
        },
        {
          key: 'quote',
          label: 'Quote',
          icon: config?.slashMenuQuoteIcon?.() ?? quoteIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndWrapInBlockType(blockquoteSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'divider',
          label: 'Divider',
          icon: config?.slashMenuDividerIcon?.() ?? dividerIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndAddBlockType(hrSchema.type(ctx))
            command(state, dispatch)
          },
        },
      ],
    },
    {
      key: 'list',
      label: 'List',
      items: [
        {
          key: 'bullet-list',
          label: 'Bullet List',
          icon: config?.slashMenuBulletListIcon?.() ?? bulletListIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndWrapInBlockType(bulletListSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'ordered-list',
          label: 'Ordered List',
          icon: config?.slashMenuOrderedListIcon?.() ?? orderedListIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndWrapInBlockType(orderedListSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'todo-list',
          label: 'Todo List',
          icon: config?.slashMenuTaskListIcon?.() ?? todoListIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndWrapInBlockType(listItemSchema.type(ctx), { checked: false })
            command(state, dispatch)
          },
        },
      ],
    },
    {
      key: 'advanced',
      label: 'Advanced',
      items: [
        {
          key: 'image',
          label: 'Image',
          icon: config?.slashMenuImageIcon?.() ?? imageIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndAddBlockType(imageBlockSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'code',
          label: 'Code',
          icon: config?.slashMenuCodeBlockIcon?.() ?? codeIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndAddBlockType(codeBlockSchema.type(ctx))
            command(state, dispatch)
          },
        },
        {
          key: 'table',
          label: 'Table',
          icon: config?.slashMenuTableIcon?.() ?? tableIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view
            const tr = clearRange(state.tr)
            const table = createTable(ctx, 3, 3)
            tr.replaceSelectionWith(table)
            const { from } = tr.selection
            const pos = from - table.nodeSize + 2
            dispatch(tr)
            requestAnimationFrame(() => {
              const selection = NodeSelection.create(view.state.tr.doc, pos)
              dispatch(view.state.tr.setSelection(selection).scrollIntoView())
            })
          },
        },
      ],
    },
  ]

  if (filter) {
    groups = groups
      .map((group) => {
        const items = group
          .items
          .filter(item =>
            item
              .label
              .toLowerCase()
              .includes(filter.toLowerCase()))

        return {
          ...group,
          items,
        }
      })
      .filter(group => group.items.length > 0)
  }

  const items = groups.flatMap(groups => groups.items)
  items
    .forEach(((item, index) => {
      Object.assign(item, {
        index,
      })
    }))

  groups.reduce((acc, group) => {
    const end = acc + group.items.length
    Object.assign(group, {
      range: [acc, end],
    })
    return end
  }, 0)

  return {
    groups: groups as unknown as MenuItemGroup[],
    size: items.length,
  }
}
