import { createClock } from './clock';
import { createTimer } from './timing';

describe('timing/clock', () => {
    it('createClock', () => {
        const clock = createClock();
        const timer = createTimer('timer');
        const timerNotRegistered = createTimer('not');

        timer(clock.store);

        expect(clock.get(timer)).toBe(clock.store.get(timer.id));
        expect(() => clock.get(timerNotRegistered)).toThrow();
    });
});
