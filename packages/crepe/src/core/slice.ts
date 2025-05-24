import type { Ctx } from '@milkdown/kit/ctx'

import { createSlice } from '@milkdown/kit/ctx'

import type { CrepeFeature } from '../feature'
import type { Crepe } from './crepe'

export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

/// The crepe editor context.
/// You can use this context to access the crepe editor instance within Milkdown plugins.
/// ```ts
/// import { crepeCtx } from '@milkdown/crepe'
/// const plugin = (ctx: Ctx) => {
///   return () => {
///     const crepe = ctx.get(crepeCtx)
///     crepe.setReadonly(true)
///   }
/// }
/// ```
export const crepeCtx = createSlice({} as Crepe, 'CrepeCtx')

export function configureFeatures(features: CrepeFeature[]) {
  return (ctx: Ctx) => {
    ctx.inject(FeaturesCtx, features)
  }
}
