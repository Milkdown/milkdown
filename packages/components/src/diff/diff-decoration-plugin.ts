import type { CommandManager } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import type { DiffState } from '@milkdown/plugin-diff'
import type { Change } from '@milkdown/prose/changeset'
import type { Node } from '@milkdown/prose/model'

import { commandsCtx } from '@milkdown/core'
import {
  acceptDiffChunkCmd,
  acceptDiffRangeCmd,
  diffPluginKey,
  getPendingChanges,
  rejectDiffChunkCmd,
  rejectDiffRangeCmd,
} from '@milkdown/plugin-diff'
import { DOMSerializer } from '@milkdown/prose/model'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'
import { diffComponentConfig } from './config'

const diffDecorationKey = new PluginKey<DecorationSet>(
  'MILKDOWN_DIFF_DECORATION'
)

export const diffDecorationPlugin = $prose((ctx) => {
  const config = ctx.get(diffComponentConfig.key)

  return new Plugin<DecorationSet>({
    key: diffDecorationKey,
    state: {
      init: () => DecorationSet.empty,
      apply(tr, decorations, _oldState, newState) {
        const diffState = diffPluginKey.getState(newState)
        if (!diffState?.active) return DecorationSet.empty

        // Only rebuild when diff state changes (action dispatched or doc changed).
        // Selection-only changes reuse the mapped decoration set.
        if (tr.getMeta(diffPluginKey) || tr.docChanged)
          return buildDecorations(ctx, newState.doc, diffState, config)

        return decorations.map(tr.mapping, tr.doc)
      },
    },
    props: {
      decorations(state) {
        return diffDecorationKey.getState(state) ?? DecorationSet.empty
      },
    },
  })
})

withMeta(diffDecorationPlugin, {
  displayName: 'Prose<diffDecoration>',
  group: 'DiffComponent',
})

/**
 * Check if a position range in a doc crosses a top-level block boundary.
 */
function isBlockSpanning(doc: Node, from: number, to: number): boolean {
  if (from === to) return false

  const $from = doc.resolve(from)
  const $to = doc.resolve(to)

  // If they're in different top-level blocks (depth 1), it spans blocks
  if ($from.depth >= 1 && $to.depth >= 1) {
    return $from.node(1) !== $to.node(1)
  }

  return $from.depth !== $to.depth
}

/**
 * Check if a slice from a doc contains block-level content.
 */
function hasBlockContent(doc: Node, from: number, to: number): boolean {
  if (from >= to) return false

  const slice = doc.slice(from, to)
  let hasBlock = false
  slice.content.forEach((node) => {
    if (node.isBlock) hasBlock = true
  })
  return hasBlock || slice.openStart > 0 || slice.openEnd > 0
}

/**
 * For block-level widgets, find a position that sits between top-level
 * blocks rather than inside a block node. This prevents widgets from
 * being rendered inside headings, paragraphs, etc.
 */
function snapToBlockBoundary(doc: Node, pos: number): number {
  const $pos = doc.resolve(pos)
  // If inside a top-level block (depth >= 1), move to before that block
  // so the widget renders between blocks, not inside one
  if ($pos.depth >= 1) {
    return $pos.before(1)
  }
  return pos
}

/**
 * Iterate complete top-level nodes within a position range.
 * Only nodes that start at or after `from` are included —
 * callers must ensure `from` is aligned to a node boundary
 * (e.g. via getTopLevelBlockRange).
 */
function forEachTopLevelNodeInRange(
  doc: Node,
  from: number,
  to: number,
  callback: (node: Node, start: number, end: number) => void
): void {
  let pos = 0
  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i)
    const nodeEnd = pos + child.nodeSize
    if (pos >= to) break
    if (nodeEnd > from && pos >= from) callback(child, pos, nodeEnd)
    pos = nodeEnd
  }
}

