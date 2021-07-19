import type { Plugin as RemarkPlugin } from 'unified';
import { MilkdownPlugin } from '..';
import { Initialize } from './init';
import { remarkCtx } from './parser';

export const remarkPluginFactory =
    (plugin: RemarkPlugin | RemarkPlugin[]): MilkdownPlugin =>
    () =>
    async (ctx) => {
        await Initialize();
        const re = ctx.get(remarkCtx);
        const remark = [plugin].flat().reduce((instance, plug) => instance.use(plug), re);
        ctx.set(remarkCtx, remark);
    };
