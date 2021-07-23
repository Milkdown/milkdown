import type { MilkdownPlugin } from '../utility';
import { createTimer, Timer } from '../timing';
import { Config } from './config';
import { createCtx } from '..';
import type { Editor } from '..';
import { prosePluginsCtx } from './prose-plugin-factory';
import { remarkPluginsCtx } from './remark-plugin-factory';

export const Initialize = createTimer('Initialize');

export const initTimerCtx = createCtx<Timer[]>([]);
export const editorCtx = createCtx<Editor>({} as Editor);

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(initTimerCtx, [Config])
            .record(Initialize);

        return async (ctx) => {
            await Promise.all(ctx.get(initTimerCtx).map((x) => ctx.wait(x)));

            ctx.done(Initialize);
        };
    };
