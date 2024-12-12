import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { RemarkPluginRaw } from '@milkdown/transformer';
import type { $Ctx } from '../$ctx';
export type $Remark<Id extends string, Options> = [
    optionsCtx: $Ctx<Options, Id>,
    plugin: MilkdownPlugin
] & {
    id: Id;
    plugin: MilkdownPlugin;
    options: $Ctx<Options, Id>;
};
export declare function $remark<Id extends string, Options>(id: Id, remark: (ctx: Ctx) => RemarkPluginRaw<Options>, initialOptions?: Options): $Remark<Id, Options>;
//# sourceMappingURL=$remark.d.ts.map