import { createCtx } from './ctx';

test('createCtx', () => {
    const factory = createCtx(0);
    const map = new Map();
    const ctx = factory(map);

    expect(ctx.get()).toBe(0);
});
