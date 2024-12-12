import type { Ctx } from '@milkdown-nota/kit/ctx'
import { createSlice } from '@milkdown-nota/kit/ctx'
import type { CrepeFeature } from '../feature'

export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

export function configureFeatures(features: CrepeFeature[]) {
  return (ctx: Ctx) => {
    ctx.inject(FeaturesCtx, features)
  }
}
