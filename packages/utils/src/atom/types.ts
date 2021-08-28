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

export interface AtomOptional<T extends string> {
    readonly shortcuts?: Shortcuts<T>;
    readonly styles?: (attrs: AnyRecord) => string;
}

export type CommonOptions<SupportedKeys extends string = string> = {
    className?: (attrs: AnyRecord) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
    readonly headless?: boolean;
};

export type NodeOptions<SupportedKeys extends string, T> = T &
    CommonOptions<SupportedKeys> & {
        readonly view?: NodeViewFactory;
    };

export type MarkOptions<SupportedKeys extends string, T> = T &
    CommonOptions<SupportedKeys> & {
        readonly view?: MarkViewFactory;
    };

export type Options<S extends string, T extends UnknownRecord, Type extends Mark | Node> = Partial<
    Type extends Mark ? MarkOptions<S, T> : NodeOptions<S, T>
>;
export type Factory<SupportedKeys extends string, T extends UnknownRecord, Type extends Mark | Node> = (
    options: Options<SupportedKeys, T, Type> | undefined,
    utils: Utils,
) => Type & AtomOptional<SupportedKeys>;

export type Utils = {
    getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string;
    getStyle: (style: (themeTool: ThemeTool) => string | void) => string | undefined;
};

export type Origin<
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
    Type extends Node | Mark = never,
> = (
    options?: Partial<T & (Type extends Node ? NodeOptions<SupportedKeys, T> : MarkOptions<SupportedKeys, T>)>,
) => PluginWithMetadata<SupportedKeys, T, Type>;

export type PluginWithMetadata<
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
    Type extends Node | Mark = never,
> = MilkdownPlugin & { origin: Origin<SupportedKeys, T, Type> };
