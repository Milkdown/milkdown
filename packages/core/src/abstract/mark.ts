import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { SerializerMark } from '../serializer/types';
import type { ParserSpec } from '../parser/types';
import { Base } from './base';

export abstract class Mark extends Base<MarkType> {
    abstract readonly schema: MarkSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerMark;
}
