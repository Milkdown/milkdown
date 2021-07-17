import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import { marksCtx } from '../context';
import type { Ctx } from '../editor';
import type { MarkParserSpec } from '../parser';
import type { MarkSerializerSpec } from '../serializer';

export type Mark = {
    readonly id: string;
    readonly keymap?: (nodeType: MarkType, schema: Schema) => Keymap;
    readonly inputRules?: (nodeType: MarkType, schema: Schema) => InputRule[];
    readonly schema: MarkSpec;
    readonly serializer: MarkSerializerSpec;
    readonly parser: MarkParserSpec;
};

export const createMark = (mark: Mark) => (ctx: Ctx) => {
    const marks = ctx.use(marksCtx);
    marks.set(marks.get().concat(mark));
};
