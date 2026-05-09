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
  const newDoc = parser(buffer)
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

/// Characters that could trigger inline markdown parsing into marks
/// or non-text nodes:
/// - `*`, `_`            emphasis / strong
/// - `~`                 strikethrough (GFM)
/// - `` ` ``             inline code
/// - `[`                 links / images (`]` is omitted because any
///                       valid link/image starts with `[`, so checking
///                       the opener is enough)
/// - `\`                 escape
/// - `<`                 autolinks (`<https://...>`, `<a@b.com>`) and raw HTML
/// Used by the fast-path check below.
const INLINE_MARKDOWN_TOKENS = /[*_~`[\\<]/

/// Parse a single markdown line and return its inline content (text
/// nodes with marks, links, etc.) for merging into a textblock. Only
/// uses the parsed result when it actually contains inline *structure*
/// (marks or non-text nodes); for plain-text-only output we fall back
/// to the original string so that:
/// - leading whitespace isn't stripped by CommonMark paragraph rules
///   (e.g. `' Inserted.'` would otherwise become `'Inserted.'`)
/// - block markers don't silently disappear when the line happens to
///   parse as a different block type (e.g. `'# Heading'` parses as a
///   heading, dropping the `# ` if we extracted heading.content)
///
/// Insert-mode flushes happen on every push, so we skip the parser
/// entirely when the text contains no markdown-relevant tokens.
function parseInlineContent(
  ctx: Ctx,
  schema: Node['type']['schema'],
  text: string
): Fragment {
  if (!text) return Fragment.empty
  if (!INLINE_MARKDOWN_TOKENS.test(text)) {
    return Fragment.from(schema.text(text))
  }
  const parser = ctx.get(parserCtx)
  const parsed = parser(text)
  const firstBlock = parsed?.firstChild
  if (!firstBlock?.isTextblock || firstBlock.content.size === 0) {
    return Fragment.from(schema.text(text))
  }
  let hasInlineStructure = false
  firstBlock.content.forEach((child) => {
    if (!child.isText || child.marks.length > 0) {
      hasInlineStructure = true
    }
  })
  if (!hasInlineStructure) {
    return Fragment.from(schema.text(text))
  }
  // CommonMark strips up to 3 leading and any trailing whitespace when
  // wrapping inline content in a paragraph. For mid-paragraph inserts,
  // that loss visibly concatenates words (e.g. ` **bold**` → `**bold**`
  // collides with the previous character). Re-prepend / re-append the
  // original whitespace if the parsed content didn't preserve it.
  let content = firstBlock.content
  const leading = /^\s+/.exec(text)?.[0]
  if (leading) {
    const firstText = content.firstChild?.isText
      ? (content.firstChild.text ?? '')
      : ''
    if (!firstText.startsWith(leading)) {
      content = Fragment.from(schema.text(leading)).append(content)
    }
  }
  const trailing = /\s+$/.exec(text)?.[0]
  if (trailing) {
    const lastText = content.lastChild?.isText
      ? (content.lastChild.text ?? '')
      : ''
    if (!lastText.endsWith(trailing)) {
      content = content.append(Fragment.from(schema.text(trailing)))
    }
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
  const parsed = blockPart.trim() ? parser(blockPart) : null
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
  const docSize = tr.doc.content.size
  const resolvedTo = tr.doc.resolve(Math.min(to, docSize))
  let actualTo = to
  if (
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
  const parsed = parser(buffer)
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
