/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest';

import { createTimer } from './timing';

describe('timing/timing', () => {
    it('createTimer', async () => {
        const timer = createTimer('timer');
        const map = new Map();
        const timing = timer(map);
        setTimeout(() => {
            timing.done();
        }, 10);

        await expect(timing()).resolves.toBeUndefined();
    });

    it('timeout', async () => {
        const timer = createTimer('timer', 10);
        const map = new Map();
        const timing = timer(map);

        await expect(timing()).rejects.toBe('Timing timer timeout.');
    });
});
