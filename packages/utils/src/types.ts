/* Copyright 2021, Milkdown by Mirone. */
import type {
  Attrs,
  CmdKey,
  CmdTuple,
  Ctx,
  Emotion,
  MilkdownPlugin,
  RemarkPlugin,
  Slice,
  ThemeManager,
} from '@milkdown/core'
import type { InputRule } from '@milkdown/prose/inputrules'
import type { Plugin } from '@milkdown/prose/state'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'

export interface ThemeUtils {
  readonly getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string
  readonly getStyle: (style: (emotion: Emotion) => string | void) => string | undefined
  readonly themeManager: ThemeManager
}

/**
 * @deprecated Use `ThemeUtils` instead.
 */
export type Utils = ThemeUtils

export type UnknownRecord = Record<string, unknown>

export type CommandConfig<T = unknown> = [commandKey: CmdKey<T>, defaultKey: string, args?: T]

export type CommonOptions<SupportedKeys extends string = string, Obj = {}> = Obj & {
  className?: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string
  keymap?: Partial<Record<SupportedKeys, string | string[]>>
  headless?: boolean
  view?: (ctx: Ctx) => NodeViewConstructor | MarkViewConstructor
}

export interface Methods<Keys extends string, Type> {
  injectSlices?: AnySlice[]
  remarkPlugins?: (ctx: Ctx) => RemarkPlugin[]
  inputRules?: (types: Type, ctx: Ctx) => InputRule[]
  prosePlugins?: (types: Type, ctx: Ctx) => Plugin[]
  commands?: (types: Type, ctx: Ctx) => CmdTuple[]
  shortcuts?: Record<Keys, CommandConfig>
}

export type GetPlugin<SupportedKeys extends string = string, Options extends {} = {}> = (
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => MilkdownPlugin

export interface Metadata<Origin = unknown> {
  origin: Origin
}
export type AddMetadata<SupportedKeys extends string = string, Options extends {} = {}> = (
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => Metadata<GetPlugin<SupportedKeys, Options>> & MilkdownPlugin

export type Spec<SupportedKeys extends string, Type, Rest> = Methods<SupportedKeys, Type> & Rest
export type Factory<SupportedKeys extends string, Options extends {}, Type, Rest> = (
  utils: ThemeUtils,
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => Spec<SupportedKeys, Type, Rest>
export interface Extendable<SupportedKeys extends string, Options extends {}, Type, Rest> {
  extend: <
        ExtendedSupportedKeys extends string = SupportedKeys,
        ExtendedOptions extends {} = Options,
        ExtendedType extends Type = Type,
        ExtendedRest extends Rest = Rest,
    >(
    extendFactory: (
      ...args: [
                original: Spec<SupportedKeys, Type, Rest>,
                ...rest: Parameters<Factory<ExtendedSupportedKeys, ExtendedOptions, ExtendedType, ExtendedRest>>,
      ]
    ) => Spec<ExtendedSupportedKeys, ExtendedType, ExtendedRest>,
  ) => WithExtend<ExtendedSupportedKeys, ExtendedOptions, Type, Rest>
}
export type WithExtend<SupportedKeys extends string, Options extends {}, Type, Rest> = AddMetadata<
    SupportedKeys,
    Options
> &
Extendable<SupportedKeys, Options, Type, Rest>

export type MaybePromise<T> = T | Promise<T>

export type AnySlice = Slice<any>
