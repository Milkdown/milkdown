/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest';

import { createContainer, createSlice } from '.';

describe('context/container', () => {
    it('sliceMap', () => {
        const container = createContainer();

        expect(container.sliceMap).toEqual(new Map());
    });

    it('getSlice', () => {
        const container = createContainer();
        const ctx = createSlice(0, 'num');

        ctx(container.sliceMap);

        expect(container.getSlice(ctx).id).toBe(ctx.id);
        expect(container.getSlice(ctx).get()).toBe(0);

        container.getSlice(ctx).set(10);

        expect(container.getSlice(ctx).get()).toBe(10);
    });
});
