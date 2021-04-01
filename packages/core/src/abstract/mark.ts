import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { Editor } from '../editor';
import type { SerializerMark } from '../serializer/types';
import type { ParserSpec } from '../parser/types';

export abstract class Mark {
    constructor(readonly editor: Editor) {}
    abstract readonly name: string;
    abstract readonly schema: MarkSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerMark;
    abstract inputRules(markType: MarkType, schema: Schema): InputRule[];
}
