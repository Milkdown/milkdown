import type { CommandManager } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import type { DiffState } from '@milkdown/plugin-diff'
import type { Node } from '@milkdown/prose/model'

import { commandsCtx } from '@milkdown/core'
import {
  acceptDiffRangeCmd,
  diffPluginKey,
  getPendingChanges,
  rejectDiffRangeCmd,
} from '@milkdown/plugin-diff'
import { DOMSerializer } from '@milkdown/prose/model'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'

import type { ChangeSegment, MergedChange } from './merge-changes'

import { withMeta } from '../__internal__/meta'
import {
  DIFF_CLASS_PREFIX as CLASS_PREFIX,
  diffComponentConfig,
} from './config'
import {
  addBlockDeletionDecorations,
  collectTopLevelNodes,
  coversOnlyTrailingEmptyParagraphs,
  hasBlockContent,
  isBlockSpanning,
  snapToBlockBoundary,
} from './doc-utils'
import {
  anchorTrailingInsertsBeforeEmptyParagraph,
  mergeBlockChanges,
  splitCrossBoundaryChange,
} from './merge-changes'

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

// ---------------------------------------------------------------------------
// Decoration builders
// ---------------------------------------------------------------------------

interface CrossBoundaryOptions {
  doc: Node
  newDoc: Node
  segments: ChangeSegment[]
  change: MergedChange
  changeIndex: number
  commands: CommandManager
  acceptLabel: string
  rejectLabel: string
  decorations: Decoration[]
}

/// Render a cross-boundary change as separate inline + block decorations.
function addCrossBoundaryDecorations({
  doc,
  newDoc,
  segments,
  change,
  changeIndex,
  commands,
  acceptLabel,
  rejectLabel,
  decorations,
}: CrossBoundaryOptions): void {
  for (let j = 0; j < segments.length; j++) {
    const seg = segments[j]!
    const segDeletion = seg.fromA < seg.toA
    const segInsertion = seg.fromB < seg.toB

    if (segDeletion) {
      if (seg.isBlock) {
        addBlockDeletionDecorations(doc, seg.fromA, seg.toA, decorations)
      } else {
        decorations.push(
          Decoration.inline(seg.fromA, seg.toA, {
            class: `${CLASS_PREFIX}-removed`,
          })
        )
      }
    }

    if (segInsertion) {
      const widgetPos = seg.isBlock
        ? snapToBlockBoundary(doc, segDeletion ? seg.toA : seg.fromA)
        : segDeletion
          ? seg.toA
          : seg.fromA
      const widget = createInsertedWidget(newDoc, seg, seg.isBlock)
      decorations.push(
        Decoration.widget(widgetPos, widget, {
          side: -1,
          key: `added-${changeIndex}-${j}`,
        })
      )
    }
  }

  // One set of controls for the full change, at block boundary
  const lastSeg = segments[segments.length - 1]!
  const lastSegEnd = lastSeg.isBlock
    ? lastSeg.fromA < lastSeg.toA
      ? lastSeg.toA
      : lastSeg.fromA
    : change.toA
  const controlsPos = snapToBlockBoundary(doc, lastSegEnd)
  const controls = createControlsWidget({
    commands,
    isBlockLevel: true,
    change,
    acceptLabel,
    rejectLabel,
  })
  decorations.push(
    Decoration.widget(controlsPos, controls, {
      side: -1,
      key: `controls-${changeIndex}`,
    })
  )
}

