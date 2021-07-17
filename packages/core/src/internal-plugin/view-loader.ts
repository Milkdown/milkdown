import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Complete } from '../constant';
import { editorViewCtx, parserCtx, schemaCtx } from '../context';
import { Ctx } from '../editor';

export const viewLoader = async (ctx: Ctx) => {
    await Complete();

    const _schema = ctx.use(schemaCtx).get();
    const _parser = ctx.use(parserCtx).get();
    // const _serializer = ctx.get(serializer).value;

    const state = EditorState.create({
        schema: _schema,
        doc: _parser(''),
    });
    const view = new EditorView(document.body, {
        state,
    });
    ctx.use(editorViewCtx).set(view);
};
