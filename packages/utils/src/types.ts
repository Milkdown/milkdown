/* Copyright 2021, Milkdown by Mirone. */
import type { Attrs, CmdKey, ThemeTool } from '@milkdown/core';
import { CmdTuple, Ctx, RemarkPlugin } from '@milkdown/core';
import { InputRule, Plugin } from '@milkdown/prose';

export type Utils = {
    readonly getClassName: (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => string;
    readonly getStyle: (style: (themeTool: ThemeTool) => string | void) => string | undefined;
    readonly themeTool: ThemeTool;
};

export type UnknownRecord = Record<string, unknown>;

export type CommandConfig<T = unknown> = [commandKey: CmdKey<T>, defaultKey: string, args?: T];

export type CommonOptions<SupportedKeys extends string = string, Obj = UnknownRecord> = Obj & {
    className?: (attrs: Attrs) => string;
    keymap?: Partial<Record<SupportedKeys, string | string[]>>;
    readonly headless?: boolean;
};

export type Methods<Keys extends string, Type> = {
    remarkPlugins?: (ctx: Ctx) => RemarkPlugin[];
    inputRules?: (types: Type, ctx: Ctx) => InputRule[];
    prosePlugins?: (types: Type, ctx: Ctx) => Plugin[];
    commands?: (types: Type, ctx: Ctx) => CmdTuple[];
    shortcuts?: Record<Keys, CommandConfig>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;
export type Metadata<T = unknown> = {
    origin: T;
};
export type AddMetadata<T extends AnyFn = AnyFn> = (...args: Parameters<T>) => Metadata<T> & ReturnType<T>;
