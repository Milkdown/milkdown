import { createSlice, type Ctx } from '@milkdown/kit/ctx'

import type { CrepeFeature } from '../feature'
import type { CrepeBuilder } from './builder'

/// @internal
/// The feature flags context.
/// ⚠️ Most of the time, you should use `useCrepeFeatures` to get the features.
export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

/// @internal
/// The crepe editor context.
/// ⚠️ Most of the time, you should use `useCrepe` to get the crepe editor instance.
export const CrepeCtx = createSlice({} as CrepeBuilder, 'CrepeCtx')

/// The crepe editor context.
/// You can use this context to access the crepe editor instance within Milkdown plugins.
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
  // We should use string slice here to avoid the slice to be bundled in multiple entries
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
export function useCrepeFeatures(ctx: Ctx) {
  // We should use string slice here to avoid the slice to be bundled in multiple entries
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
