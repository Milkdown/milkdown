import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { MarkSchema } from '@milkdown/transformer';
import type { $Ctx } from '../$ctx';
import type { $Mark } from '../$mark';
export type GetMarkSchema = (ctx: Ctx) => MarkSchema;
export type $MarkSchema<T extends string> = [
    schemaCtx: $Ctx<GetMarkSchema, T>,
    schema: $Mark
] & {
    id: $Mark['id'];
    type: $Mark['type'];
    mark: $Mark;
    ctx: $Ctx<GetMarkSchema, T>;
    schema: MarkSchema;
    key: $Ctx<GetMarkSchema, T>['key'];
    extendSchema: (handler: (prev: GetMarkSchema) => GetMarkSchema) => MilkdownPlugin;
};
export declare function $markSchema<T extends string>(id: T, schema: GetMarkSchema): $MarkSchema<T>;
//# sourceMappingURL=$mark-schema.d.ts.map