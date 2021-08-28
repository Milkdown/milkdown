import type {
    Attrs,
    CmdKey,
    Mark,
    MarkViewFactory,
    MilkdownPlugin,
    Node,
    NodeViewFactory,
    ThemeTool,
} from '@milkdown/core';

import type { AnyRecord, UnknownRecord } from '../type-utility';

export type CommandConfig<T = unknown> = {
    commandKey: CmdKey<T>;
    defaultKey: string;
    args?: T;
};

export type Shortcuts<T extends string> = Record<T, CommandConfig>;
export type UserKeymap<T extends string> = Partial<Record<T, string | string[]>>;

export interface AtomOptional<SupportedKeys extends string> {
    readonly shortcuts?: Shortcuts<SupportedKeys>;
    readonly styles?: (attrs: AnyRecord) => string;
}

export type CommonOptions<SupportedKeys extends string = string, Obj = UnknownRecord> = Obj & {
    className?: (attrs: AnyRecord) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
    readonly headless?: boolean;
};

type NodeOptions<SupportedKeys extends string, Obj> = CommonOptions<SupportedKeys, Obj> & {
    readonly view?: NodeViewFactory;
};

type MarkOptions<SupportedKeys extends string, Obj> = CommonOptions<SupportedKeys, Obj> & {
    readonly view?: MarkViewFactory;
};

export type Options<SupportedKeys extends string, Obj extends UnknownRecord, Type> = Partial<
    Type extends Mark
        ? MarkOptions<SupportedKeys, Obj>
        : Type extends Node
        ? NodeOptions<SupportedKeys, Obj>
        : CommonOptions<SupportedKeys, Obj>
>;

export type Factory<SupportedKeys extends string, Obj extends UnknownRecord, Type = unknown> = (
    options: Options<SupportedKeys, Obj, Type> | undefined,
    utils: Utils,
) => Type & AtomOptional<SupportedKeys>;

export type Utils = {
    getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string;
    getStyle: (style: (themeTool: ThemeTool) => string | void) => string | undefined;
};

export type Origin<S extends string = string, Obj extends UnknownRecord = UnknownRecord, Type = unknown> = (
    options?: Options<S, Obj, Type>,
) => PluginWithMetadata<S, Obj, Type>;

export type PluginWithMetadata<
    SupportedKeys extends string = string,
    Obj extends UnknownRecord = UnknownRecord,
    Type = unknown,
> = MilkdownPlugin & { origin: Origin<SupportedKeys, Obj, Type> };
