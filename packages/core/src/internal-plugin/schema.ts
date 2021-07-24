import { fromPairs } from 'lodash-es';
import { Schema } from 'prosemirror-model';
import { createCtx } from '../context';
import { Atom, MilkdownPlugin } from '../utility';
import { Initialize, Mark, Node } from '../internal-plugin';
import { createTimer, Timer } from '../timing';

export const SchemaReady = createTimer('schemaReady');

export const schemaCtx = createCtx<Schema>({} as Schema);
export const nodesCtx = createCtx<Node[]>([]);
export const marksCtx = createCtx<Mark[]>([]);
export const schemaTimerCtx = createCtx<Timer[]>([]);

export const schema: MilkdownPlugin = (pre) => {
    pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx).inject(schemaTimerCtx, [Initialize]).record(SchemaReady);

    return async (ctx) => {
        await ctx.waitTimers(schemaTimerCtx);

        const getAtom = <T extends Atom>(x: T[]) => fromPairs<T['schema']>(x.map(({ id, schema }) => [id, schema]));

        const nodes = getAtom(ctx.get(nodesCtx));
        const marks = getAtom(ctx.get(marksCtx));

        ctx.set(
            schemaCtx,
            new Schema({
                nodes,
                marks,
            }),
        );

        ctx.done(SchemaReady);
    };
};
