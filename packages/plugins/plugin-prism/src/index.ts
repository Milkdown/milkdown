import type { MilkdownPlugin } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { Refractor } from 'refractor/core'

import { findChildren } from '@milkdown/prose'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'
import { refractor } from 'refractor'

import { getBlockDecorations, getDecorations } from './get-decorations'

/// @internal
export interface Options {
  configureRefractor: (refractor: Refractor) => void | Refractor
}

/// Config for prism.
/// You can configure refractor here.
export const prismConfig = $ctx<Options, 'prismConfig'>(
  {
    configureRefractor: () => {},
  },
  'prismConfig'
)

prismConfig.meta = {
  package: '@milkdown/plugin-prism',
  displayName: 'Ctx<prism>',
}

// The textblock of `next` holding every difference between the two docs, or
// `null` when the change is not confined to one. A structural change puts a
// difference at a block boundary, where the resolved parent is the containing
// node rather than a textblock, so it returns `null` and the caller recomputes.
function changedTextblock(prev: Node, next: Node) {
  const from = prev.content.findDiffStart(next.content)
  if (from == null) return null

  const diff = prev.content.findDiffEnd(next.content)
  if (!diff) return null

  // Repeated content ("aa" -> "aaa") lets the end scan overrun the start.
  const to = Math.max(diff.b, from)

  const $from = next.resolve(from)
  const $to = next.resolve(to)
  if (!$from.sameParent($to) || !$from.parent.isTextblock) return null

  return { node: $from.parent, pos: $from.before($from.depth) }
}

/// The prism prosemirror plugin.
export const prismPlugin = $prose((ctx) => {
  const { configureRefractor } = ctx.get(prismConfig.key)
  const name = 'code_block'
  // `apply` needs the instance `init` used, not the imported one.
  const instance = configureRefractor(refractor) ?? refractor
  return new Plugin({
    key: new PluginKey('MILKDOWN_PRISM'),
    state: {
      init: (_, { doc }) => getDecorations(doc, name, instance),
      apply: (transaction, decorationSet, oldState, state) => {
        if (!transaction.docChanged) return decorationSet

        const edited = changedTextblock(oldState.doc, state.doc)
        if (edited) {
          const mapped = decorationSet.map(transaction.mapping, transaction.doc)
          // A change inside one non-code textblock cannot affect a code block.
          if (edited.node.type.name !== name) return mapped

          const from = edited.pos
          const to = from + edited.node.nodeSize
          // `find` takes inclusive bounds, and this block's own decorations sit
          // strictly inside it, so search the content to spare the neighbors.
          return mapped
            .remove(mapped.find(from + 1, to - 1))
            .add(
              transaction.doc,
              getBlockDecorations(edited.node, from, instance)
            )
        }

        const isNodeName = state.selection.$head.parent.type.name === name
        const isPreviousNodeName =
          oldState.selection.$head.parent.type.name === name

        // Lazy: each `findChildren` allocates an entry for every node.
        const codeBlockChanged =
          isNodeName ||
          isPreviousNodeName ||
          (() => {
            const oldNode = findChildren((node) => node.type.name === name)(
              oldState.doc
            )
            const newNode = findChildren((node) => node.type.name === name)(
              state.doc
            )
            return (
              oldNode.length !== newNode.length ||
              // A language change goes through `setNodeAttribute`. Its
              // `AttrStep` carries no `from` or `to` and maps to an
              // empty step map, so the step scan below misses it. This
              // comparison walks every block by index. Otherwise a
              // change to any block after the first leaves its
              // highlighting stale.
              oldNode.some(
                (entry, i) =>
                  entry.node.attrs.language !== newNode[i]?.node.attrs.language
              ) ||
              transaction.steps.some((step) => {
                const s = step as unknown as { from: number; to: number }
                return (
                  s.from !== undefined &&
                  s.to !== undefined &&
                  oldNode.some((node) => {
                    return (
                      node.pos >= s.from &&
                      node.pos + node.node.nodeSize <= s.to
                    )
                  })
                )
              })
            )
          })()

        if (codeBlockChanged)
          return getDecorations(transaction.doc, name, instance)

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },
    props: {
      decorations(this: Plugin, state) {
        return this.getState(state)
      },
    },
  })
})

prismPlugin.meta = {
  package: '@milkdown/plugin-prism',
  displayName: 'Prose<prism>',
}

/// All plugins exported by this package.
export const prism: MilkdownPlugin[] = [prismPlugin, prismConfig]
