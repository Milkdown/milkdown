import type { PluginView } from '@milkdown/kit/prose/state';
import type { Ctx } from '@milkdown/kit/ctx';
import type { BlockEditFeatureConfig } from '../index';
export declare class BlockHandleView implements PluginView {
    #private;
    constructor(ctx: Ctx, config?: BlockEditFeatureConfig);
    update: () => void;
    destroy: () => void;
    onAdd: () => void;
}
export declare function configureBlockHandle(ctx: Ctx, config?: BlockEditFeatureConfig): void;
//# sourceMappingURL=index.d.ts.map