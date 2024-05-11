import type { Meta } from '../inspector'
import type { Ctx } from './ctx'

/// @internal
export type Cleanup = () => void | Promise<void>

/// @internal
export type RunnerReturnType = void | Promise<void> | Cleanup | Promise<Cleanup>

/// @internal
export type CtxRunner = () => RunnerReturnType

/// The type of the plugin.
///
/// ```typescript
/// // A full plugin example
/// const plugin1 = (ctx: Ctx) => {
///   // setup
///   return async () => {
///     // run
///     return async () => {
///       // cleanup
///     }
///   }
/// }
///
/// // A plugin doesn't need to return a cleanup function
/// const plugin2 = (ctx: Ctx) => {
///   // setup
///   return async () => {
///     // run
///   }
/// }
///
/// // A plugin doesn't need to be async
/// const plugin3 = (ctx: Ctx) => {
///   // setup
///   return () => {
///     // run
///   }
/// }
/// ```
export type MilkdownPlugin = { meta?: Meta } & ((ctx: Ctx) => CtxRunner)
