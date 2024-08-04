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
import {
  clearContentAndAddBlockType,
  clearContentAndSetBlockType,
  clearContentAndWrapInBlockType,
  clearRange,
} from './utils'
import { GroupBuilder } from './group-builder'

export function getGroups(filter?: string, config?: BlockEditFeatureConfig) {
  const groupBuilder = new GroupBuilder()
  groupBuilder
    .addGroup('text', config?.slashMenuTextGroupLabel ?? 'Text')
    .addItem('text', {
      label: config?.slashMenuTextGroupLabel ?? 'Text',
      icon: config?.slashMenuTextIcon?.() ?? textIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(paragraphSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('h1', {
      label: config?.slashMenuH1Label ?? 'Heading 1',
      icon: config?.slashMenuH1Icon?.() ?? h1Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 1 })
        command(state, dispatch)
      },
    })
    .addItem('h2', {
      label: config?.slashMenuH2Label ?? 'Heading 2',
      icon: config?.slashMenuH2Icon?.() ?? h2Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 2 })
        command(state, dispatch)
      },
    })
    .addItem('h3', {
      label: config?.slashMenuH3Label ?? 'Heading 3',
      icon: config?.slashMenuH3Icon?.() ?? h3Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 3 })
        command(state, dispatch)
      },
    })
    .addItem('h4', {
      label: config?.slashMenuH4Label ?? 'Heading 4',
      icon: config?.slashMenuH4Icon?.() ?? h4Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 4 })
        command(state, dispatch)
      },
    })
    .addItem('h5', {
      label: config?.slashMenuH5Label ?? 'Heading 5',
      icon: config?.slashMenuH5Icon?.() ?? h5Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 5 })
        command(state, dispatch)
      },
    })
    .addItem('h6', {
      label: config?.slashMenuH6Label ?? 'Heading 6',
      icon: config?.slashMenuH6Icon?.() ?? h6Icon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndSetBlockType(headingSchema.type(ctx), { level: 6 })
        command(state, dispatch)
      },
    })
    .addItem('quote', {
      label: config?.slashMenuQuoteLabel ?? 'Quote',
      icon: config?.slashMenuQuoteIcon?.() ?? quoteIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndWrapInBlockType(blockquoteSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('divider', {
      label: config?.slashMenuDividerLabel ?? 'Divider',
      icon: config?.slashMenuDividerIcon?.() ?? dividerIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndAddBlockType(hrSchema.type(ctx))
        command(state, dispatch)
      },
    })

  groupBuilder.addGroup('list', config?.slashMenuListGroupLabel ?? 'List')
    .addItem('bullet-list', {
      label: config?.slashMenuBulletListLabel ?? 'Bullet List',
      icon: config?.slashMenuBulletListIcon?.() ?? bulletListIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndWrapInBlockType(bulletListSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('ordered-list', {
      label: config?.slashMenuOrderedListLabel ?? 'Ordered List',
      icon: config?.slashMenuOrderedListIcon?.() ?? orderedListIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndWrapInBlockType(orderedListSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('todo-list', {
      label: config?.slashMenuTaskListLabel ?? 'Todo List',
      icon: config?.slashMenuTaskListIcon?.() ?? todoListIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndWrapInBlockType(listItemSchema.type(ctx), { checked: false })
        command(state, dispatch)
      },
    })

  groupBuilder.addGroup('advanced', config?.slashMenuAdvancedGroupLabel ?? 'Advanced')
    .addItem('image', {
      label: config?.slashMenuImageLabel ?? 'Image',
      icon: config?.slashMenuImageIcon?.() ?? imageIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndAddBlockType(imageBlockSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('code', {
      label: config?.slashMenuCodeBlockLabel ?? 'Code',
      icon: config?.slashMenuCodeBlockIcon?.() ?? codeIcon,
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { dispatch, state } = view

        const command = clearContentAndAddBlockType(codeBlockSchema.type(ctx))
        command(state, dispatch)
      },
    })
    .addItem('table', {
      label: config?.slashMenuTableLabel ?? 'Table',
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
    })

  config?.buildMenu?.(groupBuilder)

  let groups = groupBuilder.build()

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
  items.forEach(((item, index) => {
    Object.assign(item, { index })
  }))

  groups.reduce((acc, group) => {
    const end = acc + group.items.length
    Object.assign(group, {
      range: [acc, end],
    })
    return end
  }, 0)

  return {
    groups: groups as MenuItemGroup[],
    size: items.length,
  }
}
