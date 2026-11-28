import type { Ctx } from '@milkdown/ctx'

import {
  defaultValueCtx,
  Editor,
  editorViewCtx,
  parserCtx,
  preserveSourceCtx,
  remarkCtx,
  remarkStringifyOptionsCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { Fragment, Slice } from '@milkdown/prose/model'
import { recordDetachedSource, SerializerState } from '@milkdown/transformer'
import {
  $node,
  $remark,
  getMarkdown,
  parseMarkdown,
  replaceAll,
} from '@milkdown/utils'
import { describe, expect, it, vi } from 'vitest'

import { gfm } from '..'

type EditorPlugins = Parameters<Editor['use']>[0]

async function withEditor<T>(
  markdown: string,
  fn: (editor: Editor) => T | Promise<T>,
  options: { config?: (ctx: Ctx) => void; plugins?: EditorPlugins[] } = {}
): Promise<T> {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, markdown)
      ctx.set(preserveSourceCtx, true)
      options.config?.(ctx)
    })
    .use(commonmark)
    .use(gfm)
  options.plugins?.forEach((plugin) => editor.use(plugin))
  await editor.create()
  try {
    return await fn(editor)
  } finally {
    await editor.destroy().catch(() => {})
  }
}

const viewOf = (editor: Editor) => editor.ctx.get(editorViewCtx)
const markdownOf = (editor: Editor) => editor.action(getMarkdown())

// The position of a top-level block.
function blockPos(editor: Editor, index: number) {
  const { doc } = viewOf(editor).state
  let pos = 0
  for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize
  return pos
}

// Type at the end of the first textblock of a top-level block.
function typeIn(editor: Editor, index: number, text: string) {
  const view = viewOf(editor)
  const from = blockPos(editor, index)
  const block = view.state.doc.child(index)
  let pos = -1
  view.state.doc.nodesBetween(from, from + block.nodeSize, (node, offset) => {
    if (pos >= 0) return false
    if (node.isTextblock) pos = offset + 1 + node.content.size
    return true
  })
  // A block such as a thematic break has no text.
  if (pos >= 0) view.dispatch(view.state.tr.insertText(text, pos))
}

function removeBlock(editor: Editor, index: number) {
  const view = viewOf(editor)
  const from = blockPos(editor, index)
  const to = from + view.state.doc.child(index).nodeSize
  view.dispatch(view.state.tr.delete(from, to))
}

function insertParagraph(editor: Editor, index: number, text: string) {
  const view = viewOf(editor)
  const { schema } = view.state
  const paragraph = schema.nodes.paragraph!.create(null, schema.text(text))
  view.dispatch(view.state.tr.insert(blockPos(editor, index), paragraph))
}

// Put the top-level block at `from` before the block at `to`.
function moveBlock(editor: Editor, from: number, to: number) {
  const view = viewOf(editor)
  const block = view.state.doc.child(from)
  const start = blockPos(editor, from)
  const tr = view.state.tr.delete(start, start + block.nodeSize)
  const target = tr.mapping.map(blockPos(editor, to))
  view.dispatch(tr.insert(target, block))
}

const title = 'Title\n====='
const list = '- a\n- b'
const table = '|x|y|\n|-|-|\n|1|2|'
const linked = 'See [the link][ref] and _this_.'
const definition = '[ref]: https://example.com'
const code = '~~~js\ncode\n~~~'
const last = 'last'
// The list has two blank lines after it, and the text has no line ending
// at its end.
const markdown = `${title}\n\n${list}\n\n\n${table}\n\n${linked}\n\n${definition}\n\n${code}\n\n${last}`

