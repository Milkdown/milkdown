import {
  Editor,
  defaultValueCtx,
  editorViewCtx,
  parserCtx,
  rootCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { afterEach, describe, expect, test } from 'vitest'

import { Crepe } from '../../core'
import { mathInlineSchema } from './inline-latex'
import { mathInlineRegex } from './input-rule'
import {
  inlineMathStringifyConfig,
  remarkInlineMathGuardPlugin,
  remarkMathPlugin,
} from './remark'

async function createEditor(markdown: string) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.createElement('div'))
      ctx.set(defaultValueCtx, markdown)
    })
    .config(inlineMathStringifyConfig)
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
    'It costs $5-$10 today',
    '$x$2',
  ])('keeps "%s" as plain text', async (md) => {
    expect(hasMath(await parse(md))).toBe(false)
  })

  test.each(['$E=mc^2$', 'a $x$ b', 'cost $5$ today', '$x$&#x32;'])(
    'parses "%s" as math',
    async (md) => {
      expect(hasMath(await parse(md))).toBe(true)
    }
  )
})

describe('inline math serializing', () => {
  // The guard reads `$x$2` as text. Math followed by a digit must be saved
  // in a form that loads back as math (#2516).
  test.each([
    ['x', '2', '$x$&#x32;'],
    ['x', '0.5', '$x$&#x30;.5'],
    ['\\sim', '3 to 5 days', '$\\sim$&#x33; to 5 days'],
    ['x +\ny', '2', '$x +\ny$&#x32;'],
    ['x', ' 2', '$x$ 2'],
    ['x', 'a2', '$x$a2'],
  ])(
    'saves math "%s" followed by "%s" as "%s"',
    async (value, text, markdown) => {
      const editor = await createEditor('')
      const schema = editor.ctx.get(schemaCtx)
      const doc = schema.node('doc', null, [
        schema.node('paragraph', null, [
          mathInlineSchema.type(editor.ctx).create({ value }),
          schema.text(text),
        ]),
      ])

      const saved = editor.ctx.get(serializerCtx)(doc)
      expect(saved).toBe(`${markdown}\n`)
      expect(editor.ctx.get(parserCtx)(saved).eq(doc)).toBe(true)
    }
  )

  test('encodes the digit of a text that ends with a space', async () => {
    const editor = await createEditor('')
    const schema = editor.ctx.get(schemaCtx)
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [
        mathInlineSchema.type(editor.ctx).create({ value: 'x' }),
        schema.text('2 apples '),
        schema.text('bold', [schema.mark('strong')]),
      ]),
    ])

    const saved = editor.ctx.get(serializerCtx)(doc)
    expect(saved).toBe('$x$&#x32; apples **bold**\n')
    expect(editor.ctx.get(parserCtx)(saved).eq(doc)).toBe(true)
  })

  test('leaves a digit that does not follow math as it is', async () => {
    const editor = await createEditor('1 $x$ 2 and $5')
    const doc = editor.ctx.get(editorViewCtx).state.doc

    expect(editor.ctx.get(serializerCtx)(doc)).toBe('1 $x$ 2 and \\$5\n')
  })
})

describe('inline math in crepe', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  test('keeps math followed by a typed digit after a reload', async () => {
    const crepe = new Crepe({ defaultValue: '$x$' })
    await crepe.create()
    const view = crepe.editor.ctx.get(editorViewCtx)
    // The paragraph opens at 0 and the math node takes 1 to 2.
    view.dispatch(view.state.tr.insertText('2', 2))

    const markdown = crepe.getMarkdown()
    expect(markdown).toBe('$x$&#x32;\n')
    await crepe.destroy()

    const reopened = new Crepe({ defaultValue: markdown })
    await reopened.create()
    const doc = reopened.editor.ctx.get(editorViewCtx).state.doc
    expect(hasMath(doc)).toBe(true)
    expect(doc.textContent).toBe('2')
    expect(reopened.getMarkdown()).toBe(markdown)
    await reopened.destroy()
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
