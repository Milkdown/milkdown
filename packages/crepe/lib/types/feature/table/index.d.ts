import type { DefineFeature, Icon } from '../shared';
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
export declare const defineFeature: DefineFeature<TableFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map