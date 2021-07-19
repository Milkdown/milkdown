import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import { marksCtx } from '.';
import type { MarkParserSpec } from '../parser';
import type { MarkSerializerSpec } from '../serializer';
import type { MarkViewFactory, MilkdownPlugin } from '../utility';

export type Mark = {
    readonly id: string;
    readonly view?: MarkViewFactory;
    readonly keymap?: (nodeType: MarkType, schema: Schema) => Keymap;
    readonly inputRules?: (nodeType: MarkType, schema: Schema) => InputRule[];
    readonly schema: MarkSpec;
    readonly serializer: MarkSerializerSpec;
    readonly parser: MarkParserSpec;
};

export const markFactory =
    (mark: Mark): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(marksCtx, (prev) => prev.concat(mark));
    };
