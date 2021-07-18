import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { createCtx } from '..';
import { Complete } from '../constant';
import { MilkdownPlugin } from '../utility';
import { parserCtx } from './parser';
import { schemaCtx } from './schema';

export const editorViewCtx = createCtx<EditorView>({} as EditorView);

export const editorView: MilkdownPlugin = (editor) => {
    editor.ctx(editorViewCtx);
    return async (ctx) => {
        await Complete();

        const schema = ctx.use(schemaCtx).get();
        const parser = ctx.use(parserCtx).get();
        // const _serializer = ctx.get(serializer).value;
        const state = EditorState.create({
            schema,
            doc: parser(''),
        });
        const view = new EditorView(document.body, {
            state,
        });
        ctx.use(editorViewCtx).set(view);
    };
};
