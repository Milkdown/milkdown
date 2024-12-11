import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { NodeSchema } from '@milkdown/transformer';
import type { $Ctx } from '../$ctx';
import type { $Node } from '../$node';
export type GetNodeSchema = (ctx: Ctx) => NodeSchema;
export type $NodeSchema<T extends string> = [
    schemaCtx: $Ctx<GetNodeSchema, T>,
    schema: $Node
] & {
    id: $Node['id'];
    type: $Node['type'];
    node: $Node;
    ctx: $Ctx<GetNodeSchema, T>;
    schema: NodeSchema;
    key: $Ctx<GetNodeSchema, T>['key'];
    extendSchema: (handler: (prev: GetNodeSchema) => GetNodeSchema) => MilkdownPlugin;
};
export declare function $nodeSchema<T extends string>(id: T, schema: GetNodeSchema): $NodeSchema<T>;
//# sourceMappingURL=$node-schema.d.ts.map