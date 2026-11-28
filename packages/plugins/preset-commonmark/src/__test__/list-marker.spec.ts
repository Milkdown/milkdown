import type { Editor } from '@milkdown/core'

import '@testing-library/jest-dom/vitest'
import {
  editorViewCtx,
  parserCtx,
  remarkStringifyOptionsCtx,
  schemaCtx,
} from '@milkdown/core'
import { DOMParser } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $ctx, callCommand, getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  commonmark,
  listMarkerHandlerPlugin,
  wrapInBulletListCommand,
} from '..'
import { roundTrip, withEditor } from './test-utils'

const viewOf = (editor: Editor) => editor.ctx.get(editorViewCtx)

// Remove a top-level block.
function removeBlock(editor: Editor, index: number) {
  const view = viewOf(editor)
  let from = 0
  for (let i = 0; i < index; i++) from += view.state.doc.child(i).nodeSize
  const to = from + view.state.doc.child(index).nodeSize
  view.dispatch(view.state.tr.delete(from, to))
}

// A plugin that changes the stringify options before the editor reads them.
const withOptions = (options: Record<string, unknown>) => {
  const plugin = $ctx(null, 'listMarkerTestOptions')
  return [
    plugin,
    (ctx: Parameters<typeof plugin>[0]) => {
      ctx.update(remarkStringifyOptionsCtx, (prev) => ({ ...prev, ...options }))
      return () => {}
    },
  ]
}

