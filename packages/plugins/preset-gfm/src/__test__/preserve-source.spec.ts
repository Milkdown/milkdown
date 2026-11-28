import type { DefaultValue } from '@milkdown/core'
import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  defaultValueCtx,
  Editor,
  editorStateTimerCtx,
  editorViewCtx,
  markdownSourceKey,
  parserCtx,
  ParserReady,
  preserveSourceCtx,
  serializerCtx,
  sourceParserCtx,
} from '@milkdown/core'
import { createTimer } from '@milkdown/ctx'
import { commonmark } from '@milkdown/preset-commonmark'
import { Slice } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { getMarkdown, replaceAll, setMarkdownSource } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { gfm } from '..'

// Each source has something that the serializer rewrites.
const sources = [
  ['a dash bullet list', '- a\n- b\n'],
  ['a plus bullet list', '+ a\n+ b\n'],
  ['an ordered list with a parenthesis', '1) a\n2) b\n'],
  ['an ordered list that repeats its number', '1. a\n1. b\n1. c\n'],
  ['adjacent lists', '- a\n\n* b\n\n1. c\n\n1) d\n'],
  ['a list right after a paragraph', 'text\n- a\n- b\n'],
  ['a loose list', '- a\n\n- b\n'],
  ['a table with no padding', '|a|b|\n|-|:-:|\n|1|2|\n'],
  ['a setext heading', 'Title\n=====\n\ntext\n'],
  ['a closed atx heading', '## Title ##\n\ntext\n'],
  ['an underscore emphasis', '_a_ and __b__\n'],
  ['a dash thematic break', 'a\n\n---\n\nb\n'],
  ['a tilde code fence', '~~~js\ncode\n~~~\n'],
  ['an indented code block', 'a\n\n    code\n'],
  [
    'a reference link',
    'See [the link][ref].\n\n[ref]: https://example.com "Title"\n',
  ],
  ['a bare url', 'Go to https://example.com now.\n'],
  [
    'a link with its url as text',
    '[https://example.com](https://example.com)\n',
  ],
  ['an escape that is not needed', 'a \\- b and 1\\. c\n'],
  ['a character reference', 'a &amp; b &copy;\n'],
  ['a hard break of two spaces', 'a  \nb\n'],
  ['many blank lines', 'a\n\n\n\nb\n'],
  ['no newline at the end', 'a\n\nb'],
  ['blank lines at both ends', '\n\na\n\n\n'],
  ['windows line endings', 'a\r\n\r\n- b\r\n- c\r\n'],
  ['a byte order mark', '﻿# Title\n\ntext\n'],
  ['a footnote', 'a[^1]\n\n[^1]: note\n'],
  ['a task list', '- [ ] a\n- [x] b\n'],
  ['a trailing space', 'a \n\nb\n'],
  ['an html comment', '<!-- note -->\n\ntext\n'],
  ['nested lists', '- a\n  - b\n  - c\n\n1. d\n   * e\n     1. f\n'],
  ['a blockquote', '> a\n> b\n>\n> - c\n\n>d\ne\n'],
  ['a hard break of a backslash', 'a\\\nb\n'],
  ['html', '<div>\n<p>hi</p>\n</div>\n\ntext <span>x</span>\n'],
  ['an image with a title', "![alt](a.png 'title')\n"],
  [
    'empty line placeholders',
    '123\n\n<br />\n\n456\n\n<br>\n\n- <br />\n- <br />\n\n> <br />\n',
  ],
  ['a table with only a header', '| a | b |\n| - | - |\n'],
  [
    'code blocks',
    '```js\nconst a = 1\n```\n\n```\n\n```\n\n````md\n```\n````\n',
  ],
  ['an empty document', ''],
  ['only blank lines', '\n\n'],
] as const

// A heading that the serializer writes in another form.
const setext = 'Title\n====='
const atx = '# Title\n'

async function withEditor<T>(
  defaultValue: DefaultValue,
  fn: (editor: Editor) => T | Promise<T>,
  preserveSource = true
): Promise<T> {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, defaultValue)
      ctx.set(preserveSourceCtx, preserveSource)
    })
    .use(commonmark)
    .use(gfm)
  await editor.create()
  try {
    return await fn(editor)
  } finally {
    await editor.destroy().catch(() => {})
  }
}

const viewOf = (editor: Editor) => editor.ctx.get(editorViewCtx)

// Type at the end of the first textblock.
function type(editor: Editor, text: string) {
  const view = viewOf(editor)
  let pos = -1
  view.state.doc.descendants((node, offset) => {
    if (pos >= 0) return false
    if (node.isTextblock) pos = offset + 1 + node.content.size
    return true
  })
  view.dispatch(view.state.tr.insertText(text, pos))
  return pos
}