describe('preserveSourceCtx with an edited document', () => {
  it('writes only the block that changed', async () => {
    await withEditor(markdown, (editor) => {
      typeIn(editor, 5, '!')
      expect(markdownOf(editor)).toBe(`${markdown}!`)
    })
  })

  it('writes the blank lines of the serializer around a changed block', async () => {
    await withEditor(markdown, (editor) => {
      typeIn(editor, 1, '!')
      expect(markdownOf(editor)).toBe(
        `${title}\n\n- a!\n- b\n\n${table}\n\n${linked}\n\n${definition}\n\n${code}\n\n${last}`
      )
    })
  })

  it('keeps writing only the changed block while the user types', async () => {
    await withEditor(markdown, (editor) => {
      // A space at the end of a paragraph is gone after a reload, so what
      // the serializer writes here does not parse back to the same text.
      typeIn(editor, 5, ' ')
      expect(markdownOf(editor)).toBe(`${markdown} `)

      typeIn(editor, 5, 'x')
      expect(markdownOf(editor)).toBe(`${markdown} x`)
    })
  })

  it('gives the source back once the edit is gone', async () => {
    await withEditor(markdown, (editor) => {
      insertParagraph(editor, 2, 'new')
      expect(markdownOf(editor)).not.toBe(markdown)

      removeBlock(editor, 2)
      expect(markdownOf(editor)).toBe(markdown)
    })
  })

  it('keeps the text of a block that moved', async () => {
    await withEditor(markdown, (editor) => {
      moveBlock(editor, 5, 0)
      expect(markdownOf(editor)).toBe(
        `${last}\n\n${title}\n\n${list}\n\n\n${table}\n\n${linked}\n\n${definition}\n\n${code}`
      )
    })
  })

  describe('link definitions', () => {
    it('drops a definition when its only reference is written inline', async () => {
      await withEditor(markdown, (editor) => {
        typeIn(editor, 3, '!')
        expect(markdownOf(editor)).toBe(
          `${title}\n\n${list}\n\n\n${table}\n\nSee [the link](https://example.com) and _this_.!\n\n${code}\n\n${last}`
        )
      })
    })

    it('keeps a definition that another block still refers to', async () => {
      const source = `[a][ref] one\n\n[b][ref] two\n\n${definition}\n`
      await withEditor(source, (editor) => {
        typeIn(editor, 0, '!')
        expect(markdownOf(editor)).toBe(
          `[a](https://example.com) one!\n\n[b][ref] two\n\n${definition}\n`
        )
      })
    })

    it('leaves no definition behind when everything is replaced', async () => {
      await withEditor(markdown, (editor) => {
        const view = viewOf(editor)
        view.dispatch(view.state.tr.delete(0, view.state.doc.content.size))
        typeIn(editor, 0, 'new')
        expect(markdownOf(editor)).toBe('new\n')
      })
    })
  })

  describe('a text that would read differently in its new place', () => {
    it('closes a code fence before a new block', async () => {
      await withEditor('text\n\n```js\ncode', (editor) => {
        insertParagraph(editor, 2, 'new')
        expect(markdownOf(editor)).toBe('text\n\n```js\ncode\n```\n\nnew')
      })
    })

    it('keeps two lists apart when the block between them is gone', async () => {
      await withEditor(
        '_intro_\n\n- a\n\nmiddle\n\n- b\n\n_outro_',
        (editor) => {
          removeBlock(editor, 2)
          // The second list gets another marker, or the two would merge.
          expect(markdownOf(editor)).toBe('_intro_\n\n- a\n\n* b\n\n_outro_')
        }
      )
    })

    it('keeps the indentation of a block', async () => {
      const source = 'text\n\n   # h\n\n   - a\n   - b\n\n_end_'
      await withEditor(source, (editor) => {
        typeIn(editor, 0, '!')
        expect(markdownOf(editor)).toBe(source.replace('text', 'text!'))
      })
    })
  })

  describe('the form of the source', () => {
    it('follows windows line endings', async () => {
      await withEditor('a\r\n\r\n- b\r\n- c\r\n\r\nd\r\n', (editor) => {
        typeIn(editor, 0, '!')
        insertParagraph(editor, 1, 'new')
        expect(markdownOf(editor)).toBe(
          'a!\r\n\r\nnew\r\n\r\n- b\r\n- c\r\n\r\nd\r\n'
        )
      })
    })

    it('keeps a byte order mark', async () => {
      await withEditor('﻿Title\n===\n\ntext\n', (editor) => {
        typeIn(editor, 1, '!')
        expect(markdownOf(editor)).toBe('﻿Title\n===\n\ntext!\n')
      })
    })

    it('reads the marker of an emphasis behind a byte order mark', async () => {
      await withEditor('﻿_a_ b\n', (editor) => {
        expect(
          viewOf(editor).state.doc.firstChild?.firstChild?.marks[0]?.attrs
        ).toMatchObject({ marker: '_' })
      })
    })

    it('drops an empty paragraph at the end, as the serializer does', async () => {
      await withEditor('a\n\n- b\n\n<br />\n', (editor) => {
        expect(markdownOf(editor)).toBe('a\n\n- b\n\n<br />\n')

        typeIn(editor, 0, '!')
        expect(markdownOf(editor)).toBe('a!\n\n- b\n')
      })
    })
  })

  it('keeps the blocks of the previous source after an undo of replaceAll', async () => {
    await withEditor(markdown, (editor) => {
      const view = viewOf(editor)
      const before = view.state.doc

      editor.action(replaceAll('+ other'))
      // What an undo does: the old content comes back in a transaction
      // that says nothing about the source.
      view.dispatch(
        view.state.tr.replace(
          0,
          view.state.doc.content.size,
          new Slice(before.content, 0, 0)
        )
      )
      typeIn(editor, 5, '!')

      expect(markdownOf(editor)).toBe(`${markdown}!`)
    })
  })

  it('takes the source that has more of the document', async () => {
    // Both sources have a thematic break, and nothing else in common.
    const source = `${title}\n\n---\n\n${list}`

    await withEditor(source, (editor) => {
      const view = viewOf(editor)
      const before = view.state.doc

      editor.action(replaceAll('new\n\n---'))
      view.dispatch(
        view.state.tr.replace(
          0,
          view.state.doc.content.size,
          new Slice(before.content, 0, 0)
        )
      )
      insertParagraph(editor, 3, 'end')

      expect(markdownOf(editor)).toBe(`${source}\n\nend`)
    })
  })

  describe('a setup that cannot tell the blocks apart', () => {
    it('uses a serializer that replaced the default one', async () => {
      await withEditor('- a\n\n_b_', (editor) => {
        const serializer = editor.ctx.get(serializerCtx)
        editor.ctx.set(serializerCtx, (doc) => serializer(doc).toUpperCase())

        expect(markdownOf(editor)).toBe('- a\n\n_b_')
        typeIn(editor, 1, '!')
        expect(markdownOf(editor)).toBe('- A\n\n_B!_\n')
      })
    })

    it('writes the whole document when a block has no place in the text', async () => {
      const noPosition = $remark('noPosition', () => () => (tree) => {
        tree.children.forEach((node) => delete node.position)
      })

      await withEditor(
        '- a\n\n_b_',
        (editor) => {
          expect(editor.action(parseMarkdown('- a\n\n_b_')).blocks).toBeNull()
          expect(markdownOf(editor)).toBe('- a\n\n_b_')

          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toBe('- a\n\n_b!_\n')
        },
        { plugins: [noPosition] }
      )
    })
  })

  it('still tells the blocks apart when a config replaces the handlers', async () => {
    await withEditor(
      '* a\n\n_b_',
      (editor) => {
        // The config dropped the handler that keeps the marker of an
        // emphasis, so the changed block is written with `*`.
        typeIn(editor, 1, '!')
        expect(markdownOf(editor)).toBe('* a\n\n*b!*')

        // The handler for lists is an extension and not one of these
        // options, so the list still has its own marker.
        typeIn(editor, 0, '!')
        expect(markdownOf(editor)).toBe('* a!\n\n*b!*\n')
      },
      { config: (ctx) => ctx.set(remarkStringifyOptionsCtx, { bullet: '-' }) }
    )
  })

  // Any remark plugin can take nodes out of the tree. The parser only
  // knows what happened to their text when the plugin says so.
  describe('a remark plugin that takes nodes out of the tree', () => {
    const source = '_a_\n\n---\n\n_b_'
    // A plugin that wants no thematic break in the document.
    const removeRules = (record: boolean) =>
      $remark(`removeRules${record}`, () => () => (tree) => {
        const isRule = (node: { type: string }) => node.type === 'thematicBreak'
        if (record)
          recordDetachedSource(tree, {
            detached: tree.children.filter(isRule).map((node, index) => ({
              from: node.position!.start.offset!,
              to: node.position!.end.offset!,
              id: `rule-${index}`,
            })),
            uses: [],
          })
        tree.children = tree.children.filter((node) => !isRule(node))
      })

    it('keeps the text that the plugin recorded', async () => {
      await withEditor(
        source,
        (editor) => {
          const { ast, blocks, detached } = editor.action(parseMarkdown(source))
          expect(blocks).toHaveLength(2)
          expect(detached).toEqual([{ from: 5, to: 8, id: 'rule-0' }])
          // What the plugin recorded travels with the tree.
          expect(ast?.data).toMatchObject({
            milkdownDetachedSource: {
              detached: [{ from: 5, to: 8, id: 'rule-0' }],
            },
          })

          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toBe('_a_\n\n---\n\n_b!_')

          // Nothing needs the rule. It goes with the blocks around it.
          typeIn(editor, 0, '!')
          expect(markdownOf(editor)).toBe('_a!_\n\n_b!_\n')
        },
        { plugins: [removeRules(true)] }
      )
    })

    it('cannot tell the blocks apart when the plugin recorded nothing', async () => {
      await withEditor(
        source,
        (editor) => {
          expect(editor.action(parseMarkdown(source)).blocks).toBeNull()
          expect(markdownOf(editor)).toBe(source)

          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toBe('_a_\n\n_b!_\n')
        },
        { plugins: [removeRules(false)] }
      )
    })
  })

  // The editor adds its root handler with the lowest precedence. Whoever
  // brings a root handler of its own keeps it, with the option on or off.
  describe('a remark plugin with a root handler of its own', () => {
    const ownRoot = $remark(
      'ownRoot',
      () =>
        function () {
          const data = this.data() as { toMarkdownExtensions?: unknown[] }
          data.toMarkdownExtensions ??= []
          data.toMarkdownExtensions.push({
            handlers: {
              root: (
                node: unknown,
                _: unknown,
                state: {
                  containerFlow: (node: unknown, info: unknown) => string
                },
                info: unknown
              ) => `<!-- mine -->\n\n${state.containerFlow(node, info)}`,
            },
          })
        }
    )

    it('still writes the root', async () => {
      await withEditor(
        '- a\n\n_b_',
        (editor) => {
          const { doc } = viewOf(editor).state
          expect(editor.ctx.get(serializerCtx)(doc)).toMatch(/^<!-- mine -->/)

          // The document was not edited, so the source comes back.
          expect(markdownOf(editor)).toBe('- a\n\n_b_')

          // The blocks cannot be told apart with that handler, so the
          // whole document is written, by that handler.
          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toMatch(/^<!-- mine -->\n\n/)
        },
        { plugins: [ownRoot] }
      )
    })
  })

  describe('a document schema that does not use injectRoot', () => {
    const plainDoc = $node('doc', () => ({
      content: 'block+',
      parseMarkdown: {
        match: ({ type }) => type === 'root',
        runner: (state, node, type) => {
          state.injectRoot(node, type)
        },
      },
      toMarkdown: {
        match: (node) => node.type.name === 'doc',
        runner: (state, node) => {
          state.openNode('root')
          state.next(node.content)
        },
      },
    }))

    it('writes the whole document once it changes', async () => {
      await withEditor(
        '- a\n\n_b_',
        (editor) => {
          const segments = SerializerState.createSegmenter(
            editor.ctx.get(schemaCtx),
            editor.ctx.get(remarkCtx)
          )(viewOf(editor).state.doc)
          // The texts are there, but not the nodes they belong to.
          expect(segments?.texts).toHaveLength(2)
          expect(segments?.nodes).toBeNull()

          expect(markdownOf(editor)).toBe('- a\n\n_b_')
          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toBe(
            editor.ctx.get(serializerCtx)(viewOf(editor).state.doc)
          )
        },
        { plugins: [plainDoc] }
      )
    })
  })

  it('says once that it cannot tell the blocks apart, and writes the document', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const createSegmenter = vi
      .spyOn(SerializerState, 'createSegmenter')
      .mockReturnValue(() => {
        throw new Error('remark changed')
      })

    try {
      await withEditor('- a\n\n_b_', (editor) => {
        expect(markdownOf(editor)).toBe('- a\n\n_b_')

        typeIn(editor, 1, '!')
        const written = editor.ctx.get(serializerCtx)(viewOf(editor).state.doc)
        expect(markdownOf(editor)).toBe(written)
        expect(markdownOf(editor)).toBe(written)
        expect(warn).toHaveBeenCalledTimes(1)
      })
    } finally {
      createSegmenter.mockRestore()
      warn.mockRestore()
    }
  })

  // Several editors on one page are common. Nothing they keep is shared.
  it('keeps the blocks of each editor on a page apart', async () => {
    const rest = `${table}\n\n+ x`

    await withEditor(markdown, (first) =>
      withEditor(`Other\n-----\n\n${rest}`, (second) => {
        typeIn(first, 5, '!')
        typeIn(second, 0, '?')

        expect(markdownOf(first)).toBe(`${markdown}!`)
        expect(markdownOf(second)).toBe(`## Other?\n\n${rest}`)
        // The first editor is as it was.
        expect(markdownOf(first)).toBe(`${markdown}!`)
      })
    )
  })

  describe('SerializerState.createSegmenter', () => {
    const segmentsOf = (editor: Editor) =>
      SerializerState.createSegmenter(
        editor.ctx.get(schemaCtx),
        editor.ctx.get(remarkCtx)
      )(viewOf(editor).state.doc)

    it('gives the text and the node of each block', async () => {
      await withEditor('- a\n\ntext\n\n> quote\n\n<br />\n', (editor) => {
        const { doc } = viewOf(editor).state
        const { full, texts, separators, nodes } = segmentsOf(editor)!

        expect(full).toBe(editor.ctx.get(serializerCtx)(doc))
        expect(texts).toHaveLength(3)
        expect(texts.slice(1)).toEqual(['text', '> quote'])
        expect(separators).toEqual(['\n\n', '\n\n'])
        expect(
          texts.map((text, at) => text + (separators[at] ?? '\n')).join('')
        ).toBe(full)
        // The empty paragraph at the end wrote nothing, so it has no text.
        expect(doc.childCount).toBe(4)
        expect(nodes).toEqual([doc.child(0), doc.child(1), doc.child(2)])
      })
    })

    it('gives the text that a list has on its own after another list', async () => {
      await withEditor('- a\n\ntext\n\n- b', (editor) => {
        const alone = segmentsOf(editor)!.keys[2]

        removeBlock(editor, 1)
        const { texts, keys } = segmentsOf(editor)!

        // The second list is written with another marker here.
        expect(texts[1]).not.toBe(alone)
        expect(keys[1]).toBe(alone)
      })
    })

    it('gives nothing when the remark instance has another root handler', async () => {
      await withEditor(
        '- a\n\ntext',
        (editor) => {
          expect(segmentsOf(editor)).toBeNull()
          // Without the texts of the blocks, the whole document is
          // written once it changes.
          expect(markdownOf(editor)).toBe('- a\n\ntext')
          typeIn(editor, 1, '!')
          expect(markdownOf(editor)).toBe(
            editor.ctx.get(serializerCtx)(viewOf(editor).state.doc)
          )
        },
        {
          config: (ctx) =>
            ctx.update(remarkStringifyOptionsCtx, (options) => ({
              ...options,
              handlers: {
                ...options.handlers,
                root: (node, _, state, info) => state.containerFlow(node, info),
              },
            })),
        }
      )
    })
  })

  describe('parseMarkdown', () => {
    it('tells where each block is in the text', async () => {
      const source = `﻿${title}\n\n   - a\n   - b\n\n${linked}\n\n${definition}\n`

      await withEditor('', (editor) => {
        const { doc, ast, blocks, detached } = editor.action(
          parseMarkdown(source)
        )
        const text = (range: { from: number; to: number }) =>
          source.slice(range.from, range.to)

        expect(ast?.children).toHaveLength(3)
        expect(doc.childCount).toBe(3)
        expect(blocks?.map(text)).toEqual([title, '   - a\n   - b', linked])
        expect(blocks?.map((block) => block.requires)).toEqual([
          [],
          [],
          ['ref'],
        ])
        expect(detached.map(text)).toEqual([definition])
        expect(detached[0]?.id).toBe('ref')
      })
    })

    it('has no block for an empty text', async () => {
      await withEditor('', (editor) => {
        const { doc, blocks } = editor.action(parseMarkdown('\n'))
        expect(blocks).toEqual([])
        expect(doc.childCount).toBe(1)
      })
    })
  })

  // Whatever the edit, the markdown must load into the same document as
  // what the serializer writes. Both are compared after one more save,
  // because the serializer does not always write text that parses back to
  // itself, for example a paragraph that ends with a space.
  describe('random edits', () => {
    const sources = [
      markdown,
      '- a\n- b\n\n* c\n\n1. d\n2. e\n\n1) f\n\ntext\n===\n\n+ g\n',
      '> quote\n\n```\ncode\n```\n\n    indented\n\n<div>html</div>\n\n---\n\n***\n',
      '[a][x] and [b][y]\n\n[x]: /x\n[y]: /y\n\n![img][x]\n\ntext[^1]\n\n[^1]: note\n',
      'a  \nb\n\n# c #\n\nd\n-\n\n| t |\n|---|\n| 1 |\n\n- [ ] task\n- [x] done\n',
      'one\n\n\n\ntwo\n\n<br />\n\nthree\r\n\r\nfour',
    ]

    it.each(sources)('keeps the document for %j', async (source) => {
      // A small generator, so a failure can be repeated.
      let seed = 7
      const random = (max: number) => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed % max
      }

      await withEditor(source, (editor) => {
        const parser = editor.ctx.get(parserCtx)
        const serializer = editor.ctx.get(serializerCtx)
        const normalize = (text: string) => serializer(parser(text))
        let preserved = 0

        for (let step = 0; step < 60; step++) {
          const view = viewOf(editor)
          const count = view.state.doc.childCount
          const at = random(count)
          const action = random(5)

          if (action === 0 && count > 1) removeBlock(editor, at)
          else if (action === 1) insertParagraph(editor, at, `new ${step}`)
          else if (action === 2 && count > 1)
            moveBlock(editor, at, random(count))
          else if (action === 3)
            view.dispatch(
              view.state.tr.insert(
                blockPos(editor, at),
                Fragment.from(view.state.doc.child(at))
              )
            )
          else typeIn(editor, at, 'x')

          const written = serializer(viewOf(editor).state.doc)
          const result = markdownOf(editor)
          expect(normalize(result), `step ${step}: ${result}`).toBe(
            normalize(written)
          )
          if (result !== written) preserved++
        }

        // The edits leave most documents with blocks of the source.
        expect(preserved).toBeGreaterThan(0)
      })
    })
  })
})
