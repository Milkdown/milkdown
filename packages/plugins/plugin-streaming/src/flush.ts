import type { Ctx } from '@milkdown/ctx'
import type { Node, ResolvedPos } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { parserCtx } from '@milkdown/core'
import { computeDocDiff } from '@milkdown/plugin-diff'
import { Fragment, Slice } from '@milkdown/prose/model'

import type { InsertStrategy, StreamingState } from './types'

import { streamingConfig } from './streaming-config'

// ---------------------------------------------------------------------------
// Replace-mode flush (full-doc diff)
// ---------------------------------------------------------------------------

/// Parse a markdown buffer and apply the diff against the current doc.
/// Returns the updated transaction and the parsed doc (if successful).
export function flushBuffer(
  ctx: Ctx,
  tr: Transaction,
  buffer: string
): { tr: Transaction; newDoc: Node | null } {
  const parser = ctx.get(parserCtx)
  const newDoc = tryParse(parser, buffer)
  if (!newDoc) return { tr, newDoc: null }

  const config = ctx.get(streamingConfig.key)
  const ignoreAttrs = config.ignoreAttrs
  const changes = computeDocDiff(
    tr.doc,
    newDoc,
    ignoreAttrs ? { ignoreAttrs } : undefined
  )
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i]!
    const newContent = newDoc.slice(change.fromB, change.toB)
    tr = tr.replace(change.fromA, change.toA, newContent)
  }

  return { tr, newDoc }
}

// ---------------------------------------------------------------------------
// Insert-mode strategy resolver
// ---------------------------------------------------------------------------

/// Default strategy resolver. Determines how streamed content is inserted
/// based on the cursor position. Can be overridden via `streamingConfig`.
///
/// - Code blocks → plain text, preserving newlines
/// - Table cells → plain text, collapsing newlines
/// - Other textblocks (paragraph, heading, list item, blockquote) → split-block
/// - Between blocks (depth 0) → full block parse
export function defaultInsertStrategy(resolved: ResolvedPos): InsertStrategy {
  if (resolved.parent.type.spec.code) {
    return { type: 'plain-text', preserveNewlines: true }
  }

  for (let d = resolved.depth; d > 0; d--) {
    if (resolved.node(d).type.name === 'table') {
      return { type: 'plain-text', preserveNewlines: false }
    }
  }

  if (resolved.depth >= 1) {
    return { type: 'split-block' }
  }

  return { type: 'block' }
}

// ---------------------------------------------------------------------------
// Insert-mode flush
// ---------------------------------------------------------------------------

/// Strip trailing empty paragraph from parser output content.
function stripTrailingEmptyParagraph(content: Fragment): Fragment {
  if (content.childCount === 0) return content
  const last = content.lastChild!
  if (last.type.name === 'paragraph' && last.content.size === 0) {
    return content.cut(0, content.size - last.nodeSize)
  }
  return content
}

/// Options for `flushBufferInsert`.
export interface FlushInsertOptions {
  buffer: string
  insertPos: number
  currentEndPos: number
}

type InsertResult = { tr: Transaction; applied: boolean; insertEndPos: number }

/// Parse a markdown buffer and insert it at a specific position.
/// Uses the configured `insertStrategy` resolver to determine how content
/// is inserted based on the cursor position.
export function flushBufferInsert(
  ctx: Ctx,
  tr: Transaction,
  options: FlushInsertOptions
): InsertResult {
  const { insertPos, currentEndPos } = options
  // Normalize CRLF/CR to LF to avoid stray \r in inserted content
  const buffer = options.buffer.replace(/\r\n?/g, '\n')
  if (!buffer) return { tr, applied: false, insertEndPos: currentEndPos }

  // Clamp positions to valid document range
  const docSize = tr.doc.content.size
  const clampedPos = Math.max(0, Math.min(insertPos, docSize))
  const clampedEnd = Math.max(clampedPos, Math.min(currentEndPos, docSize))

  const resolved = tr.doc.resolve(clampedPos)
  const config = ctx.get(streamingConfig.key)
  const resolveStrategy = config.insertStrategy ?? defaultInsertStrategy
  const strategy = resolveStrategy(resolved)

  const args: ApplyArgs = {
    ctx,
    tr,
    buffer,
    from: clampedPos,
    to: clampedEnd,
    resolved,
  }

  switch (strategy.type) {
    case 'plain-text':
      return applyPlainText(args, strategy.preserveNewlines ?? false)
    case 'split-block':
      return applySplitBlock(args)
    case 'block':
      return applyBlock(args)
  }
}

