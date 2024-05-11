import type { html } from 'atomico'
import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'
import {
  blockquoteSchema,
  bulletListSchema,
  codeBlockSchema,
  headingSchema,
  hrSchema,
  orderedListSchema,
  paragraphSchema,
} from '@milkdown/preset-commonmark'
import type { Attrs, NodeType } from '@milkdown/prose/model'
import { findWrapping } from '@milkdown/prose/transform'
import type { Command, Transaction } from '@milkdown/prose/state'
import { imageBlockSchema } from '@milkdown/components'
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
  textIcon,
} from './icons'

interface MenuItem {
  index: number
  key: string
  label: string
  icon: ReturnType<typeof html>
  onRun: (ctx: Ctx) => void
}

type WithRange<T, HasIndex extends true | false = true> = HasIndex extends true ? T & { range: [start: number, end: number] } : T

type MenuItemGroup<HasIndex extends true | false = true> = WithRange<{
  key: string
  label: string
  items: HasIndex extends true ? MenuItem[] : Omit<MenuItem, 'index'>[]
}, HasIndex>

function clearRange(tr: Transaction) {
  const { $from, $to } = tr.selection
  const { pos: from } = $from
  const { pos: to } = $to
  tr = tr.deleteRange(from - $from.node().content.size, to)
  return tr
}

function setBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const { from, to } = tr.selection
  return tr.setBlockType(from, to, nodeType, attrs)
}

function wrapInBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const { $from, $to } = tr.selection

  const range = $from.blockRange($to)
  const wrapping = range && findWrapping(range, nodeType, attrs)
  if (!wrapping)
    return null

  return tr.wrap(range, wrapping)
}

function addBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const node = nodeType.createAndFill(attrs)
  if (!node)
    return null

  return tr.replaceSelectionWith(node)
}

function clearContentAndSetBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = setBlockType(clearRange(state.tr), nodeType, attrs)
      dispatch(tr.scrollIntoView())
    }
    return true
  }
}

function clearContentAndWrapInBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const tr = wrapInBlockType(clearRange(state.tr), nodeType, attrs)
    if (!tr)
      return false

    if (dispatch)
      dispatch(tr.scrollIntoView())

    return true
  }
}

function clearContentAndAddBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const tr = addBlockType(clearRange(state.tr), nodeType, attrs)
    if (!tr)
      return false

    if (dispatch)
      dispatch(tr.scrollIntoView())

    return true
  }
}

export function getGroups(filter?: string) {
  let groups: MenuItemGroup<false>[] = [
    {
      key: 'text',
      label: 'Text',
      items: [
        {
          key: 'text',
          label: 'Text',
          icon: textIcon,
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
          icon: h1Icon,
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
          icon: h2Icon,
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
          icon: h3Icon,
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
          icon: h4Icon,
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
          icon: h5Icon,
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
          icon: h6Icon,
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
          icon: quoteIcon,
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
          icon: dividerIcon,
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
          icon: bulletListIcon,
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
          icon: orderedListIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndWrapInBlockType(orderedListSchema.type(ctx))
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
          icon: imageIcon,
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
          icon: codeIcon,
          onRun: (ctx) => {
            const view = ctx.get(editorViewCtx)
            const { dispatch, state } = view

            const command = clearContentAndAddBlockType(codeBlockSchema.type(ctx))
            command(state, dispatch)
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
