# @milkdown/ctx

> **Note**: This package is not intended to be used directly.

This package provides context, timer and plugin definition for milkdown.

Please read [plugins-101](/plugins-101#timer) to learn foundation of timer and ctx.

## Container

Container manages lots of slices.

```typescript
const container = createContainer();
const slice = createSlice(0, 'num');

slice(container.sliceMap);

expect(container.getSlice(slice).id).toBe(slice.id);
expect(container.getSlice(slice).get()).toBe(0);

container.getSlice(slice).set(10);

expect(container.getSlice(slice).get()).toBe(10);

container.getSlice(slice).update((x) => x + 1);

expect(container.getSlice<number>('num').get()).toBe(11);
```

## Clock

Clock is a little bit like container. It manages lots of timer.

```typescript
const clock = createClock();
const timer = createTimer('timer');

const timing = timer(clock.store);

setTimeout(() => {
    timing.done();
}, 10);

await expect(timing()).resolves.toBeUndefined();
expect(clock.get(timer)).toBe(timing);
```