/**
 * Add node-level deletion decorations for each top-level block in a range.
 * Uses Decoration.node so the class is applied to the node's outer DOM wrapper,
 * which works with custom node views (CodeMirror, image-block, etc.)
 * where Decoration.inline cannot penetrate.
 */
function addBlockDeletionDecorations(
  doc: Node,
  from: number,
  to: number,
  classPrefix: string,
  decorations: Decoration[]
): void {
  forEachTopLevelNodeInRange(doc, from, to, (_node, start, end) => {
    decorations.push(
      Decoration.node(start, end, {
        class: `${classPrefix}-removed-block`,
      })
    )
  })
}

/**
 * Find the enclosing top-level block node range for a position.
 * Returns { from, to } covering the entire block at depth 1.
 */
function getTopLevelBlockRange(
  doc: Node,
  pos: number
): { from: number; to: number } | null {
  if (pos < 0 || pos > doc.content.size) return null

  const $pos = doc.resolve(Math.min(pos, doc.content.size))
  if ($pos.depth >= 1) {
    return {
      from: $pos.before(1),
      to: $pos.after(1),
    }
  }
  return null
}

/**
 * Check if a position falls inside or at a custom block node in the given document.
 * Returns the node type name if found, or null.
 */
function getCustomBlockAt(
  doc: Node,
  pos: number,
  customBlockTypes: Set<string>
): string | null {
  if (pos < 0 || pos > doc.content.size) return null

  const $pos = doc.resolve(Math.min(pos, doc.content.size))

  // Check ancestor nodes (for positions inside tables, code blocks, etc.)
  for (let d = $pos.depth; d >= 0; d--) {
    const name = $pos.node(d).type.name
    if (customBlockTypes.has(name)) return name
  }

  // Check node at/after this position (for atom/leaf nodes like image-block)
  const nodeAfter = $pos.nodeAfter
  if (nodeAfter && customBlockTypes.has(nodeAfter.type.name))
    return nodeAfter.type.name

  return null
}

interface MergedChange {
  fromA: number
  toA: number
  fromB: number
  toB: number
  /** Original indices in the pending changes array (for accept/reject) */
  originalIndices: number[]
  /** Whether this change was merged from a custom block node (table, image-block, etc.) */
  isCustomBlock: boolean
}

/**
 * Check if a change touches a custom block node in either document.
 */
function changeTouchesCustomBlock(
  change: Change,
  doc: Node,
  newDoc: Node,
  customBlockTypes: Set<string>
): boolean {
  return (
    getCustomBlockAt(doc, change.fromA, customBlockTypes) != null ||
    getCustomBlockAt(doc, change.toA, customBlockTypes) != null ||
    getCustomBlockAt(newDoc, change.fromB, customBlockTypes) != null ||
    getCustomBlockAt(newDoc, change.toB, customBlockTypes) != null
  )
}

/**
 * Merge changes that fall within custom block nodes (tables, image-blocks,
 * code blocks) into single block-level changes. This ensures proper rendering
 * for nodes that use custom node views where inline decorations don't work.
 */
