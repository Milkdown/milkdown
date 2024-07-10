import { tableNodes } from '@milkdown/prose/tables'
import { $nodeSchema } from '@milkdown/utils'
import type { MarkdownNode } from '@milkdown/transformer'
import type { NodeType } from '@milkdown/prose/model'
import { withMeta } from '../../__internal__'

const originalSchema = tableNodes({
  tableGroup: 'block',
  cellContent: 'paragraph',
  cellAttributes: {
    alignment: {
      default: 'left',
      getFromDOM: dom => (dom).style.textAlign || 'left',
      setDOMAttr: (value, attrs) => {
        attrs.style = `text-align: ${value || 'left'}`
      },
    },
  },
})

/// Schema for table node.
export const tableSchema = $nodeSchema('table', () => ({
  ...originalSchema.table,
  content: 'table_header_row table_row+',
  disableDropCursor: true,
  parseMarkdown: {
    match: node => node.type === 'table',
    runner: (state, node, type) => {
      const align = node.align as (string | null)[]
      const children = (node.children as MarkdownNode[]).map((x, i) => ({
        ...x,
        align,
        isHeader: i === 0,
      }))
      state.openNode(type)
      state.next(children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table',
    runner: (state, node) => {
      const firstLine = node.content.firstChild?.content
      if (!firstLine)
        return

      const align: (string | null)[] = []
      firstLine.forEach((cell) => {
        align.push(cell.attrs.alignment)
      })
      state.openNode('table', undefined, { align })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableSchema.node, {
  displayName: 'NodeSchema<table>',
  group: 'Table',
})

withMeta(tableSchema.ctx, {
  displayName: 'NodeSchemaCtx<table>',
  group: 'Table',
})

/// Schema for table header row node.
export const tableHeaderRowSchema = $nodeSchema('table_header_row', () => ({
  ...originalSchema.table_row,
  disableDropCursor: true,
  content: '(table_header)*',
  parseDOM: [{ tag: 'tr[data-is-header]' }],
  toDOM() {
    return ['tr', { 'data-is-header': true }, 0]
  },
  parseMarkdown: {
    match: node => Boolean(node.type === 'tableRow' && node.isHeader),
    runner: (state, node, type) => {
      const align = node.align as (string | null)[]
      const children = (node.children as MarkdownNode[]).map((x, i) => ({
        ...x,
        align: align[i],
        isHeader: node.isHeader,
      }))
      state.openNode(type)
      state.next(children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_header_row',
    runner: (state, node) => {
      state.openNode('tableRow', undefined, { isHeader: true })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableHeaderRowSchema.node, {
  displayName: 'NodeSchema<tableHeaderRow>',
  group: 'Table',
})

withMeta(tableHeaderRowSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableHeaderRow>',
  group: 'Table',
})

/// Schema for table row node.
export const tableRowSchema = $nodeSchema('table_row', () => ({
  ...originalSchema.table_row,
  disableDropCursor: true,
  content: '(table_cell)*',
  parseMarkdown: {
    match: node => node.type === 'tableRow',
    runner: (state, node, type) => {
      const align = node.align as (string | null)[]
      const children = (node.children as MarkdownNode[]).map((x, i) => ({
        ...x,
        align: align[i],
      }))
      state.openNode(type)
      state.next(children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_row',
    runner: (state, node) => {
      state.openNode('tableRow')
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableRowSchema.node, {
  displayName: 'NodeSchema<tableRow>',
  group: 'Table',
})

withMeta(tableRowSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableRow>',
  group: 'Table',
})

/// Schema for table cell node.
export const tableCellSchema = $nodeSchema('table_cell', () => ({
  ...originalSchema.table_cell,
  disableDropCursor: true,
  parseMarkdown: {
    match: node => node.type === 'tableCell' && !node.isHeader,
    runner: (state, node, type) => {
      const align = node.align as string
      state
        .openNode(type, { alignment: align })
        .openNode(state.schema.nodes.paragraph as NodeType)
        .next(node.children)
        .closeNode()
        .closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_cell',
    runner: (state, node) => {
      state.openNode('tableCell').next(node.content).closeNode()
    },
  },
}))

withMeta(tableCellSchema.node, {
  displayName: 'NodeSchema<tableCell>',
  group: 'Table',
})

withMeta(tableCellSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableCell>',
  group: 'Table',
})

/// Schema for table header node.
export const tableHeaderSchema = $nodeSchema('table_header', () => ({
  ...originalSchema.table_header,
  disableDropCursor: true,
  parseMarkdown: {
    match: node => node.type === 'tableCell' && !!node.isHeader,
    runner: (state, node, type) => {
      const align = node.align as string
      state.openNode(type, { alignment: align })
      state.openNode(state.schema.nodes.paragraph as NodeType)
      state.next(node.children)
      state.closeNode()
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_header',
    runner: (state, node) => {
      state.openNode('tableCell')
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableHeaderSchema.node, {
  displayName: 'NodeSchema<tableHeader>',
  group: 'Table',
})

withMeta(tableHeaderSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableHeader>',
  group: 'Table',
})
