import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType, Mark as ProsemirrorMark, Schema } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import type { ParserSpec } from '../parser/types';
import type { SerializerMark } from '../serializer/types';
import type { Editor } from '../editor';
import type { IdleContext } from '../editor/context';

import { Atom } from './atom';
import { AtomType, LoadState } from '../constant';

export type MarkViewFn = (
    editor: Editor,
    markType: MarkType,
    mark: ProsemirrorMark,
    view: EditorView,
    getPos: boolean,
    declarations: Decoration[],
) => NodeView;

export interface Mark {
    readonly view?: MarkViewFn;
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
