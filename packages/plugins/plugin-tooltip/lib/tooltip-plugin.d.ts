import type { SliceType } from '@milkdown/ctx';
import type { PluginSpec } from '@milkdown/prose/state';
import type { $Ctx, $Prose } from '@milkdown/utils';
export type TooltipSpecId<Id extends string> = `${Id}_TOOLTIP_SPEC`;
export type TooltipPlugin<Id extends string, State = any> = [$Ctx<PluginSpec<State>, TooltipSpecId<Id>>, $Prose] & {
    key: SliceType<PluginSpec<State>, TooltipSpecId<Id>>;
    pluginKey: $Prose['key'];
};
export declare function tooltipFactory<Id extends string, State = any>(id: Id): TooltipPlugin<Id, any>;
//# sourceMappingURL=tooltip-plugin.d.ts.map