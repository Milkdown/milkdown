import type { NodeViewFactory, MarkViewFactory, Attrs, MilkdownPlugin, CmdKey } from '@milkdown/core';
import type { AnyRecord, UnknownRecord } from '../type-utility';

export type CommandConfig<T = unknown> = {
    commandKey: CmdKey<T>;
    defaultKey: string;
    args?: T;
};

export type Shortcuts<T extends string> = Record<T, CommandConfig>;
export type UserKeymap<T extends string> = Partial<Record<T, string | string[]>>;

export interface NodeOptional<T extends string> {
    readonly shortcuts?: Shortcuts<T>;
    readonly styles?: (attrs: AnyRecord) => string;
}

export interface MarkOptional<T extends string> {
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

export type Utils = {
    getClassName: (attrs: Attrs, ...defaultValue: (string | null)[]) => string;
};

export type Origin<
    Type extends 'Node' | 'Mark',
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
> = (
    options?: Partial<T & (Type extends 'Node' ? NodeOptions<SupportedKeys, T> : MarkOptions<SupportedKeys, T>)>,
) => PluginWithMetadata<Type, SupportedKeys, T>;

export type PluginWithMetadata<
    Type extends 'Node' | 'Mark',
    SupportedKeys extends string = string,
    T extends UnknownRecord = UnknownRecord,
> = MilkdownPlugin & { origin: Origin<Type, SupportedKeys, T> };
