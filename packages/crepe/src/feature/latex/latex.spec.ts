import {
  Editor,
  defaultValueCtx,
  editorViewCtx,
  parserCtx,
  rootCtx,
  serializerCtx,
} from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { describe, expect, test } from 'vitest'

import { mathInlineSchema } from './inline-latex'
import { mathInlineRegex } from './input-rule'
import { remarkInlineMathGuardPlugin, remarkMathPlugin } from './remark'

async function createEditor(markdown: string) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.createElement('div'))
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(remarkMathPlugin)
    .use(remarkInlineMathGuardPlugin)
    .use(mathInlineSchema)
  await editor.create()
  return editor
}

async function parse(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.ctx.get(editorViewCtx).state.doc
}

function hasMath(doc: Awaited<ReturnType<typeof parse>>) {
  let found = false
  doc.descendants((node) => {
    if (node.type.name === 'math_inline') found = true
  })
  return found
}

describe('inline math parsing', () => {
  test.each([
    'Lunch was $5 and dinner $10.',
    'costs $ 5 and $ 10',
    'a $x $ b',
    'it is $5 and $10 and more',
  ])('keeps "%s" as plain text', async (md) => {
    expect(hasMath(await parse(md))).toBe(false)
  })

  test.each(['$E=mc^2$', 'a $x$ b', 'cost $5$ today'])(
    'parses "%s" as math',
    async (md) => {
      expect(hasMath(await parse(md))).toBe(true)
    }
  )
})

describe('inline math serializing', () => {
  // Inline math before a digit must not save as `$x$2`, which reopens as
  // text (#2516).
  test.each([
    ['$$x$$2', '$$x$$2'],
    ['$$x$$0.5', '$$x$$0.5'],
    ['a $$\\sim$$3 to $$\\sim$$5 days', 'a $$\\sim$$3 to $$\\sim$$5 days'],
    ['$$x$$ 2', '$x$ 2'],
    ['a $x$ b', 'a $x$ b'],
  ])('saves "%s" as "%s" and reopens it as math', async (md, saved) => {
    const editor = await createEditor(md)
    const doc = editor.ctx.get(editorViewCtx).state.doc
    expect(hasMath(doc)).toBe(true)

    const markdown = editor.ctx.get(serializerCtx)(doc)
    expect(markdown).toBe(`${saved}\n`)
    expect(editor.ctx.get(parserCtx)(markdown).eq(doc)).toBe(true)
  })

  test('saves multi-line math before a digit on one line', async () => {
    const editor = await createEditor('a\n$x +\ny$ 2\n\nb')
    const view = editor.ctx.get(editorViewCtx)
    let end = 0
    view.state.doc.descendants((node, pos) => {
      if (node.type.name === 'math_inline') end = pos + node.nodeSize
    })
    view.dispatch(view.state.tr.delete(end, end + 1))

    const markdown = editor.ctx.get(serializerCtx)(view.state.doc)
    expect(markdown).toBe('a\n$$x + y$$2\n\nb\n')

    const doc = editor.ctx.get(parserCtx)(markdown)
    expect(doc.childCount).toBe(2)
    expect(hasMath(doc.child(0))).toBe(true)
    expect(doc.child(1).textContent).toBe('b')
  })
})

describe('inline math input rule', () => {
  test.each(['$E=mc^2$', '$x$', 'a $a b$'])('matches "%s"', (text) => {
    expect(mathInlineRegex.test(text)).toBe(true)
  })

  test.each(['Lunch was $5 and dinner $', '$ x$', '$x $', '$$', '$'])(
    'does not match "%s"',
    (text) => {
      expect(mathInlineRegex.test(text)).toBe(false)
    }
  )
})
