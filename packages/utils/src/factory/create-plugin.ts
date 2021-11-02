/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, CmdTuple, Ctx, MarkSchema, MilkdownPlugin, NodeSchema } from '@milkdown/core';
import { InputRule, MarkType, NodeType, Plugin } from '@milkdown/prose';

import { UnknownRecord } from '../types';

type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeType;
} & {
    [K in MarkKeys]: MarkType;
};

type CommandConfig<T = unknown> = {
    commandKey: CmdKey<T>;
    defaultKey: string;
    args?: T;
};

type PluginFactory<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
> = (options: Options) => {
    schema: (ctx: Ctx) => {
        node: Record<NodeKeys, NodeSchema>;
        mark: Record<MarkKeys, MarkSchema>;
    };
    inputRules?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => InputRule[];
    prosemirrorPlugins?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => Plugin[];
    commands?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => CmdTuple[];
    keymap?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => Record<SupportedKeys, CommandConfig>;
};

export const createPlugin = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: PluginFactory<SupportedKeys, Options>,
) => {
    return (options: Options): MilkdownPlugin => {
        const plugin = factory(options);

        return () => async (ctx) => {
            ctx;
            plugin;
        };
    };
};
