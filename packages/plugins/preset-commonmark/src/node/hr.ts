import { InputRule } from '@milkdown/prose/inputrules'
import { Selection } from '@milkdown/prose/state'
import { $command, $inputRule, $nodeAttr, $nodeSchema } from '@milkdown/utils'
import { withMeta } from '../__internal__'
import { paragraphSchema } from './paragraph'

/// HTML attributes for the hr node.
export const hrAttr = $nodeAttr('hr')

withMeta(hrAttr, {
  displayName: 'Attr<hr>',
  group: 'Hr',
})

/// Hr node schema.
export const hrSchema = $nodeSchema('hr', (ctx) => ({
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  toDOM: (node) => ['hr', ctx.get(hrAttr.key)(node)],
  parseMarkdown: {
    match: ({ type }) => type === 'thematicBreak',
    runner: (state, _, type) => {
      state.addNode(type)
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'hr',
    runner: (state) => {
      state.addNode('thematicBreak')
    },
  },
}))

withMeta(hrSchema.node, {
  displayName: 'NodeSchema<hr>',
  group: 'Hr',
})

withMeta(hrSchema.ctx, {
  displayName: 'NodeSchemaCtx<hr>',
  group: 'Hr',
})

/// Input rule to insert a hr.
/// For example, `---` will be converted to a hr.
export const insertHrInputRule = $inputRule(
  (ctx) =>
    new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
      const { tr } = state

      if (match[0]) tr.replaceWith(start - 1, end, hrSchema.type(ctx).create())

      return tr
    })
)

withMeta(insertHrInputRule, {
  displayName: 'InputRule<insertHrInputRule>',
  group: 'Hr',
})

/// Command to insert a hr.
export const insertHrCommand = $command(
  'InsertHr',
  (ctx) => () => (state, dispatch) => {
    if (!dispatch) return true

    const paragraph = paragraphSchema.node.type(ctx).create()
    const { tr, selection } = state
    const { from } = selection
    const node = hrSchema.type(ctx).create()
    if (!node) return true

    const _tr = tr.replaceSelectionWith(node).insert(from, paragraph)
    const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true)
    if (!sel) return true

    dispatch(_tr.setSelection(sel).scrollIntoView())
    return true
  }
)

withMeta(insertHrCommand, {
  displayName: 'Command<insertHrCommand>',
  group: 'Hr',
})
