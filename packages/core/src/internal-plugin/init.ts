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

export const editorCtx = createCtx<Editor>({} as Editor);

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor).inject(prosePluginsCtx).inject(remarkPluginsCtx);

        return async () => {
            await Config();
            Initialize.done();
            await SchemaReady();

            await Complete();
        };
    };
