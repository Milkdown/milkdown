import type { DefineFeature, Icon } from '../shared';
interface LinkTooltipConfig {
    linkIcon: Icon;
    editButton: Icon;
    removeButton: Icon;
    confirmButton: Icon;
    inputPlaceholder: string;
    onCopyLink: (link: string) => void;
}
export type LinkTooltipFeatureConfig = Partial<LinkTooltipConfig>;
export declare const defineFeature: DefineFeature<LinkTooltipFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map