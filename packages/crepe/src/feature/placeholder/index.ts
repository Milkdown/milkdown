import type { Node } from '@milkdown/kit/prose/model'
import type { EditorState } from '@milkdown/kit/prose/state'

import { findParent } from '@milkdown/kit/prose'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { Decoration, DecorationSet } from '@milkdown/kit/prose/view'
import { $ctx, $prose } from '@milkdown/kit/utils'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig, useCrepe } from '../../core/slice'
import { isInCodeBlock, isInList } from '../../utils'
import { CrepeFeature } from '../index'

function isDocEmpty(doc: Node) {
  return doc.childCount <= 1 && !doc.firstChild?.content.size
}

function createPlaceholderDecoration(
  state: EditorState,
  placeholderText: string
): Decoration | null {
  const { selection } = state
  if (!selection.empty) return null

  const $pos = selection.$anchor
  const node = $pos.parent
  if (node.content.size > 0) return null

  const inTable = findParent((node) => node.type.name === 'table')($pos)
  if (inTable) return null

  const before = $pos.before()

  return Decoration.node(before, before + node.nodeSize, {
    class: 'crepe-placeholder',
    'data-placeholder': placeholderText,
  })
}

interface PlaceholderConfig {
  text: string
  mode: 'doc' | 'block'
}

export type PlaceholderFeatureConfig = Partial<PlaceholderConfig>

export const placeholderConfig = $ctx(
  {
    text: 'Please enter...',
    mode: 'block',
  } as PlaceholderConfig,
  'placeholderConfigCtx'
)

export const placeholderPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('CREPE_PLACEHOLDER'),
    props: {
      decorations: (state) => {
        const crepe = useCrepe(ctx)
        if (crepe.readonly) return null

        const config = ctx.get(placeholderConfig.key)
        if (config.mode === 'doc' && !isDocEmpty(state.doc)) return null

        if (isInCodeBlock(state.selection) || isInList(state.selection))
          return null

        const placeholderText = config.text ?? 'Please enter...'
        const deco = createPlaceholderDecoration(state, placeholderText)
        if (!deco) return null

        return DecorationSet.create(state.doc, [deco])
      },
    },
  })
})

export const placeholder: DefineFeature<PlaceholderFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Placeholder))
    .config((ctx) => {
      if (config) {
        ctx.update(placeholderConfig.key, (prev) => {
          return {
            ...prev,
            ...config,
          }
        })
      }
    })
    .use(placeholderPlugin)
    .use(placeholderConfig)
}
