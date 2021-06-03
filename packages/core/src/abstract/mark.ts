import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { SerializerMark } from '../serializer/types';

import { Atom } from './atom';
import { LoadState } from '../constant';
import { MarkViewFactory } from '../utility';

interface MarkOptional {
    readonly view?: MarkViewFactory;
    keymap?(markType: MarkType): Keymap;
    inputRules?(markType: MarkType, schema: Schema): InputRule[];
}

export abstract class Mark extends Atom<LoadState.Idle> implements MarkOptional {
    view: MarkOptional['view'];
    keymap: MarkOptional['keymap'];
    inputRules: MarkOptional['inputRules'];

    abstract readonly schema: MarkSpec;
    abstract readonly serializer: SerializerMark;
    abstract readonly parser: ParserSpec;

    override readonly loadAfter = LoadState.Idle;
    override main() {
        this.updateContext({
            marks: this.context.marks.concat(this),
        });
    }
}
