import type { MilkdownPlugin, SliceType } from '@milkdown/ctx';
export type $Ctx<T, N extends string> = MilkdownPlugin & {
    key: SliceType<T, N>;
};
export declare function $ctx<T, N extends string>(value: T, name: N): $Ctx<T, N>;
//# sourceMappingURL=$ctx.d.ts.map