// ---------------------------------------------------------------------------
// Strategy implementations
// ---------------------------------------------------------------------------

/// Shared arguments for strategy apply functions.
interface ApplyArgs {
  ctx: Ctx
  tr: Transaction
  buffer: string
  from: number
  to: number
  resolved: ResolvedPos
}

/// Insert buffer as plain text.
function applyPlainText(
  { tr, buffer, from, to }: ApplyArgs,
  preserveNewlines: boolean
): InsertResult {
  const textContent = preserveNewlines ? buffer : buffer.replace(/\n/g, ' ')
  const textNode = tr.doc.type.schema.text(textContent)
  tr = tr.replaceWith(from, to, textNode)
  return { tr, applied: true, insertEndPos: from + textContent.length }
}

/// Patterns that could trigger inline markdown parsing into marks,
/// non-text nodes, or text that differs from the raw source:
/// - `*`, `_`            emphasis / strong
/// - `~`                 strikethrough (GFM)
/// - `` ` ``             inline code
/// - `[`                 links / images (`]` is omitted because any
///                       valid link/image starts with `[`, so checking
///                       the opener is enough)
/// - `\`                 escape
/// - `<`                 autolinks (`<https://...>`, `<a@b.com>`) and raw HTML
/// - `https://`, `www.`, `x@x`
///                       GFM autolink literals (`https://a.com`,
///                       `www.a.com`, `a@b.com`) have no bracket or angle
///                       bracket, so they need their own triggers
/// - `&` + entity start  character references (`&amp;`, `&#35;`)
///
/// The set has to cover syntax added by remark plugins too, not just
/// CommonMark/GFM: a pattern that is missing here makes the fast path
/// return the raw string, so the construct is silently streamed in as
/// literal text and never reaches the parser. Plugin syntax whose trigger
/// characters are too common in plain prose to test unconditionally
/// (inline math, emoji shortcodes) is only consulted when the schema
/// actually has the corresponding node — see `hasInlineMarkdownSyntax`.
const INLINE_MARKDOWN_TOKENS =
  /[*_~`[\\<]|https?:\/\/|www\.|[\w.+-]@\w|&[a-zA-Z#]/

/// `remark-math` inline span, for schemas with a `math_inline` node
/// (`@milkdown/crepe`'s latex feature). Deliberately stricter than
/// `remark-math` itself, which pairs a `$` with the next `$` on the line
/// even across prose like `$5 and $10`: here the opener must not be
/// followed by whitespace, and the closer must not be preceded by
/// whitespace nor followed by a digit. Streamed text about prices
/// (`$5 ($6 with tax)`), env vars (`$PATH and $HOME`) or shell arguments
/// (`$1 $2`) keeps the fast path instead of collapsing into a math atom
/// mid-stream, while `$a^2 + b^2 = c^2$` reaches the parser.
const INLINE_MATH_SPAN = /\$(?!\s)(?:[^$\n]*[^\s$])?\$(?!\d)/

/// `:shortcode:` for schemas with an `emoji` node
/// (`@milkdown/plugin-emoji`).
const EMOJI_SHORTCODE = /:[\w+-]+:/

/// Fast-path gate: decide whether a line may contain inline markdown
/// syntax and needs the full parser. Base tokens are always checked;
/// schema-gated patterns only run when the corresponding node exists in
/// the schema, so editors without the feature never pay for the parse —
/// and never have prose reinterpreted by a syntax they don't render.
function hasInlineMarkdownSyntax(
  schema: Node['type']['schema'],
  text: string
): boolean {
  if (INLINE_MARKDOWN_TOKENS.test(text)) return true
  if (schema.nodes.math_inline && INLINE_MATH_SPAN.test(text)) return true
  if (schema.nodes.emoji && EMOJI_SHORTCODE.test(text)) return true
  return false
}

/// `parser` throws when a remark plugin emits an mdast node that no
/// schema runner matches (e.g. `remark-math` registered without a math
/// node schema). A streamed buffer must never let that throw escape the
/// flush loop: the streaming state would stay active and its
/// `filterTransaction` would keep rejecting user edits, so parse
/// failures degrade to `null` and the callers fall back to raw text.
function tryParse(
  parser: (text: string) => Node | null | undefined,
  text: string
): Node | null {
  try {
    return parser(text) ?? null
  } catch {
    return null
  }
}

/// Parse a single markdown line and return its inline content (text
/// nodes with marks, links, etc.) for merging into a textblock. Falls
/// back to the original string when:
/// - the text contains no markdown-relevant syntax (fast path —
///   insert-mode flushes reparse the current line on every throttled
///   flush, so plain prose shouldn't pay for a full parse)
/// - the line parses as a non-paragraph block: a heading (`# **bold**`),
///   code block, etc. is also a textblock but extracting its content
///   would silently drop the block marker (`# `, indent, ...) from the
///   streamed text
/// - the parser fails (see `tryParse`)
///
/// When the line does parse as a paragraph, the parsed content is used
/// as-is — including text-only results, so entity references (`&amp;`)
/// and escapes (`\*`) render with their final semantics instead of
/// flipping between raw and decoded depending on what else is on the
/// line.
function parseInlineContent(
  ctx: Ctx,
  schema: Node['type']['schema'],
  text: string
): Fragment {
  if (!text) return Fragment.empty
  if (!hasInlineMarkdownSyntax(schema, text)) {
    return Fragment.from(schema.text(text))
  }
  const parser = ctx.get(parserCtx)
  const parsed = tryParse(parser, text)
  const firstBlock = parsed?.firstChild
  if (firstBlock?.type.name !== 'paragraph' || firstBlock.content.size === 0) {
    return Fragment.from(schema.text(text))
  }
  // CommonMark strips leading indentation and trailing spaces/tabs from
  // a paragraph line, and the parsed inline content never keeps them.
  // For mid-paragraph inserts that loss visibly concatenates words
  // (` **bold**` after `foo` renders as `foo**bold**`), so re-attach
  // exactly what CommonMark strips: ASCII spaces and tabs at the edges.
  // Only those — non-ASCII whitespace (e.g. U+3000) survives the parse
  // and must not be duplicated. Lines indented far enough to become an
  // indented code block never reach this point (non-paragraph fallback
  // above), so the stripped edges are unconditionally safe to restore.
  let content = firstBlock.content
  const leading = /^[ \t]+/.exec(text)?.[0]
  if (leading) {
    content = Fragment.from(schema.text(leading)).append(content)
  }
  const trailing = /[ \t]+$/.exec(text)?.[0]
  if (trailing) {
    content = content.append(Fragment.from(schema.text(trailing)))
  }
  return content
}

/// Split buffer at first newline: first line merges as inline markdown
/// (preserving bold/italic/links/etc.) into the current block, remaining
/// lines are parsed as markdown blocks inserted after the enclosing
/// top-level ancestor via a Slice with openStart = depth.
function applySplitBlock({
  ctx,
  tr,
  buffer,
  from,
  to,
  resolved,
}: ApplyArgs): InsertResult {
  const schema = tr.doc.type.schema
  const firstNewline = buffer.indexOf('\n')

  // Single line — parse as inline markdown so marks/links survive.
  if (firstNewline < 0) {
    const inlineContent = parseInlineContent(ctx, schema, buffer)
    tr = tr.replaceWith(from, to, inlineContent)
    return { tr, applied: true, insertEndPos: from + inlineContent.size }
  }

  const inlinePart = buffer.substring(0, firstNewline)
  const blockPart = buffer.substring(firstNewline + 1)

  // Try to parse the block part as markdown
  const parser = ctx.get(parserCtx)
  const parsed = blockPart.trim() ? tryParse(parser, blockPart) : null
  const blockContent = parsed
    ? stripTrailingEmptyParagraph(parsed.content)
    : Fragment.empty

  // If block part didn't parse to anything, fall back to inline-only.
  if (blockContent.childCount === 0) {
    const inlineContent = parseInlineContent(
      ctx,
      schema,
      buffer.replace(/\n/g, ' ')
    )
    tr = tr.replaceWith(from, to, inlineContent)
    return { tr, applied: true, insertEndPos: from + inlineContent.size }
  }

  // Build a Slice that bridges from the current nesting depth to top level.
  // Wrap the inline content in matching parent nodes so ProseMirror can
  // merge it with the existing structure via openStart.
  const depth = resolved.depth
  let innerContent: Fragment = parseInlineContent(ctx, schema, inlinePart)

  for (let d = depth; d > 0; d--) {
    innerContent = Fragment.from(resolved.node(d).copy(innerContent))
  }

  const fullContent = innerContent.append(blockContent)
  const slice = new Slice(fullContent, depth, 0)

  // If `to` lands exactly at the end of the enclosing parent's inline
  // content, extend it past the parent's close so the slice's
  // `openEnd: 0` matches the right-boundary depth. Without this,
  // ProseMirror has to reconcile a depth mismatch (right boundary at
  // depth N vs slice ending at depth 0) which, for multi-block
  // replacements covering the whole inline content, silently drops the
  // next sibling block.
  // `depth > 0` guard: the default strategy resolver only returns
  // `split-block` for depth >= 1, but a custom `streamingConfig.insertStrategy`
  // could request `split-block` at depth 0, where `resolvedTo.after(0)`
  // would throw.
  const docSize = tr.doc.content.size
  const resolvedTo = tr.doc.resolve(Math.min(to, docSize))
  let actualTo = to
  if (
    depth > 0 &&
    resolvedTo.depth === depth &&
    resolvedTo.parentOffset === resolvedTo.parent.content.size
  ) {
    actualTo = resolvedTo.after(depth)
  }

  tr = tr.replace(from, actualTo, slice)

  // Subtract depth because the open nodes merge into existing structure
  const insertedSize = fullContent.size - depth
  return { tr, applied: true, insertEndPos: from + insertedSize }
}

/// Parse entire buffer as markdown and insert as top-level blocks.
function applyBlock({ ctx, tr, buffer, from, to }: ApplyArgs): InsertResult {
  const parser = ctx.get(parserCtx)
  const parsed = tryParse(parser, buffer)
  if (!parsed) return { tr, applied: false, insertEndPos: to }

  const content = stripTrailingEmptyParagraph(parsed.content)
  if (content.size === 0) return { tr, applied: false, insertEndPos: to }

  tr = tr.replace(from, to, new Slice(content, 0, 0))
  return { tr, applied: true, insertEndPos: from + content.size }
}

// ---------------------------------------------------------------------------
// Unified flush entry point
// ---------------------------------------------------------------------------

/// Result of `performFlush`.
export interface FlushResult {
  tr: Transaction
  newDoc: Node | null
  /// Updated insert end position (only set in insert mode).
  insertEndPos?: number
}

/// Perform a flush for both insert and replace modes.
/// Used by the flush controller (throttled loop) and endStreamingCmd (final flush).
export function performFlush(
  ctx: Ctx,
  tr: Transaction,
  streamingState: StreamingState
): FlushResult {
  if (streamingState.insertPos != null) {
    const insertPos = streamingState.insertPos
    const result = flushBufferInsert(ctx, tr, {
      buffer: streamingState.buffer,
      insertPos,
      currentEndPos: streamingState.insertEndPos ?? insertPos,
    })
    return {
      tr: result.tr,
      newDoc: result.applied ? result.tr.doc : null,
      insertEndPos: result.insertEndPos,
    }
  }
  return flushBuffer(ctx, tr, streamingState.buffer)
}
