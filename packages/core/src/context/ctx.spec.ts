import { createCtx } from './ctx';

test('primitive ctx', () => {
    const factory = createCtx(0);
    const map = new Map();
    const ctx = factory(map);

    expect(ctx.get()).toBe(0);

    ctx.set(20);
    expect(ctx.get()).toBe(20);

    ctx.update((x) => x + 1);
    expect(ctx.get()).toBe(21);
});

test('structure ctx', () => {
    const factory = createCtx<number[]>([]);
    const map1 = new Map();
    const ctx1 = factory(map1);

    const map2 = new Map();
    const ctx2 = factory(map2);

    expect(ctx1.get()).toEqual([]);
    ctx1.set([1]);
    expect(ctx1.get()).toEqual([1]);

    expect(ctx2.get()).toEqual([]);

    ctx1.update((x) => x.concat(3));
    expect(ctx1.get()).toEqual([1, 3]);

    expect(ctx2.get()).toEqual([]);
});
