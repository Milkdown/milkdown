import type { SliceType } from '@milkdown/ctx';
import type { PluginSpec } from '@milkdown/prose/state';
import type { $Ctx, $Prose } from '@milkdown/utils';
export type SlashPluginSpecId<Id extends string> = `${Id}_SLASH_SPEC`;
export type SlashPlugin<Id extends string, State = any> = [$Ctx<PluginSpec<State>, SlashPluginSpecId<Id>>, $Prose] & {
    key: SliceType<PluginSpec<State>, SlashPluginSpecId<Id>>;
    pluginKey: $Prose['key'];
};
export declare function slashFactory<Id extends string, State = any>(id: Id): SlashPlugin<Id, any>;
//# sourceMappingURL=slash-plugin.d.ts.map