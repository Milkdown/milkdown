import type { MilkdownPlugin } from '../utility';
import { createTiming } from '../timing';
import { SchemaReady } from '.';
import { Config } from './config';
import { Complete } from './editor-view';
import { createCtx } from '..';
import type { Editor } from '..';
import { prosePluginsCtx } from './prose-plugin-factory';
import { remarkPluginsCtx } from './remark-plugin-factory';

export const Initialize = createTiming('Initialize');
export const Render = createTiming('Render');

export const editorCtx = createCtx<Editor>({} as Editor);

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx).inject(prosePluginsCtx).inject(remarkPluginsCtx);

        return async (ctx) => {
            ctx.set(editorCtx, editor);

            await Config();
            Initialize.done();
            await SchemaReady();
            Render.done();
            await Complete();
        };
    };
