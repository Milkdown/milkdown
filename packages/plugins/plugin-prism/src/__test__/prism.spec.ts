import type * as Prose from '@milkdown/prose'
import type { EditorView } from '@milkdown/prose/view'
import type { Refractor } from 'refractor/core'

import { defaultValueCtx, Editor, editorViewCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { expect, it, vi } from 'vitest'

import { prism, prismConfig } from '..'

// `findChildren` allocates an entry for every node, so its call count is the
// observable for "did this transaction walk the document".
const walks = { count: 0 }
vi.mock('@milkdown/prose', async (importOriginal) => {
  const actual = await importOriginal<typeof Prose>()
  return {
    ...actual,
    findChildren: (predicate: Parameters<typeof actual.findChildren>[0]) => {
      const run = actual.findChildren(predicate)
      return (...args: Parameters<typeof run>) => {
        walks.count += 1
        return run(...args)
      }
    },
  }
})

const DOC = [
  '# Heading',
  '',
  'Some prose before the code.',
  '',
  '```js',
  'const x = 1;',
  'function hello(name) { return name; }',
  '```',
  '',
  'More prose between the blocks.',
  '',
  '```css',
  '.cls { color: red; }',
  '```',
  '',
  'Trailing prose.',
  '',
].join('\n')

const CUSTOM_CLASS = 'custom-refractor-token'

// Wraps each block's whole text in a class no real prism grammar emits, so
// every decoration names the instance that produced it.
const customRefractor = {
  listLanguages: () => ['js', 'css'],
  highlight: (value: string) => ({
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [CUSTOM_CLASS] },
        children: [{ type: 'text', value }],
      },
    ],
  }),
} as unknown as Refractor

async function createEditor(
  markdown: string,
  configureRefractor?: (refractor: Refractor) => void | Refractor
) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(rootCtx, root)
    ctx.set(defaultValueCtx, markdown)
    if (configureRefractor) ctx.set(prismConfig.key, { configureRefractor })
  })
  editor.use(commonmark)
  editor.use(prism)
  await editor.create()
  return editor
}

const view = (editor: Editor) => editor.ctx.get(editorViewCtx)

function prismPluginOf(v: EditorView) {
  const plugin = v.state.plugins.find((p) =>
    String((p as { key?: string }).key ?? '').startsWith('MILKDOWN_PRISM')
  )
  if (!plugin) throw new Error('prism plugin not registered')
  return plugin as unknown as {
    getState(state: unknown): { find(): { from: number; to: number }[] }
  }
}

// The decoration set, normalized to a comparable, order-stable shape.
function decorations(v: EditorView) {
  return prismPluginOf(v)
    .getState(v.state)
    .find()
    .map((d) => {
      const attrs = (d as unknown as { type: { attrs?: { class?: string } } })
        .type.attrs
      return `${d.from}-${d.to}:${attrs?.class ?? ''}`
    })
    .sort()
}

function posOfCodeBlock(v: EditorView, nth = 0) {
  let seen = 0
  let pos = -1
  v.state.doc.descendants((node, p) => {
    if (node.type.name === 'code_block' && seen++ === nth && pos < 0) pos = p
    return true
  })
  return pos
}

it('should decorate every code block on load', async () => {
  const editor = await createEditor(DOC)
  const decos = decorations(view(editor))

  expect(decos.length).toBeGreaterThan(10)
})

it('should keep the decoration set identical when only the caret moves', async () => {
  const editor = await createEditor(DOC)
  const before = prismPluginOf(view(editor)).getState(view(editor).state)

  view(editor).dispatch(
    view(editor).state.tr.setSelection(
      TextSelection.create(view(editor).state.doc, 3)
    )
  )

  expect(prismPluginOf(view(editor)).getState(view(editor).state)).toBe(before)
})

