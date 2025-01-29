import type { Ctx } from '@milkdown/kit/ctx'
import { createSlice } from '@milkdown/kit/ctx'
import type { CrepeFeature } from '../feature'
import type { Crepe } from './crepe'

export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

export const crepeCtx = createSlice({} as Crepe, 'CrepeCtx')

export function configureFeatures(features: CrepeFeature[]) {
  return (ctx: Ctx) => {
    ctx.inject(FeaturesCtx, features)
  }
}
