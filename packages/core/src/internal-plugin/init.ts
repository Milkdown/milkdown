import re from 'remark';

import type { MilkdownPlugin } from '../utility';
import { createTimer, Timer } from '../timing';
import { ConfigReady } from './config';
import { createCtx, Meta } from '../context';
import type { Editor } from '../editor';
import { prosePluginsCtx } from './prose-plugin-factory';
import { remarkPluginsCtx } from './remark-plugin-factory';

export const Initialize = createTimer('Initialize');

export const initTimerCtx = createCtx<Timer[]>([]);
export const editorCtx = createCtx<Editor>({} as Editor);

export type RemarkParser = ReturnType<typeof re>;
export const remarkCtx: Meta<RemarkParser> = createCtx<RemarkParser>(re());

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(remarkCtx, re())
            .inject(initTimerCtx, [ConfigReady])
            .record(Initialize);

        return async (ctx) => {
            await ctx.waitTimers(initTimerCtx);

            const remark = ctx.get(remarkCtx);
            const remarkPlugins = ctx.get(remarkPluginsCtx);

            const processor = remarkPlugins.reduce((acc, plug) => acc.use(plug), remark);

            ctx.set(remarkCtx, processor);
            ctx.done(Initialize);
        };
    };