it('should re-highlight a code block edited in place', async () => {
  const editor = await createEditor(DOC)
  const pos = posOfCodeBlock(view(editor))

  view(editor).dispatch(
    view(editor).state.tr.setSelection(
      TextSelection.create(view(editor).state.doc, pos + 2)
    )
  )
  view(editor).dispatch(
    view(editor).state.tr.insertText('const y = 2; ', pos + 1)
  )

  // A second `keyword` means the new `const` was tokenized, not that the old
  // decorations shifted along.
  const decos = decorations(view(editor))
  expect(decos.filter((d) => d.includes('keyword')).length).toBeGreaterThan(1)
})

it('should produce the same decorations as a full recompute after editing one block', async () => {
  const edited = await createEditor(DOC)
  const pos = posOfCodeBlock(view(edited))
  view(edited).dispatch(
    view(edited).state.tr.setSelection(
      TextSelection.create(view(edited).state.doc, pos + 2)
    )
  )
  view(edited).dispatch(
    view(edited).state.tr.insertText('let z = 3; ', pos + 1)
  )

  const fresh = await createEditor(
    DOC.replace('const x = 1;', 'let z = 3; const x = 1;')
  )

  expect(decorations(view(edited))).toEqual(decorations(view(fresh)))
})

it('should leave code block decorations untouched when prose is edited', async () => {
  const editor = await createEditor(DOC)
  const before = decorations(view(editor))

  // The trailing paragraph sits after both code blocks, so no position shifts.
  const end = view(editor).state.doc.content.size - 2
  view(editor).dispatch(view(editor).state.tr.insertText('zzz', end))

  expect(decorations(view(editor))).toEqual(before)
})

it('should re-highlight when a code block language changes', async () => {
  const editor = await createEditor(DOC)
  const pos = posOfCodeBlock(view(editor))
  const node = view(editor).state.doc.nodeAt(pos)!
  const before = decorations(view(editor))

  view(editor).dispatch(
    view(editor).state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      language: 'css',
    })
  )

  expect(decorations(view(editor))).not.toEqual(before)
})

it('should re-highlight a non-first code block when its language changes via setNodeAttribute', async () => {
  // `updateCodeBlockLanguageCommand` and the code-block node view both
  // change the language with `setNodeAttribute`. Its `AttrStep` carries
  // no `from` or `to`, so the step scan cannot see the change. The
  // block-language comparison covers every block, not only the first.
  const editor = await createEditor(DOC)
  const before = decorations(view(editor))
  const secondPos = posOfCodeBlock(view(editor), 1)

  // The caret sits in the prose above, outside every code block, which
  // is the case the step scan missed.
  view(editor).dispatch(
    view(editor).state.tr.setSelection(
      TextSelection.create(view(editor).state.doc, 1)
    )
  )
  view(editor).dispatch(
    view(editor).state.tr.setNodeAttribute(secondPos, 'language', 'js')
  )

  const after = decorations(view(editor))
  const fresh = await createEditor(DOC.replace('```css', '```js'))

  // The stale css highlighting is gone, and the block matches a fresh
  // run.
  expect(after).not.toEqual(before)
  expect(after).toEqual(decorations(view(fresh)))
})

it('should re-highlight the first code block when its language changes via setNodeAttribute', async () => {
  const editor = await createEditor(DOC)
  const before = decorations(view(editor))
  const firstPos = posOfCodeBlock(view(editor))

  view(editor).dispatch(
    view(editor).state.tr.setNodeAttribute(firstPos, 'language', 'css')
  )

  expect(decorations(view(editor))).not.toEqual(before)
})

it('should re-highlight when a code block is removed', async () => {
  const editor = await createEditor(DOC)
  const pos = posOfCodeBlock(view(editor))
  const node = view(editor).state.doc.nodeAt(pos)!

  view(editor).dispatch(view(editor).state.tr.delete(pos, pos + node.nodeSize))

  // Every remaining decoration must sit inside the surviving code block.
  const remaining = posOfCodeBlock(view(editor))
  const survivor = view(editor).state.doc.nodeAt(remaining)!
  const decos = prismPluginOf(view(editor)).getState(view(editor).state).find()

  expect(decos.length).toBeGreaterThan(0)
  expect(
    decos.every(
      (d) => d.from >= remaining && d.to <= remaining + survivor.nodeSize
    )
  ).toBe(true)
})

