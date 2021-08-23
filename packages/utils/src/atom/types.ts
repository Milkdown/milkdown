import type {
    Mark,
    Node,
    NodeViewFactory,
    MarkViewFactory,
    Attrs,
    MilkdownPlugin,
    CmdKey,
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

export type CommonOptions<SupportedKeys extends string> = {
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

export type Options<Type extends Mark | Node, S extends string, T extends UnknownRecord> = Partial<
    Type extends Mark ? MarkOptions<S, T> : NodeOptions<S, T>
>;
export type Factory<SupportedKeys extends string, T extends UnknownRecord, Type extends Mark | Node> = (
    options: Options<Type, SupportedKeys, T> | undefined,
    utils: Utils,
) => Type & AtomOptional<SupportedKeys>;

export type Utils = {
    getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string;
    getStyle: (style: (themeTool: ThemeTool) => string | void) => string | undefined;
};

export type Origin<
    Type extends Node | Mark,
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
> = (
    options?: Partial<T & (Type extends Node ? NodeOptions<SupportedKeys, T> : MarkOptions<SupportedKeys, T>)>,
) => PluginWithMetadata<Type, SupportedKeys, T>;

export type PluginWithMetadata<
    Type extends Node | Mark,
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
> = MilkdownPlugin & { origin: Origin<Type, SupportedKeys, T> };
