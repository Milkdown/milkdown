import type { Ctx, MilkdownPlugin, TimerType } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type {
  MarkdownSource,
  SerializedSegments,
  Serializer,
} from '@milkdown/transformer'

import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import { preserveSource, SerializerState } from '@milkdown/transformer'

import type { MarkdownSourceState } from './markdown-source'

import { withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
import { parserCtx } from './parser'
import { SchemaReady, schemaCtx } from './schema'

/// The timer which will be resolved when the serializer plugin is ready.
export const SerializerReady = createTimer('SerializerReady')

/// A slice that holds the timers to wait for before the plugin
/// runs. It defaults to `[SchemaReady]`.
export const serializerTimerCtx = createSlice(
  [] as TimerType[],
  'serializerTimer'
)

const outOfScope = (() => {
  throw ctxCallOutOfScope()
}) as Serializer

/// A slice which contains the serializer.
export const serializerCtx = createSlice<Serializer, 'serializer'>(
  outOfScope,
  'serializer'
)

/// The serializer of a whole document. It takes the document and the
/// markdown sources of the editor state that the document belongs to.
/// Without sources it writes what the serializer in `serializerCtx` writes.
export type DocumentSerializer = (
  doc: Node,
  sources?: MarkdownSourceState | null
) => string

/// A slice which contains the document serializer. `getMarkdown` and the
/// `markdownUpdated` listener use it to serialize the whole document.
///
/// When the document still has the content of one of its markdown sources,
/// the document serializer gives the text of that source back, byte for
/// byte. When the document was edited, it serializes the blocks that
/// changed and keeps the text that every other block had in the source.
/// It only keeps a text that still reads the same in its new place, and
/// it writes the whole document with the serializer in `serializerCtx`
/// when that slice was replaced.
///
/// ```typescript
/// const { state } = ctx.get(editorViewCtx)
/// const serialize = ctx.get(documentSerializerCtx)
/// const markdown = serialize(state.doc, markdownSourceKey.getState(state))
/// ```
export const documentSerializerCtx = createSlice<
  DocumentSerializer,
  'documentSerializer'
>(outOfScope, 'documentSerializer')

type Segmenter = (doc: Node) => SerializedSegments | null

/// What the serializer writes for the document of a source.
interface Normalized {
  serializer: Serializer
  markdown: string
  segments: SerializedSegments | null
}

// How many texts two lists have in common, counting a text as often as
// it is in both.
function overlap(a: readonly string[], b: readonly string[]) {
  const counts = new Map<string, number>()
  a.forEach((text) => counts.set(text, (counts.get(text) ?? 0) + 1))

  let common = 0
  b.forEach((text) => {
    const count = counts.get(text)
    if (!count) return
    counts.set(text, count - 1)
    common++
  })
  return common
}

function createDocumentSerializer(
  ctx: Ctx,
  defaultSerializer: Serializer,
  split: Segmenter
): DocumentSerializer {
  // Telling the blocks apart leans on how remark writes a root. If that
  // ever fails, write the document the plain way instead of failing, and
  // say so once.
  let warned = false
  const segmenter: Segmenter = (doc) => {
    try {
      return split(doc)
    } catch (error) {
      if (!warned)
        console.warn(
          '[milkdown] Cannot tell the blocks of the document apart. ' +
            'The whole document is serialized instead.',
          error
        )
      warned = true
      return null
    }
  }

  // A document that serializes to the same text as the document of a
  // source has the content of the source. Comparing the documents would
  // not work: plugins change a document right after it loads, for example
  // to give each heading an id.
  const normalized = new WeakMap<MarkdownSource, Normalized>()
  const normalize = (serializer: Serializer, source: MarkdownSource) => {
    const cached = normalized.get(source)
    if (cached?.serializer === serializer) return cached

    const segments =
      serializer === defaultSerializer ? segmenter(source.doc) : null
    const markdown = segments?.full ?? serializer(source.doc)
    const result: Normalized = { serializer, markdown, segments }
    normalized.set(source, result)
    return result
  }

  // The last result for a document. `getMarkdown` and the listener often
  // ask for the same document.
  const results = new WeakMap<
    Node,
    { markdown: string; sources: MarkdownSourceState; output: string }
  >()

  // Keep the text of the blocks that did not change. See `preserveSource`.
  const preserve = (
    source: MarkdownSource,
    base: SerializedSegments,
    current: SerializedSegments,
    serializer: Serializer
  ) => {
    const { nodes } = base
    if (!nodes || !source.blocks) return null

    // The serializer tells which node of the source document each text
    // was written for, and the parser tells where that node is in the
    // markdown. A node that wrote nothing has no text, for example an
    // empty paragraph at the end.
    const places = new Map<Node, number>()
    source.doc.forEach((node, _offset, index) => places.set(node, index))
    const blocks = nodes.map((node) => source.blocks?.[places.get(node) ?? -1])
    if (!blocks.every((block) => block != null)) return null

    const indexes = new Map(nodes.map((node, index) => [node, index]))
    const currentNodes = current.nodes

    const parser = ctx.get(parserCtx)
    return preserveSource({
      source: source.source,
      blocks,
      detached: source.detached,
      tail: Math.max(
        source.blocks.at(-1)?.to ?? 0,
        source.detached.at(-1)?.to ?? 0
      ),
      keys: base.keys,
      current,
      sameBlock: currentNodes
        ? (index) => indexes.get(currentNodes[index]!)
        : undefined,
      verify: (markdown, reused) => {
        try {
          const parsed = parser(markdown)
          // Each reused text must give the node it gave in the source.
          // The serialized blocks are not checked: they are what the
          // serializer writes anyway.
          if (parsed.childCount === reused.length)
            return reused.every(
              (index, at) => index == null || parsed.child(at).eq(nodes[index]!)
            )

          // A serialized block did not parse into one node. Compare what
          // both texts are after one more load and save.
          return serializer(parsed) === serializer(parser(current.full))
        } catch {
          return false
        }
      },
    })
  }

  return (doc, sources) => {
    // Read the slice on every call, so a serializer that a plugin replaced
    // or wrapped is the one that runs.
    const serializer = ctx.get(serializerCtx)
    if (!sources) return serializer(doc)

    const candidates = [sources.current, sources.previous].filter(
      (source): source is MarkdownSource => source != null
    )
    const untouched = candidates.find((source) => source.doc === doc)
    if (untouched) return untouched.source

    // Only the default serializer can tell the blocks apart.
    const current = serializer === defaultSerializer ? segmenter(doc) : null
    const markdown = current?.full ?? serializer(doc)
    const same = candidates.filter(
      (source) => normalize(serializer, source).markdown === markdown
    )
    if (same.length) return closest(doc, same).source
    if (!current) return markdown

    const last = results.get(doc)
    if (
      last?.markdown === markdown &&
      last.sources.current === sources.current &&
      last.sources.previous === sources.previous
    )
      return last.output

    // Start with the source that has more of the document. After an undo
    // of `replaceAll` that is the previous one, even when the current one
    // happens to share a block with the document.
    const ranked = candidates
      .map((source) => {
        const base = normalize(serializer, source).segments
        return {
          source,
          base,
          common: base ? overlap(base.keys, current.keys) : 0,
        }
      })
      .sort((a, b) => b.common - a.common)

    let output = markdown
    for (const { source, base, common } of ranked) {
      if (!base || common === 0) continue

      const preserved = preserve(source, base, current, serializer)
      if (preserved != null) {
        output = preserved
        break
      }
    }
    results.set(doc, { markdown, sources, output })
    return output
  }
}

// Two sources can have the same content in another form, for example
// after `replaceAll` with a reformatted text. Take the one that the
// document has more nodes of: a block that was never touched is still the
// node that the parser made. After an undo of `replaceAll` that is the
// previous source.
function closest(doc: Node, sources: MarkdownSource[]): MarkdownSource {
  const shared = (source: MarkdownSource) => {
    const nodes = new Set<Node>()
    source.doc.forEach((node) => nodes.add(node))
    let count = 0
    doc.forEach((node) => {
      if (nodes.has(node)) count++
    })
    return count
  }

  let best = sources[0]!
  if (sources.length === 1) return best

  let most = shared(best)
  for (const source of sources.slice(1)) {
    const count = shared(source)
    if (count > most) {
      best = source
      most = count
    }
  }
  return best
}

/// The serializer plugin.
/// This plugin will create a serializer.
///
/// This plugin waits for the schema plugin.
export const serializer: MilkdownPlugin = (ctx) => {
  ctx
    .inject(serializerCtx, outOfScope)
    .inject(documentSerializerCtx, outOfScope)
    .inject(serializerTimerCtx, [SchemaReady])
    .record(SerializerReady)

  return async () => {
    await ctx.waitTimers(serializerTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    const defaultSerializer = SerializerState.create(schema, remark)
    ctx.set(serializerCtx, defaultSerializer)
    ctx.set(
      documentSerializerCtx,
      createDocumentSerializer(
        ctx,
        defaultSerializer,
        SerializerState.createSegmenter(schema, remark)
      )
    )
    ctx.done(SerializerReady)

    return () => {
      ctx
        .remove(serializerCtx)
        .remove(documentSerializerCtx)
        .remove(serializerTimerCtx)
        .clearTimer(SerializerReady)
    }
  }
}

withMeta(serializer, {
  displayName: 'Serializer',
})
