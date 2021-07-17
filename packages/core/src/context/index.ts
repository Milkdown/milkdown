import type { InputRule } from 'prosemirror-inputrules';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { EditorView, NodeView } from 'prosemirror-view';
import type { RemarkOptions } from 'remark';
import re from 'remark';
import type { Processor } from 'unified';
import type { Editor } from '../editor';
import type { Node } from '../internal-plugin';
import type { MarkViewParams, NodeViewParams } from '../utility';
import { createCtx } from './container';

export * from './container';

export const remark = createCtx<Processor<RemarkOptions>>(re());
export const nodes = createCtx<Node[]>([]);
export const marks = createCtx<any[]>([]);
export const editor = createCtx<Editor>({} as Editor);
export const prosePlugins = createCtx<ProsemirrorPlugin[]>([]);
export const schema = createCtx<Schema>({} as Schema);
export const parser = createCtx<(text: string) => ProsemirrorNode | null>(() => null);
export const serializer = createCtx<(node: ProsemirrorNode) => string>(() => '');
export const keymap = createCtx<ProsemirrorPlugin[]>([]);
export const inputRules = createCtx<InputRule[]>([]);
export const nodeViews = createCtx<Record<string, (...args: NodeViewParams | MarkViewParams) => NodeView>>({});
export const editorView = createCtx<EditorView>({} as EditorView);

export const contexts = [
    remark,
    nodes,
    marks,
    editor,
    prosePlugins,
    schema,
    parser,
    serializer,
    keymap,
    inputRules,
    nodeViews,
    editorView,
];
