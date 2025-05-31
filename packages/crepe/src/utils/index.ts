import type { Ctx } from '@milkdown/kit/ctx'
import type { Selection } from '@milkdown/kit/prose/state'

import type { CrepeFeature } from '../feature'

export function isInCodeBlock(selection: Selection) {
  const type = selection.$from.parent.type
  return type.name === 'code_block'
}

export function isInList(selection: Selection) {
  const type = selection.$from.node(selection.$from.depth - 1)?.type
  return type?.name === 'list_item'
}

export function useCrepeFeatures(ctx: Ctx) {
  return ctx.use<CrepeFeature[], 'FeaturesCtx'>('FeaturesCtx')
}

export function crepeFeatureConfig(feature: CrepeFeature) {
  return (ctx: Ctx) => {
    useCrepeFeatures(ctx).update((features) => {
      if (features.includes(feature)) {
        return features
      }
      return [...features, feature]
    })
  }
}
