import { editorViewCtx } from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

const targetList = '* Bullet one\n\n  7. Nested item\n* Bullet two'

const cases = [
  { name: 'at the document start', prefix: '', target: targetList },
  {
    name: 'after a heading and paragraph',
    prefix: '### Keep this heading\n\nKeep this paragraph.\n\n',
    target: targetList,
  },
  {
    name: 'inside a blockquote',
    prefix: '### Keep this heading\n\n',
    target: targetList
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n'),
  },
]

describe('list order after moving an item', () => {
  it.each(cases)('normalizes the target $name', async ({ prefix, target }) => {
    await withEditor(
      `${prefix}${target}\n\n1. First item\n2. Second item`,
      (editor) => {
        const view = editor.ctx.get(editorViewCtx)
        const before = view.state.doc
        let sourcePos = -1
        let targetPos = -1
        before.descendants((node, pos) => {
          if (
            node.type.name === 'list_item' &&
            node.firstChild?.textContent === 'Second item'
          )
            sourcePos = pos
          if (node.type.name === 'bullet_list') targetPos = pos
        })
        const item = before.nodeAt(sourcePos)!
        const list = before.nodeAt(targetPos)!
        const tr = view.state.tr
        // A correct label must not hide a stale list type.
        tr.setNodeMarkup(targetPos + 1, undefined, {
          ...list.firstChild!.attrs,
          label: '2.',
        })
        tr.delete(sourcePos, sourcePos + item.nodeSize)
        tr.insert(tr.mapping.map(targetPos + 1), item)

        expect(() => view.dispatch(tr)).not.toThrow()
        const after = view.state.doc
        expect(() => after.check()).not.toThrow()
        const normalized = after.nodeAt(targetPos)!
        expect(normalized.type.name).toBe('ordered_list')
        expect(
          Array.from({ length: normalized.childCount }, (_, index) => {
            const child = normalized.child(index)
            return [child.attrs.label, child.attrs.listType]
          })
        ).toEqual([
          ['1.', 'ordered'],
          ['2.', 'ordered'],
          ['3.', 'ordered'],
        ])
        expect(normalized.child(1).child(1).toJSON()).toEqual(
          list.firstChild!.child(1).toJSON()
        )
        expect(after.cut(0, targetPos).toJSON()).toEqual(
          before.cut(0, targetPos).toJSON()
        )
      }
    )
  })
})