describe('list markers', () => {
  it.each([
    '- a\n- b\n',
    '+ a\n+ b\n',
    '* a\n* b\n',
    '1. a\n2. b\n',
    '1) a\n2) b\n',
    '3) a\n4) b\n',
    '- a\n  + b\n    * c\n',
    '1) a\n   - b\n',
    '- a\n  1) b\n',
    '> - a\n> - b\n',
    '- a\n\n* b\n\n+ c\n',
    '1. a\n\n1) b\n',
    '-   a\n-   b\n',
  ])('keeps the marker of %j', async (markdown) => {
    const expected = markdown.replace(/- {3}/g, '- ')
    expect(await roundTrip(markdown)).toBe(expected)
  })

  it('keeps the marker of a list that is edited', async () => {
    await withEditor('- a\n- b\n\n1) c\n2) d', (editor) => {
      const view = viewOf(editor)
      // Inside the first item, and inside the first item of the second list.
      view.dispatch(view.state.tr.insertText('!', 4))
      const second = view.state.doc.firstChild!.nodeSize + 4
      view.dispatch(view.state.tr.insertText('?', second))

      expect(editor.action(getMarkdown())).toBe('- a!\n- b\n\n1) c?\n2) d\n')
    })
  })

  it.each([
    ['- a\n\ntext\n\n- b', '- a\n\n* b\n'],
    ['* a\n\ntext\n\n* b', '* a\n\n- b\n'],
    ['+ a\n\ntext\n\n+ b', '+ a\n\n* b\n'],
    ['1. a\n\ntext\n\n1. b', '1. a\n\n1) b\n'],
    ['1) a\n\ntext\n\n1) b', '1) a\n\n1. b\n'],
  ])(
    'gives another marker to a list that would merge with the one before: %j',
    async (markdown, expected) => {
      await withEditor(markdown, (editor) => {
        removeBlock(editor, 1)
        const output = editor.action(getMarkdown())

        expect(output).toBe(expected)
        expect(editor.ctx.get(parserCtx)(output).childCount).toBe(2)
      })
    }
  )

  describe('a list with no marker', () => {
    const wrap = (editor: Editor) => {
      const view = viewOf(editor)
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, 1))
      )
      editor.action(callCommand(wrapInBulletListCommand.key))
    }

    it('is written with the default marker', async () => {
      await withEditor('text', (editor) => {
        wrap(editor)
        expect(viewOf(editor).state.doc.firstChild?.attrs.marker).toBeNull()
        expect(editor.action(getMarkdown())).toBe('* text\n')
      })
    })

    it('is written with the marker from the options', async () => {
      await withEditor(
        'text\n\n* a',
        (editor) => {
          wrap(editor)
          // The list from the markdown keeps its own marker.
          expect(editor.action(getMarkdown())).toBe('- text\n\n* a\n')
        },
        commonmark,
        withOptions({ bullet: '-' })
      )
    })

    it('takes the marker of the list around it', async () => {
      await withEditor('', (editor) => {
        const schema = editor.ctx.get(schemaCtx)
        const { bullet_list, list_item, paragraph } = schema.nodes
        const text = (value: string) =>
          paragraph!.create(null, schema.text(value))
        const inner = bullet_list!.create(
          null,
          list_item!.create({ spread: false }, text('b'))
        )
        const outer = bullet_list!.create(
          { marker: '-' },
          list_item!.create({ spread: false }, [text('a'), inner])
        )
        const view = viewOf(editor)
        view.dispatch(
          view.state.tr.replaceWith(0, view.state.doc.content.size, outer)
        )

        expect(editor.action(getMarkdown())).toBe('- a\n  - b\n')
      })
    })
  })

  it('does not fail when the other marker in the options is the marker of a list', async () => {
    await withEditor(
      '- a\n- b\n\ntext\n\n- c',
      (editor) => {
        expect(editor.action(getMarkdown())).toBe('- a\n- b\n\ntext\n\n- c\n')

        removeBlock(editor, 1)
        expect(editor.action(getMarkdown())).toBe('- a\n- b\n\n* c\n')
      },
      commonmark,
      withOptions({ bulletOther: '-' })
    )
  })

  it('is the work of listMarkerHandlerPlugin', async () => {
    const withoutHandler = commonmark.filter(
      (plugin) => plugin !== listMarkerHandlerPlugin
    )

    // The list still knows its marker. Nothing writes it.
    await withEditor(
      '- a\n\n1) b',
      (editor) => {
        expect(viewOf(editor).state.doc.firstChild?.attrs.marker).toBe('-')
        expect(editor.action(getMarkdown())).toBe('* a\n\n1. b\n')
      },
      withoutHandler
    )
  })

  describe('typing a list', () => {
    it.each(['-', '+', '*'])('keeps the marker %s', async (marker) => {
      await withEditor('', async (editor) => {
        const user = userEvent.setup()
        await user.type(viewOf(editor).dom, `${marker} item`)

        expect(viewOf(editor).state.doc.firstChild?.attrs.marker).toBe(marker)
        expect(editor.action(getMarkdown())).toBe(`${marker} item\n`)
      })
    })
  })

  describe('the DOM', () => {
    it('carries the marker and the delimiter', async () => {
      await withEditor('+ a\n\n1) b\n\n* c\n\n1. d', (editor) => {
        const { dom } = viewOf(editor)
        const [plus, star] = dom.querySelectorAll('ul')
        const [paren, dot] = dom.querySelectorAll('ol')

        expect(plus).toHaveAttribute('data-marker', '+')
        expect(star).toHaveAttribute('data-marker', '*')
        expect(paren).toHaveAttribute('data-delimiter', ')')
        expect(dot).toHaveAttribute('data-delimiter', '.')
      })
    })

    it('reads them back, and ignores what is not a marker', async () => {
      await withEditor('', (editor) => {
        const container = document.createElement('div')
        container.innerHTML = [
          '<ul data-marker="+"><li><p>a</p></li></ul>',
          '<ol data-delimiter=")"><li><p>b</p></li></ol>',
          '<ul data-marker="x"><li><p>c</p></li></ul>',
          '<ol><li><p>d</p></li></ol>',
        ].join('')

        const doc = DOMParser.fromSchema(editor.ctx.get(schemaCtx)).parse(
          container
        )

        expect(doc.child(0).attrs.marker).toBe('+')
        expect(doc.child(1).attrs.delimiter).toBe(')')
        expect(doc.child(2).attrs.marker).toBeNull()
        expect(doc.child(3).attrs.delimiter).toBeNull()
      })
    })
  })
})