describe('preserveSourceCtx', () => {
  describe('a document that was not edited', () => {
    it.each(sources)('gives back %s', async (_name, markdown) => {
      await withEditor(markdown, (editor) => {
        expect(editor.action(getMarkdown())).toBe(markdown)
      })
    })

    it('stays off by default', async () => {
      await withEditor(
        setext,
        (editor) => {
          expect(markdownSourceKey.getState(viewOf(editor).state)).toBe(
            undefined
          )
          expect(editor.action(getMarkdown())).toBe(atx)
        },
        false
      )
    })

    it('does not change the serializer or a ranged getMarkdown', async () => {
      await withEditor(setext, (editor) => {
        const { doc } = viewOf(editor).state
        expect(editor.ctx.get(serializerCtx)(doc)).toBe(atx)
        expect(
          editor.action(getMarkdown({ from: 0, to: doc.content.size }))
        ).toBe(atx)
      })
    })

    it('ignores what plugins change on load', async () => {
      const markdown = 'Title\n=====\n\n- a\n'
      await withEditor(markdown, (editor) => {
        const { state } = viewOf(editor)
        // The heading got its id, so this is no longer the parsed document.
        expect(state.doc.firstChild?.attrs.id).toBe('title')
        expect(markdownSourceKey.getState(state)?.current?.doc).not.toBe(
          state.doc
        )
        expect(editor.action(getMarkdown())).toBe(markdown)
      })
    })
  })

  describe('a document that was edited', () => {
    it('gives the serialized markdown', async () => {
      await withEditor(setext, (editor) => {
        type(editor, '!')
        expect(editor.action(getMarkdown())).toBe('# Title!\n')
      })
    })

    it('gives the source back once the edit is gone', async () => {
      const markdown = 'Title\n=====\n\n- a\n- b'
      await withEditor(markdown, (editor) => {
        const pos = type(editor, '!')
        expect(editor.action(getMarkdown())).not.toBe(markdown)

        const view = viewOf(editor)
        view.dispatch(view.state.tr.delete(pos, pos + 1))
        expect(editor.action(getMarkdown())).toBe(markdown)
      })
    })
  })

  describe('replaceAll', () => {
    it.each([false, true])(
      'takes the new markdown as the source (flush: %s)',
      async (flush) => {
        await withEditor('- a', (editor) => {
          editor.action(replaceAll('+ b\n+ c', flush))
          expect(editor.action(getMarkdown())).toBe('+ b\n+ c')
        })
      }
    )

    it('gives the old source back after the replacement is undone', async () => {
      await withEditor('- a\n- b', (editor) => {
        const view = viewOf(editor)
        const before = view.state.doc

        editor.action(replaceAll('+ c'))
        expect(editor.action(getMarkdown())).toBe('+ c')

        // What an undo does: the old content comes back in a transaction
        // that says nothing about the source.
        view.dispatch(
          view.state.tr.replace(
            0,
            view.state.doc.content.size,
            new Slice(before.content, 0, 0)
          )
        )
        expect(editor.action(getMarkdown())).toBe('- a\n- b')
      })
    })
  })

  describe('setMarkdownSource', () => {
    it('forgets the source', async () => {
      await withEditor(setext, (editor) => {
        editor.action(setMarkdownSource(null))
        expect(editor.action(getMarkdown())).toBe(atx)
      })
    })

    it('gives a source to a document that has none', async () => {
      const json = await withEditor(setext, (editor) =>
        viewOf(editor).state.doc.toJSON()
      )

      await withEditor({ type: 'json', value: json }, (editor) => {
        expect(editor.action(getMarkdown())).toBe(atx)

        editor.action(setMarkdownSource(setext))
        expect(editor.action(getMarkdown())).toBe(setext)
      })
    })

    it('does not change the document', async () => {
      await withEditor(setext, (editor) => {
        editor.action(setMarkdownSource(null))
        const before = viewOf(editor).state.doc

        editor.action(setMarkdownSource('+ other'))
        expect(viewOf(editor).state.doc).toBe(before)
        // The document does not have the content of that source.
        expect(editor.action(getMarkdown())).toBe(atx)
      })
    })

    it('keeps the source it had as the previous one', async () => {
      await withEditor('- a', (editor) => {
        editor.action(setMarkdownSource('+ other'))
        const sources = markdownSourceKey.getState(viewOf(editor).state)
        expect(sources?.current?.source).toBe('+ other')
        expect(sources?.previous?.source).toBe('- a')
        // The document still has the content of the previous source.
        expect(editor.action(getMarkdown())).toBe('- a')
      })
    })
  })

  it('gives the old source back when the replacement only changed the form', async () => {
    const before = '|a|b|\n|-|-|\n|1|2|'
    const after = '| a | b |\n| - | - |\n| 1 | 2 |\n'

    await withEditor(before, (editor) => {
      const view = viewOf(editor)
      const doc = view.state.doc

      editor.action(replaceAll(after))
      expect(editor.action(getMarkdown())).toBe(after)

      // Both sources have the content of the document now. The nodes of
      // the document are the ones of the first source again.
      view.dispatch(
        view.state.tr.replace(
          0,
          view.state.doc.content.size,
          new Slice(doc.content, 0, 0)
        )
      )
      expect(editor.action(getMarkdown())).toBe(before)
    })
  })

  describe('a parser that does not record what it parsed', () => {
    // The parser of a plugin that gives a document of its own.
    const Wrapped = createTimer('WrappedParserReady')
    const wrapParser: MilkdownPlugin = (ctx) => {
      ctx.record(Wrapped)
      return async () => {
        await ctx.wait(ParserReady)
        ctx.update(parserCtx, (parser) => (text) => {
          const doc = parser(text)
          return doc.type.create(doc.attrs, doc.content)
        })
        ctx.done(Wrapped)
      }
    }
    const withWrappedParser = async (
      markdown: string,
      fn: (editor: Editor) => void
    ) => {
      const editor = Editor.make()
        .config((ctx) => {
          ctx.set(defaultValueCtx, markdown)
          ctx.set(preserveSourceCtx, true)
          ctx.update(editorStateTimerCtx, (timers) => [...timers, Wrapped])
        })
        .use(wrapParser)
        .use(commonmark)
        .use(gfm)
      await editor.create()
      try {
        fn(editor)
      } finally {
        await editor.destroy().catch(() => {})
      }
    }

    it('still has a source for the default value', async () => {
      await withWrappedParser(setext, (editor) => {
        expect(editor.action(getMarkdown())).toBe(setext)
      })
    })

    it.each([false, true])(
      'still has a source after replaceAll (flush: %s)',
      async (flush) => {
        await withWrappedParser('text', (editor) => {
          editor.action(replaceAll(setext, flush))
          expect(editor.action(getMarkdown())).toBe(setext)
        })
      }
    )
  })

  it('has no source for something that is not a string', async () => {
    await withEditor(setext, (editor) => {
      const sourceParser = editor.ctx.get(sourceParserCtx)
      expect(sourceParser(undefined as never).source).toBeNull()

      editor.action(replaceAll(undefined as never))
      expect(editor.action(getMarkdown())).toBe('')
    })
  })

  describe('the source parser', () => {
    it('gives the document of the parser and its source', async () => {
      await withEditor('', (editor) => {
        const { doc, source } = editor.ctx.get(sourceParserCtx)('- a\n- b')

        expect(doc.eq(editor.ctx.get(parserCtx)('- a\n- b'))).toBe(true)
        expect(source).toMatchObject({ source: '- a\n- b', doc })
      })
    })

    it('gives no source when source preservation is off', async () => {
      await withEditor(
        '',
        (editor) => {
          const { doc, source } = editor.ctx.get(sourceParserCtx)('- a\n- b')

          expect(doc.childCount).toBe(1)
          expect(source).toBeNull()
        },
        false
      )
    })
  })

  // Several editors on one page are common. Each one keeps its own
  // sources, and none of them sees what another one loaded.
  describe('more than one editor', () => {
    const other = '|a|b|\n|-|-|\n|1|2|'

    it('keeps the sources of each editor apart', async () => {
      await withEditor(setext, (first) =>
        withEditor(other, (second) => {
          expect(first.action(getMarkdown())).toBe(setext)
          expect(second.action(getMarkdown())).toBe(other)

          type(first, '!')
          expect(first.action(getMarkdown())).not.toBe(setext)
          expect(second.action(getMarkdown())).toBe(other)

          second.action(replaceAll(setext))
          expect(second.action(getMarkdown())).toBe(setext)
          expect(first.action(getMarkdown())).not.toBe(setext)
        })
      )
    })

    it('does not turn the option on for the editor next to it', async () => {
      await withEditor(setext, (on) =>
        withEditor(
          setext,
          (off) => {
            expect(on.action(getMarkdown())).toBe(setext)
            expect(off.action(getMarkdown())).toBe('# Title\n')
            expect(markdownSourceKey.getState(viewOf(off).state)).toBe(
              undefined
            )
          },
          false
        )
      )
    })

    it('finds the source of its own document when another editor parsed the same text', async () => {
      await withEditor(setext, (first) =>
        withEditor('', (second) => {
          // The same text, parsed by the other editor.
          const { source } = first.ctx.get(sourceParserCtx)(other)
          const { doc } = second.ctx.get(sourceParserCtx)(other)

          expect(source?.doc).not.toBe(doc)
          const view = viewOf(second)
          view.updateState(
            EditorState.create({ doc, plugins: view.state.plugins })
          )
          expect(markdownSourceKey.getState(view.state)?.current?.doc).toBe(doc)
          expect(second.action(getMarkdown())).toBe(other)
          expect(first.action(getMarkdown())).toBe(setext)
        })
      )
    })
  })

  it('finds the source of a state that the user created', async () => {
    await withEditor('', (editor) => {
      const view = viewOf(editor)
      const doc = editor.ctx.get(parserCtx)('- a\n- b')
      view.updateState(EditorState.create({ doc, plugins: view.state.plugins }))
      expect(editor.action(getMarkdown())).toBe('- a\n- b')
    })
  })
})