function buildDecorations(
  ctx: Ctx,
  doc: Node,
  diffState: DiffState,
  config: {
    customBlockTypes: string[]
    acceptLabel: string
    rejectLabel: string
  }
): DecorationSet {
  const decorations: Decoration[] = []
  const commands = ctx.get(commandsCtx)
  const customBlockTypes = new Set(config.customBlockTypes)
  const pending = getPendingChanges(diffState)
  const mergedChanges = mergeBlockChanges(
    pending,
    doc,
    diffState.newDoc,
    customBlockTypes
  )
  anchorTrailingInsertsBeforeEmptyParagraph(mergedChanges, doc)

  for (let i = 0; i < mergedChanges.length; i++) {
    const change = mergedChanges[i]!
    const isDeletion = change.fromA < change.toA
    const isInsertion = change.fromB < change.toB

    // Skip deletion-only changes that are just trailing empty paragraphs.
    // Editors like Crepe always keep an empty paragraph at the end.
    if (
      isDeletion &&
      !isInsertion &&
      coversOnlyTrailingEmptyParagraphs(doc, change.fromA, change.toA)
    )
      continue

    const deletionSpansBlocks =
      isDeletion && isBlockSpanning(doc, change.fromA, change.toA)
    const deletionHasBlocks =
      isDeletion && hasBlockContent(doc, change.fromA, change.toA)
    const insertionHasBlocks =
      isInsertion && hasBlockContent(diffState.newDoc, change.fromB, change.toB)

    // Changes entirely within a single top-level block in the old doc
    // (e.g. list item text edits, blockquote text changes) should render
    // as inline — the old-doc slice may contain sub-block nodes but the
    // edit itself is inline-level.
    // Only apply when neither side contains block content, otherwise
    // we'd render block nodes inside a <span> (invalid DOM).
    const deletionWithinSingleBlock =
      isDeletion &&
      !deletionSpansBlocks &&
      !deletionHasBlocks &&
      !change.isCustomBlock &&
      !insertionHasBlocks
    const isBlockLevel =
      (deletionSpansBlocks || deletionHasBlocks || insertionHasBlocks) &&
      !deletionWithinSingleBlock

    // Try to split cross-boundary changes into inline + block segments
    // so both the inline text change and block additions are visible.
    if (isBlockLevel && !change.isCustomBlock) {
      const segments = splitCrossBoundaryChange(doc, diffState.newDoc, change)
      if (segments) {
        addCrossBoundaryDecorations({
          doc,
          newDoc: diffState.newDoc,
          segments,
          change,
          changeIndex: i,
          commands,
          acceptLabel: config.acceptLabel,
          rejectLabel: config.rejectLabel,
          decorations,
        })
        continue
      }
    }

    // Non-split path: render as a single change
    if (isDeletion) {
      if (change.isCustomBlock || isBlockLevel) {
        addBlockDeletionDecorations(doc, change.fromA, change.toA, decorations)
      } else {
        decorations.push(
          Decoration.inline(change.fromA, change.toA, {
            class: `${CLASS_PREFIX}-removed`,
          })
        )
      }
    }

    const rawWidgetPos = isDeletion ? change.toA : change.fromA
    const widgetPos = isBlockLevel
      ? snapToBlockBoundary(doc, rawWidgetPos)
      : rawWidgetPos

    if (isInsertion) {
      const widget = createInsertedWidget(
        diffState.newDoc,
        change,
        isBlockLevel
      )
      decorations.push(
        Decoration.widget(widgetPos, widget, { side: -1, key: `added-${i}` })
      )
    }

    const controls = createControlsWidget({
      commands,
      isBlockLevel,
      change,
      acceptLabel: config.acceptLabel,
      rejectLabel: config.rejectLabel,
    })
    decorations.push(
      Decoration.widget(widgetPos, controls, {
        side: isBlockLevel ? -1 : 1,
        key: `controls-${i}`,
      })
    )
  }

  return DecorationSet.create(doc, decorations)
}

// ---------------------------------------------------------------------------
// Widget creators
// ---------------------------------------------------------------------------

function createInsertedWidget(
  newDoc: Node,
  change: { fromB: number; toB: number },
  isBlockLevel: boolean
): HTMLElement {
  const dom = document.createElement(isBlockLevel ? 'div' : 'span')
  dom.className = `${CLASS_PREFIX}-added`
  dom.contentEditable = 'false'
  if (isBlockLevel) dom.classList.add(`${CLASS_PREFIX}-added-block`)

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

  // If serialization produced no visible content (but not images/media),
  // fall back to plain text
  if (
    !dom.textContent?.trim() &&
    !dom.querySelector('img, video, audio, canvas, svg')
  ) {
    const fallback = newDoc.textBetween(change.fromB, change.toB, '\n', '\n')
    if (fallback.trim()) {
      dom.textContent = fallback
    }
  }

  return dom
}

interface ControlsWidgetOptions {
  commands: CommandManager
  isBlockLevel: boolean
  change: MergedChange
  acceptLabel: string
  rejectLabel: string
}

function createControlsWidget({
  commands,
  isBlockLevel,
  change,
  acceptLabel,
  rejectLabel,
}: ControlsWidgetOptions): HTMLElement {
  const dom = document.createElement(isBlockLevel ? 'div' : 'span')
  dom.className = `${CLASS_PREFIX}-controls`
  dom.contentEditable = 'false'
  if (isBlockLevel) dom.classList.add(`${CLASS_PREFIX}-controls-block`)

  const handler = (action: 'accept' | 'reject') => (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    // Always use range-based commands — works for both custom blocks
    // and split cross-boundary changes.
    const range = {
      fromA: change.fromA,
      toA: change.toA,
      fromB: change.fromB,
      toB: change.toB,
    }
    const key =
      action === 'accept' ? acceptDiffRangeCmd.key : rejectDiffRangeCmd.key
    commands.call(key, range)
  }

  const acceptBtn = document.createElement('button')
  acceptBtn.className = `${CLASS_PREFIX}-accept`
  acceptBtn.textContent = acceptLabel
  acceptBtn.addEventListener('click', handler('accept'))

  const rejectBtn = document.createElement('button')
  rejectBtn.className = `${CLASS_PREFIX}-reject`
  rejectBtn.textContent = rejectLabel
  rejectBtn.addEventListener('click', handler('reject'))

  dom.appendChild(acceptBtn)
  dom.appendChild(rejectBtn)

  return dom
}
