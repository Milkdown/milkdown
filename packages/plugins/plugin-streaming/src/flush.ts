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

  const changes = computeDocDiff(tr.doc, newDoc)
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
  const { buffer, insertPos, currentEndPos } = options
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

/// Split buffer at first newline: first line merges as text into the current
/// block, remaining lines are parsed as markdown blocks inserted after the
/// enclosing top-level ancestor via a Slice with openStart = depth.
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

  // Single line — just insert as plain text
  if (firstNewline < 0) {
    const textNode = schema.text(buffer)
    tr = tr.replaceWith(from, to, textNode)
    return { tr, applied: true, insertEndPos: from + buffer.length }
  }

  const inlinePart = buffer.substring(0, firstNewline)
  const blockPart = buffer.substring(firstNewline + 1)

  // Try to parse the block part as markdown
  const parser = ctx.get(parserCtx)
  const parsed = blockPart.trim() ? parser(blockPart) : null
  const blockContent = parsed
    ? stripTrailingEmptyParagraph(parsed.content)
    : Fragment.empty

  // If block part didn't parse to anything, fall back to plain text
  if (blockContent.childCount === 0) {
    const textContent = buffer.replace(/\n/g, ' ')
    const textNode = schema.text(textContent)
    tr = tr.replaceWith(from, to, textNode)
    return { tr, applied: true, insertEndPos: from + textContent.length }
  }

  // Build a Slice that bridges from the current nesting depth to top level.
  // Wrap the inline text in matching parent nodes so ProseMirror can merge it
  // with the existing structure via openStart.
  const depth = resolved.depth
  let innerContent: Fragment = inlinePart
    ? Fragment.from(schema.text(inlinePart))
    : Fragment.empty

  for (let d = depth; d > 0; d--) {
    innerContent = Fragment.from(resolved.node(d).copy(innerContent))
  }

  const fullContent = innerContent.append(blockContent)
  const slice = new Slice(fullContent, depth, 0)
  tr = tr.replace(from, to, slice)

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
