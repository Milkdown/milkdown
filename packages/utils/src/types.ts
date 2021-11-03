/* Copyright 2021, Milkdown by Mirone. */
import type { Attrs, CmdKey, ThemeTool } from '@milkdown/core';
import { CmdTuple, Ctx, RemarkPlugin } from '@milkdown/core';
import { InputRule, Plugin } from '@milkdown/prose';

export type Utils = {
    readonly getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string;
    readonly getStyle: (style: (themeTool: ThemeTool) => string | void) => string | undefined;
};

export type UnknownRecord = Record<string, unknown>;

export type CommandConfig<T = unknown> = [commandKey: CmdKey<T>, defaultKey: string, args?: T];

export type CommonOptions<SupportedKeys extends string = string, Obj = UnknownRecord> = Obj & {
    className?: (attrs: Attrs) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
    readonly headless?: boolean;
};

export type Methods<Keys extends string, Type> = {
    inputRules?: (types: Type, ctx: Ctx) => InputRule[];
    prosePlugins?: (types: Type, ctx: Ctx) => Plugin[];
    remarkPlugins?: (types: Type, ctx: Ctx) => RemarkPlugin[];
    commands?: (types: Type, ctx: Ctx) => CmdTuple[];
    keymap?: (types: Type, ctx: Ctx) => Record<Keys, CommandConfig>;
};
