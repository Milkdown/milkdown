import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { NodeView } from 'prosemirror-view';
import type { Editor } from '../editor';
import type { MarkViewParams, NodeViewParams } from '../utility';
import { createCtx } from './container';

export * from './container';

export const editorCtx = createCtx<Editor>({} as Editor);
export const prosePluginsCtx = createCtx<ProsemirrorPlugin[]>([]);
export const nodeViewsCtx = createCtx<Record<string, (...args: NodeViewParams | MarkViewParams) => NodeView>>({});

export const contexts = [editorCtx, prosePluginsCtx, nodeViewsCtx];