function mergeBlockChanges(
  pending: readonly Change[],
  doc: Node,
  newDoc: Node,
  customBlockTypes: Set<string>
): MergedChange[] {
  const result: MergedChange[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < pending.length; i++) {
    if (consumed.has(i)) continue

    const change = pending[i]!

    if (!changeTouchesCustomBlock(change, doc, newDoc, customBlockTypes)) {
      result.push({
        fromA: change.fromA,
        toA: change.toA,
        fromB: change.fromB,
        toB: change.toB,
        originalIndices: [i],
        isCustomBlock: false,
      })
      continue
    }

    // Find the block ranges in both docs using all relevant positions
    const blockRangeA =
      getTopLevelBlockRange(doc, change.fromA) ??
      getTopLevelBlockRange(doc, change.toA)
    const blockRangeB =
      getTopLevelBlockRange(newDoc, change.fromB) ??
      getTopLevelBlockRange(newDoc, change.toB)

    // Collect all changes that overlap with this block.
    // Use the union of the block range and the original change range
    // so we don't truncate changes that extend beyond the block.
    const merged: MergedChange = {
      fromA: Math.min(blockRangeA?.from ?? change.fromA, change.fromA),
      toA: Math.max(blockRangeA?.to ?? change.toA, change.toA),
      fromB: Math.min(blockRangeB?.from ?? change.fromB, change.fromB),
      toB: Math.max(blockRangeB?.to ?? change.toB, change.toB),
      originalIndices: [i],
      isCustomBlock: true,
    }
    consumed.add(i)

    for (let j = i + 1; j < pending.length; j++) {
      if (consumed.has(j)) continue

      const other = pending[j]!
      // Check if the other change overlaps with the block range in either doc
      // Use exclusive end boundary to avoid absorbing changes that start right after the block
      const overlapA =
        blockRangeA &&
        ((other.fromA >= blockRangeA.from && other.fromA < blockRangeA.to) ||
          (other.toA > blockRangeA.from && other.toA <= blockRangeA.to))
      const overlapB =
        blockRangeB &&
        ((other.fromB >= blockRangeB.from && other.fromB < blockRangeB.to) ||
          (other.toB > blockRangeB.from && other.toB <= blockRangeB.to))

      if (overlapA || overlapB) {
        consumed.add(j)
        merged.originalIndices.push(j)
        // Expand the merged range to include this change
        merged.fromA = Math.min(merged.fromA, other.fromA)
        merged.toA = Math.max(merged.toA, other.toA)
        merged.fromB = Math.min(merged.fromB, other.fromB)
        merged.toB = Math.max(merged.toB, other.toB)
      }
    }

    result.push(merged)
  }

  return result
}

function buildDecorations(
  ctx: Ctx,
  doc: Node,
  diffState: DiffState,
  config: {
    classPrefix: string
    customBlockTypes: string[]
    acceptLabel: string
    rejectLabel: string
  }
): DecorationSet {
  const decorations: Decoration[] = []
  const commands = ctx.get(commandsCtx)
  const classPrefix = config.classPrefix
  const customBlockTypes = new Set(config.customBlockTypes)
  const pending = getPendingChanges(diffState)
  const mergedChanges = mergeBlockChanges(
    pending,
    doc,
    diffState.newDoc,
    customBlockTypes
  )

  for (let i = 0; i < mergedChanges.length; i++) {
    const change = mergedChanges[i]!
    const isDeletion = change.fromA < change.toA
    const isInsertion = change.fromB < change.toB

    const deletionSpansBlocks =
      isDeletion && isBlockSpanning(doc, change.fromA, change.toA)
    const insertionHasBlocks =
      isInsertion && hasBlockContent(diffState.newDoc, change.fromB, change.toB)
    const isBlockLevel = deletionSpansBlocks || insertionHasBlocks

    // Deletion: mark old content as removed
    if (isDeletion) {
      if (change.isCustomBlock) {
        // For custom block changes (tables, image-blocks, code blocks),
        // use node decorations so custom node views get the styling.
        addBlockDeletionDecorations(
          doc,
          change.fromA,
          change.toA,
          classPrefix,
          decorations
        )
      } else {
        decorations.push(
          Decoration.inline(change.fromA, change.toA, {
            class: `${classPrefix}-removed`,
          })
        )
      }
    }

    // Insertion widget position
    const rawWidgetPos = isDeletion ? change.toA : change.fromA

    // For block-level widgets, snap to between top-level blocks
    // so they don't render inside headings/paragraphs
    const widgetPos = isBlockLevel
      ? snapToBlockBoundary(doc, rawWidgetPos)
      : rawWidgetPos

    // Insertion: show new content as a widget
    if (isInsertion) {
      const widget = createInsertedWidget(
        diffState.newDoc,
        change,
        classPrefix,
        isBlockLevel
      )
      decorations.push(
        Decoration.widget(widgetPos, widget, {
          side: -1,
          key: `added-${i}`,
        })
      )
    }

    const controls = createControlsWidget(
      commands,
      classPrefix,
      isBlockLevel,
      change,
      config.acceptLabel,
      config.rejectLabel
    )
    decorations.push(
      Decoration.widget(widgetPos, controls, {
        side: isBlockLevel ? -1 : 1,
        key: `controls-${i}`,
      })
    )
  }

  return DecorationSet.create(doc, decorations)
}

