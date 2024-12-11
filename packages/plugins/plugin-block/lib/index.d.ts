import type { SliceType } from '@milkdown/ctx';
import type { PluginSpec } from '@milkdown/prose/state';
import type { $Ctx, $Prose } from '@milkdown/utils';
import type { FilterNodes } from './block-config';
import type { BlockService } from './block-service';
export * from './block-plugin';
export * from './block-provider';
export * from './block-service';
export * from './block-config';
export * from './types';
export type BlockPlugin = [
    $Ctx<PluginSpec<any>, 'blockSpec'>,
    $Ctx<{
        filterNodes: FilterNodes;
    }, 'blockConfig'>,
    $Ctx<BlockService, 'blockService'>,
    $Prose
] & {
    key: SliceType<PluginSpec<any>, 'blockSpec'>;
    pluginKey: $Prose['key'];
};
export declare const block: BlockPlugin;
//# sourceMappingURL=index.d.ts.map