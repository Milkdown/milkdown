import { createSlice, type Ctx } from '@milkdown/kit/ctx'

import type { CrepeFeature } from '../feature'
import type { CrepeBuilder } from './builder'

/// @internal
/// The feature flags context.
/// ⚠️ In most cases, call `useCrepeFeatures` to get the features.
export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

/// @internal
/// The crepe editor context.
/// ⚠️ In most cases, call `useCrepe` to get the crepe editor instance.
export const CrepeCtx = createSlice({} as CrepeBuilder, 'CrepeCtx')

/// The crepe editor context.
/// Use this context to access the crepe editor instance inside a
/// Milkdown plugin.
/// ```ts
/// import { crepeCtx } from '@milkdown/crepe'
/// const plugin = (ctx: Ctx) => {
///   return () => {
///     const crepe = useCrepe(ctx)
///     crepe.setReadonly(true)
///   }
/// }
/// ```
export function useCrepe(ctx: Ctx) {
  // The string form keeps the slice out of more than one bundle entry.
  return ctx.get<CrepeBuilder, 'CrepeCtx'>('CrepeCtx')
}

/// Check the enabled FeatureFlags
/// ```ts
/// import { useCrepeFeatures } from '@milkdown/crepe'
/// const plugin = (ctx: Ctx) => {
///   const features = useCrepeFeatures(ctx)
///   if (features.get().includes(CrepeFeature.CodeMirror)) {
///     // Do something with CodeMirror
///   }
/// }
/// ```
export function useCrepeFeatures(ctx: Ctx) {
  // The string form keeps the slice out of more than one bundle entry.
  return ctx.use<CrepeFeature[], 'FeaturesCtx'>('FeaturesCtx')
}

/// @internal
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
