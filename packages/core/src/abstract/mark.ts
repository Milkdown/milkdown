import type { MarkSpec, MarkType, Mark as ProsemirrorMark } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import type { Editor } from '../editor';
import type { SerializerMark } from '../serializer/types';
import { Base } from './base';

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
}

export abstract class Mark extends Base<MarkType> {
    abstract readonly schema: MarkSpec;
    abstract readonly serializer: SerializerMark;
}
