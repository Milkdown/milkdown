import type { DefineFeature, Icon } from '../shared';
interface ToolbarConfig {
    boldIcon: Icon;
    codeIcon: Icon;
    italicIcon: Icon;
    linkIcon: Icon;
    strikethroughIcon: Icon;
}
export type ToolbarFeatureConfig = Partial<ToolbarConfig>;
export declare const defineFeature: DefineFeature<ToolbarFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map