import { RenderType } from '@milkdown-nota/kit/component/table-block';
import { Ctx, SliceType } from '@milkdown-nota/kit/ctx';
import type { DefineFeature, Icon } from '../shared';
import { html } from 'atomico';
interface TableConfig {
    addRowIcon: Icon;
    addColIcon: Icon;
    deleteRowIcon: Icon;
    deleteColIcon: Icon;
    alignLeftIcon: Icon;
    alignCenterIcon: Icon;
    alignRightIcon: Icon;
    colDragHandleIcon: Icon;
    rowDragHandleIcon: Icon;
}
export type TableFeatureConfig = Partial<TableConfig>;
export declare function crepeTableBlockConfig(configKey: SliceType<{
    renderButton: (renderType: RenderType) => HTMLElement | ReturnType<typeof html> | string;
}, 'tableBlockConfigCtx'>, config: TableFeatureConfig | undefined): (ctx: Ctx) => void;
export declare const defineFeature: DefineFeature<TableFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map