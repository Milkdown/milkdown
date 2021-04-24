import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { SerializerMark } from '../serializer/types';
import type { IdleContext } from '../editor/context';

import { Atom } from './atom';
import { AtomType, LoadState } from '../constant';
import { MarkViewFactory } from '../utility';

export interface Mark {
    readonly view?: MarkViewFactory;
    keymap?(markType: MarkType): Keymap;
    inputRules?(markType: MarkType, schema: Schema): InputRule[];
}

export abstract class Mark extends Atom<IdleContext> {
    abstract readonly schema: MarkSpec;
    abstract readonly serializer: SerializerMark;
    abstract readonly parser: ParserSpec;

    loadAfter = LoadState.Idle;
    type = AtomType.ProsemirrorSpec;
    main() {
        this.updateContext({
            marks: this.context.marks.concat(this),
        });
    }
}
