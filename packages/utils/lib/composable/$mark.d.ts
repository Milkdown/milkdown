import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { MarkSchema } from '@milkdown/transformer';
import type { MarkType } from '@milkdown/prose/model';
export type $Mark = MilkdownPlugin & {
    id: string;
    schema: MarkSchema;
    type: (ctx: Ctx) => MarkType;
};
export declare function $mark(id: string, schema: (ctx: Ctx) => MarkSchema): $Mark;
export declare function $markAsync(id: string, schema: (ctx: Ctx) => Promise<MarkSchema>, timerName?: string): import("./utils").WithTimer<$Mark>;
//# sourceMappingURL=$mark.d.ts.map