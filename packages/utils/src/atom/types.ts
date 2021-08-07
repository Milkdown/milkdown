import type { NodeViewFactory, MarkViewFactory, Attrs, MilkdownPlugin, CmdKey } from '@milkdown/core';
import type { AnyRecord, UnknownRecord } from '../type-utility';

export type CommandConfig<T = unknown> = {
    commandKey: CmdKey<T>;
    defaultKey: string;
    args?: T;
};

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string, args?: T) =>
    ({
        commandKey,
        defaultKey,
        args,
    } as CommandConfig<unknown>);

export type Shortcuts<T extends string> = Record<T, CommandConfig>;
export type UserKeymap<T extends string> = Partial<Record<T, string | string[]>>;

export interface NodeOptional<T extends string> {
    readonly shortcuts?: Shortcuts<T>;
}

export interface MarkOptional<T extends string> {
    readonly shortcuts?: Shortcuts<T>;
}

export type CommonOptions<SupportedKeys extends string> = {
    className?: (attrs: AnyRecord) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
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
    getClassName: (attrs: Attrs, defaultValue: string) => string;
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
