/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, CmdTuple, Ctx, MarkSchema, NodeSchema } from '@milkdown/core';
import { InputRule, MarkType, NodeType, Plugin } from '@milkdown/prose';

import { UnknownRecord } from '../types';

type TypeMapping<NodeMap extends Record<string, NodeSchema>, MarkMap extends Record<string, MarkSchema>> = {
    [K in keyof NodeMap]: NodeType;
} & {
    [K in keyof MarkMap]: MarkType;
};

type CommandConfig<T = unknown> = {
    commandKey: CmdKey<T>;
    defaultKey: string;
    args?: T;
};

type PluginFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    options: Options,
) => <NodeMap extends Record<string, NodeSchema>, MarkMap extends Record<string, MarkSchema>>(
    ctx: Ctx,
) => {
    node: NodeMap;
    mark: MarkMap;
    inputRules?: (types: TypeMapping<NodeMap, MarkMap>, ctx: Ctx) => InputRule[];
    prosemirrorPlugins?: (types: TypeMapping<NodeMap, MarkMap>, ctx: Ctx) => Plugin[];
    commands: (types: TypeMapping<NodeMap, MarkMap>, ctx: Ctx) => CmdTuple[];
    keymap: (types: TypeMapping<NodeMap, MarkMap>, ctx: Ctx) => Record<SupportedKeys, CommandConfig>;
};

export const createPlugin = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: PluginFactory<SupportedKeys, Options>,
) => {
    return (options: Options) => {
        const plugin = factory(options);

        plugin;
    };
};
