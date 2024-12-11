import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { NodeType } from '@milkdown/prose/model';
import type { NodeSchema } from '@milkdown/transformer';
export type $Node = MilkdownPlugin & {
    id: string;
    schema: NodeSchema;
    type: (ctx: Ctx) => NodeType;
};
export declare function $node(id: string, schema: (ctx: Ctx) => NodeSchema): $Node;
export declare function $nodeAsync(id: string, schema: (ctx: Ctx) => Promise<NodeSchema>, timerName?: string): import("./utils").WithTimer<$Node>;
//# sourceMappingURL=$node.d.ts.map