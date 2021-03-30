import { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import { InputRule } from 'prosemirror-inputrules';
import { SerializerMark } from '../serializer/types';
import { ParserSpec } from '../parser/types';

export abstract class Mark {
    abstract readonly name: string;
    abstract readonly schema: MarkSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerMark;
    abstract inputRules(type: MarkType, schema: Schema): InputRule[];
}
