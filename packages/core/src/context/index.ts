import type { InputRule } from 'prosemirror-inputrules';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { EditorView, NodeView } from 'prosemirror-view';
import type { RemarkOptions } from 'remark';
import re from 'remark';
import type { Processor } from 'unified';
import type { Editor } from '../editor';
import type { Mark, Node } from '../internal-plugin';
import type { MarkViewParams, NodeViewParams } from '../utility';
import { createCtx } from './container';

export * from './container';

export const remarkCtx = createCtx<Processor<RemarkOptions>>(re());
export const nodesCtx = createCtx<Node[]>([]);
export const marksCtx = createCtx<Mark[]>([]);
export const editorCtx = createCtx<Editor>({} as Editor);
export const prosePluginsCtx = createCtx<ProsemirrorPlugin[]>([]);
export const schemaCtx = createCtx<Schema>({} as Schema);
export const parserCtx = createCtx<(text: string) => ProsemirrorNode | null>(() => null);
export const serializerCtx = createCtx<(node: ProsemirrorNode) => string>(() => '');
export const keymapCtx = createCtx<ProsemirrorPlugin[]>([]);
export const inputRulesCtx = createCtx<InputRule[]>([]);
export const nodeViewsCtx = createCtx<Record<string, (...args: NodeViewParams | MarkViewParams) => NodeView>>({});
export const editorViewCtx = createCtx<EditorView>({} as EditorView);

export const contexts = [
    remarkCtx,
    nodesCtx,
    marksCtx,
    editorCtx,
    prosePluginsCtx,
    schemaCtx,
    parserCtx,
    serializerCtx,
    keymapCtx,
    inputRulesCtx,
    nodeViewsCtx,
    editorViewCtx,
];
