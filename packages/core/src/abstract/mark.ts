import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { SerializerMark } from '../serializer/types';
import { Base } from './base';

export abstract class Mark extends Base<MarkType> {
    abstract readonly schema: MarkSpec;
    abstract readonly serializer: SerializerMark;
}
