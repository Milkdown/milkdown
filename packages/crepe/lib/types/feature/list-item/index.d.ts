import type { DefineFeature, Icon } from '../shared';
export interface ListItemConfig {
    bulletIcon: Icon;
    checkBoxCheckedIcon: Icon;
    checkBoxUncheckedIcon: Icon;
}
export type ListItemFeatureConfig = Partial<ListItemConfig>;
export declare const defineFeature: DefineFeature<ListItemFeatureConfig>;
//# sourceMappingURL=index.d.ts.map