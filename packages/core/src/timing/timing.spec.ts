import { createTimer } from './timing';

describe('timing/timing', () => {
    it('createTimer', () => {
        const timer = createTimer('timer');
        const map = new Map();
        const timing = timer(map);

        const wait = timing();

        expect(wait).resolves.toBeUndefined();

        timing.done();
    });

    it('timeout', () => {
        const timer = createTimer('timer', 10);
        const map = new Map();
        const timing = timer(map);

        const wait = timing();

        expect(wait).rejects.toBe('Timing timer timeout.');
    });
});
