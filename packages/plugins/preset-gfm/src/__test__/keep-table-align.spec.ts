import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor, editorViewCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { expect, it } from 'vitest'

import { gfm } from '..'

const TABLE = '| aa | bb |\n| --- | --- |\n| cc | dd |\n'

async function createEditor(markdown: string) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(rootCtx, root)
    ctx.set(defaultValueCtx, markdown)
  })
  editor.use(commonmark)
  editor.use(gfm)
  await editor.create()
  return editor
}

const view = (editor: Editor) => editor.ctx.get(editorViewCtx)

function posOf(editor: Editor, typeName: string, nth = 0) {
  let seen = 0
  let pos = -1
  view(editor).state.doc.descendants((node, p) => {
    if (node.type.name === typeName && seen++ === nth && pos < 0) pos = p
    return true
  })
  return pos
}

// Every `alignment` attr in column `col`, header row first.
function columnAlignments(editor: Editor, col: number) {
  const out: (string | null)[] = []
  view(editor).state.doc.descendants((node) => {
    if (/^table.*row$/.test(node.type.name))
      out.push(node.child(col)?.attrs.alignment ?? null)
    return true
  })
  return out
}

it('should propagate a header cell alignment to the body cells below it', async () => {
  const editor = await createEditor(TABLE)
  const headerPos = posOf(editor, 'table_header')
  const header = view(editor).state.doc.nodeAt(headerPos)!

  view(editor).dispatch(
    view(editor).state.tr.setNodeMarkup(headerPos, undefined, {
      ...header.attrs,
      alignment: 'center',
    })
  )

  expect(columnAlignments(editor, 0)).toEqual(['center', 'center'])
})

it('should propagate down the header cell own column, not the first one', async () => {
  const editor = await createEditor(
    '| aa | bb | cc |\n| --- | --- | --- |\n| dd | ee | ff |\n'
  )
  const headerPos = posOf(editor, 'table_header', 1)
  const header = view(editor).state.doc.nodeAt(headerPos)!

  view(editor).dispatch(
    view(editor).state.tr.setNodeMarkup(headerPos, undefined, {
      ...header.attrs,
      alignment: 'right',
    })
  )

  expect(columnAlignments(editor, 1)).toEqual(['right', 'right'])
  expect(columnAlignments(editor, 0)).toEqual([null, null])
  expect(columnAlignments(editor, 2)).toEqual([null, null])
})

it('should still propagate when the same transaction also inserts text', async () => {
  // "Some text changed" must not be read as "nothing structural happened".
  const editor = await createEditor(TABLE)
  const headerPos = posOf(editor, 'table_header')
  const bodyPos = posOf(editor, 'table_cell')
  const header = view(editor).state.doc.nodeAt(headerPos)!

  view(editor).dispatch(
    view(editor)
      .state.tr.insertText('zz', bodyPos + 2)
      .setNodeMarkup(headerPos, undefined, {
        ...header.attrs,
        alignment: 'right',
      })
  )

  expect(columnAlignments(editor, 0)).toEqual(['right', 'right'])
})

it('should not append a transaction when no cell needs re-aligning', async () => {
  const editor = await createEditor(`${TABLE}\npara\n`)
  const state = view(editor).state
  const tr = state.tr.insertText('x', posOf(editor, 'table_cell') + 2)

  expect(state.applyTransaction(tr).transactions).toHaveLength(1)
})

it('should not append a transaction for a structural change to a consistent table', async () => {
  // A structural change reaches the walk, which then finds nothing to realign.
  const editor = await createEditor(
    '| aa | bb |\n| :---: | ---: |\n| cc | dd |\n\npara\n'
  )
  const state = view(editor).state
  const tr = state.tr.replaceWith(
    state.doc.content.size,
    state.doc.content.size,
    state.schema.nodes.paragraph!.create()
  )

  expect(tr.docChanged).toBe(true)
  expect(state.applyTransaction(tr).transactions).toHaveLength(1)
})

it('should leave a parsed table internally consistent', async () => {
  const editor = await createEditor(
    '| aa | bb |\n| :--- | ---: |\n| cc | dd |\n'
  )

  expect(columnAlignments(editor, 0)).toEqual(['left', 'left'])
  expect(columnAlignments(editor, 1)).toEqual(['right', 'right'])
})