it('should match a full recompute after two code blocks are joined', async () => {
  // A join leaves the change inside one textblock of the new doc while
  // spanning two of the old one, so `changedTextblock` has to check both docs.
  const editor = await createEditor(
    [
      '```js',
      'const a = 1;',
      '```',
      '',
      '```js',
      'const b = 2;',
      '```',
      '',
    ].join('\n')
  )
  const first = posOfCodeBlock(view(editor))
  const firstNode = view(editor).state.doc.nodeAt(first)!
  const second = posOfCodeBlock(view(editor), 1)

  // Delete from the end of the first block's text to the start of the second's.
  view(editor).dispatch(
    view(editor).state.tr.delete(first + firstNode.nodeSize - 1, second + 1)
  )

  const fresh = await createEditor(
    ['```js', 'const a = 1;const b = 2;', '```', ''].join('\n')
  )

  expect(decorations(view(editor))).toEqual(decorations(view(fresh)))
})

it('should drop highlights when a code block is absorbed into a paragraph', async () => {
  // The change lands inside one paragraph of the new doc, but a code block
  // vanished from the old one. Treated as an edit within a paragraph, the
  // mapped highlights would survive on top of ordinary prose.
  const editor = await createEditor(
    ['text', '', '```js', 'const a = 1;', '```', ''].join('\n')
  )
  const codePos = posOfCodeBlock(view(editor))
  view(editor).dispatch(view(editor).state.tr.delete(5, codePos + 1))

  expect(posOfCodeBlock(view(editor))).toBe(-1)
  expect(decorations(view(editor))).toEqual([])
})

it('should keep using a custom refractor instance after the first render', async () => {
  const editor = await createEditor(DOC, () => customRefractor)
  const isCustom = (decos: string[]) =>
    decos.length > 0 && decos.every((d) => d.endsWith(`:${CUSTOM_CLASS}`))

  expect(isCustom(decorations(view(editor)))).toBe(true)

  const pos = posOfCodeBlock(view(editor))
  view(editor).dispatch(
    view(editor).state.tr.setSelection(
      TextSelection.create(view(editor).state.doc, pos + 2)
    )
  )
  view(editor).dispatch(view(editor).state.tr.insertText('x', pos + 1))

  expect(isCustom(decorations(view(editor)))).toBe(true)
})

it('should build the language list once for a whole-document highlight', async () => {
  let calls = 0
  const counting = {
    ...customRefractor,
    listLanguages: () => {
      calls += 1
      return ['js', 'css']
    },
  } as unknown as Refractor

  await createEditor(DOC, () => counting)

  expect(calls).toBe(1)
})

it('should not walk the document when only the caret moves', async () => {
  const editor = await createEditor(DOC)
  walks.count = 0

  for (let i = 0; i < 5; i++) {
    view(editor).dispatch(
      view(editor).state.tr.setSelection(
        TextSelection.create(view(editor).state.doc, 3 + i)
      )
    )
  }

  expect(walks.count).toBe(0)
})

it('should not walk the document when typing in a paragraph', async () => {
  const editor = await createEditor(DOC)
  const end = view(editor).state.doc.content.size - 2
  walks.count = 0

  view(editor).dispatch(view(editor).state.tr.insertText('a', end))

  expect(walks.count).toBe(0)
})

it('should not walk the document when typing inside a code block', async () => {
  const editor = await createEditor(DOC)
  const pos = posOfCodeBlock(view(editor))
  view(editor).dispatch(
    view(editor).state.tr.setSelection(
      TextSelection.create(view(editor).state.doc, pos + 2)
    )
  )
  walks.count = 0

  view(editor).dispatch(view(editor).state.tr.insertText('x', pos + 1))

  expect(walks.count).toBe(0)
})
