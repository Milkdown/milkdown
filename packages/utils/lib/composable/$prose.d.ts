import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { Plugin, PluginKey } from '@milkdown/prose/state';
export type $Prose = MilkdownPlugin & {
    plugin: () => Plugin;
    key: () => PluginKey | undefined;
};
export declare function $prose(prose: (ctx: Ctx) => Plugin): $Prose;
export declare function $proseAsync(prose: (ctx: Ctx) => Promise<Plugin>, timerName?: string): import("./utils").WithTimer<$Prose>;
//# sourceMappingURL=$prose.d.ts.map