import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import type { MarkParserSpec } from '../parser';
import type { MarkSerializerSpec } from '../serializer';

import { Atom } from './atom';
import { LoadState } from '../constant';
import { AnyRecord, MarkViewFactory } from '../utility';

interface MarkOptional {
    readonly view?: MarkViewFactory;
    readonly keymap?: (markType: MarkType) => Keymap;
    readonly inputRules?: (markType: MarkType, schema: Schema) => InputRule[];
}

export abstract class Mark<Options = AnyRecord> extends Atom<LoadState.Idle, Options> implements MarkOptional {
    view?: MarkOptional['view'];
    keymap?: MarkOptional['keymap'];
    inputRules?: MarkOptional['inputRules'];

    abstract readonly schema: MarkSpec;
    abstract readonly serializer: MarkSerializerSpec;
    abstract readonly parser: MarkParserSpec;

    override readonly loadAfter = LoadState.Idle;
    override main() {
        this.updateContext({
            marks: this.context.marks.concat(this),
        });
    }
}
