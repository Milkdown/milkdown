import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { SerializerMark } from '../serializer/types';
import type { ParserSpec } from '../parser/types';
import { Base } from './base';

export abstract class Mark extends Base {
    abstract readonly name: string;
    abstract readonly schema: MarkSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerMark;
    abstract inputRules(markType: MarkType, schema: Schema): InputRule[];
}
