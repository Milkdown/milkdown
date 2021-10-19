/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { InputRule, Keymap, MarkSpec, MarkType, Schema } from '@milkdown/prose';

import type { MarkParserSpec } from '../parser';
import type { MarkSerializerSpec } from '../serializer';
import type { MarkViewFactory } from '../utility';
import type { CmdTuple, CommandManager } from './commands';
import { marksCtx } from './schema';

export type Mark = {
    readonly id: string;
    readonly view?: MarkViewFactory;
    readonly keymap?: (nodeType: MarkType, schema: Schema, getCommand: CommandManager['get']) => Keymap;
    readonly inputRules?: (nodeType: MarkType, schema: Schema) => InputRule[];
    readonly commands?: (nodeType: MarkType, schema: Schema) => CmdTuple[];
    readonly schema: MarkSpec;
    readonly serializer: MarkSerializerSpec;
    readonly parser: MarkParserSpec;
};

export const markFactory =
    (mark: Mark | ((ctx: Ctx) => Mark)): MilkdownPlugin =>
    () =>
    (ctx) => {
        const atom = typeof mark === 'function' ? mark(ctx) : mark;
        ctx.update(marksCtx, (prev) => prev.concat(atom));
    };