function createInsertedWidget(
  newDoc: Node,
  change: { fromB: number; toB: number },
  classPrefix: string,
  isBlockLevel: boolean
): HTMLElement {
  const dom = document.createElement(isBlockLevel ? 'div' : 'span')
  dom.className = `${classPrefix}-added`
  if (isBlockLevel) dom.classList.add(`${classPrefix}-added-block`)

  const serializer = DOMSerializer.fromSchema(newDoc.type.schema)

  // When the range aligns with complete top-level block boundaries,
  // serialize each node directly. This ensures complex nodes like tables
  // get their proper HTML structure (<table>/<tbody>/<tr>) instead of
  // bare cell content from slice serialization.
  if (isBlockLevel) {
    const nodes = collectTopLevelNodes(newDoc, change.fromB, change.toB)
    if (nodes.length > 0) {
      const fragment = document.createDocumentFragment()
      for (const node of nodes) {
        fragment.appendChild(serializer.serializeNode(node))
      }
      dom.appendChild(fragment)
      return dom
    }
  }

  // Fallback: use slice serialization
  const slice = newDoc.slice(change.fromB, change.toB)
  const fragment = serializer.serializeFragment(slice.content)
  dom.appendChild(fragment)

  return dom
}

/**
 * Collect complete top-level nodes within a position range.
 * Returns empty array if the range doesn't align with node boundaries.
 */
function collectTopLevelNodes(doc: Node, from: number, to: number): Node[] {
  const nodes: Node[] = []
  forEachTopLevelNodeInRange(doc, from, to, (node) => {
    nodes.push(node)
  })
  return nodes
}

function createControlsWidget(
  commands: CommandManager,
  classPrefix: string,
  isBlockLevel: boolean,
  change: MergedChange,
  acceptLabel: string,
  rejectLabel: string
): HTMLElement {
  const dom = document.createElement(isBlockLevel ? 'div' : 'span')
  dom.className = `${classPrefix}-controls`
  if (isBlockLevel) dom.classList.add(`${classPrefix}-controls-block`)

  const handler = (action: 'accept' | 'reject') => (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (change.isCustomBlock) {
      // For merged custom block changes, use range-based commands
      // so the entire block is accepted/rejected at once.
      const range = {
        fromA: change.fromA,
        toA: change.toA,
        fromB: change.fromB,
        toB: change.toB,
      }
      const key =
        action === 'accept' ? acceptDiffRangeCmd.key : rejectDiffRangeCmd.key
      commands.call(key, range)
    } else {
      // Non-custom-block changes always have exactly one original index
      const key =
        action === 'accept' ? acceptDiffChunkCmd.key : rejectDiffChunkCmd.key
      commands.call(key, change.originalIndices[0])
    }
  }

  const acceptBtn = document.createElement('button')
  acceptBtn.className = `${classPrefix}-accept`
  acceptBtn.textContent = acceptLabel
  acceptBtn.addEventListener('click', handler('accept'))

  const rejectBtn = document.createElement('button')
  rejectBtn.className = `${classPrefix}-reject`
  rejectBtn.textContent = rejectLabel
  rejectBtn.addEventListener('click', handler('reject'))

  dom.appendChild(acceptBtn)
  dom.appendChild(rejectBtn)

  return dom
}
