/* Copyright 2021, Milkdown by Mirone. */
import { createContainer, createSlice } from '.';

describe('context/container', () => {
    it('contextMap', () => {
        const container = createContainer();

        expect(container.contextMap).toEqual(new Map());
    });

    it('getCtx', () => {
        const container = createContainer();
        const ctx = createSlice(0);

        ctx(container.contextMap);

        expect(container.getCtx(ctx).id).toBe(ctx.id);
        expect(container.getCtx(ctx).get()).toBe(0);

        container.getCtx(ctx).set(10);

        expect(container.getCtx(ctx).get()).toBe(10);
    });
});
