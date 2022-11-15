/* Copyright 2021, Milkdown by Mirone. */
import type { Attrs, CmdKey, Ctx } from '@milkdown/core'
import { emotionCtx, themeManagerCtx } from '@milkdown/core'
import { themeMustInstalled } from '@milkdown/exception'

import type {
  AddMetadata,
  CommandConfig,
  CommonOptions,
  Factory,
  GetPlugin,
  ThemeUtils,
  WithExtend,
} from '../types'

export const getClassName
    = (className: CommonOptions['className']) =>
      (attrs: Attrs, ...defaultValue: (string | null | undefined)[]): string => {
        const classList = className?.(attrs, ...defaultValue) ?? defaultValue
        return Array.isArray(classList) ? classList.filter(x => x).join(' ') : classList
      }

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string | string[], args?: T) =>
  [commandKey, defaultKey, args] as CommandConfig<unknown>

export function getThemeUtils<Options extends CommonOptions>(ctx: Ctx, options?: Options): ThemeUtils {
  try {
    const themeManager = ctx.get(themeManagerCtx)
    const emotion = ctx.get(emotionCtx)
    if (!emotion.css)
      throw themeMustInstalled()

    return {
      getClassName: getClassName(options?.className as undefined),
      getStyle: style => (options?.headless ? '' : (style(emotion) as string | undefined)),
      themeManager,
    }
  }
  catch {
    throw themeMustInstalled()
  }
}

/**
 * @deprecated Use `getThemeUtils` instead.
 */
export const getUtils = getThemeUtils

export const addMetadata = <SupportedKeys extends string = string, Options extends {} = {}>(
  x: GetPlugin<SupportedKeys, Options>,
): AddMetadata<SupportedKeys, Options> => {
  const fn: AddMetadata<SupportedKeys, Options> = (options) => {
    const result = x(options) as ReturnType<AddMetadata<SupportedKeys, Options>>
    result.origin = fn
    return result
  }
  return fn
}

export const withExtend
    = <SupportedKeys extends string, Options extends {}, Type, Rest>(
      factory: Factory<SupportedKeys, Options, Type, Rest>,
      creator: (
        factory: Factory<SupportedKeys, Options, Type, Rest>,
      ) => WithExtend<SupportedKeys, Options, Type, Rest>,
    ) =>
        (origin: AddMetadata<SupportedKeys, Options>): WithExtend<SupportedKeys, Options, Type, Rest> => {
        type Ext = WithExtend<SupportedKeys, Options, Type, Rest>
        const next = origin as Ext
        const extend = (extendFactory: Parameters<Ext['extend']>[0]) =>
          creator((...args) => extendFactory(factory(...args), ...args))

        next.extend = extend as Ext['extend']

        return next
        }
