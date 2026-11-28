import type { Ctx, MilkdownPlugin, TimerType } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { MarkdownSource, Serializer } from '@milkdown/transformer'

import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import { SerializerState } from '@milkdown/transformer'

import type { MarkdownSourceState } from './markdown-source'

import { withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
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
/// byte. For any other document it calls the serializer in `serializerCtx`.
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

function createDocumentSerializer(ctx: Ctx): DocumentSerializer {
  // What the serializer writes for the document of a source. A document
  // that serializes to the same text has the content of the source.
  // Comparing the documents would not work: plugins change a document
  // right after it loads, for example to give each heading an id.
  const normalized = new WeakMap<
    MarkdownSource,
    { serializer: Serializer; markdown: string }
  >()
  const normalize = (serializer: Serializer, source: MarkdownSource) => {
    const cached = normalized.get(source)
    if (cached?.serializer === serializer) return cached.markdown

    const markdown = serializer(source.doc)
    normalized.set(source, { serializer, markdown })
    return markdown
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

    const markdown = serializer(doc)
    const same = candidates.filter(
      (source) => normalize(serializer, source) === markdown
    )
    return same.length ? closest(doc, same).source : markdown
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

    ctx.set(serializerCtx, SerializerState.create(schema, remark))
    ctx.set(documentSerializerCtx, createDocumentSerializer(ctx))
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
