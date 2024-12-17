import type { DefineFeature, Icon } from '../shared';
interface LinkTooltipConfig {
    linkIcon: Icon;
    editButton: Icon;
    removeButton: Icon;
    confirmButton: Icon;
    inputPlaceholder: string;
    onCopyLink: (link: string) => void;
    shouldOpenOutside: (src: string) => boolean;
    getActualSrc: (src: string) => string;
}
export type LinkTooltipFeatureConfig = Partial<LinkTooltipConfig>;
export declare const defineFeature: DefineFeature<LinkTooltipFeatureConfig>;
export {};
//# sourceMappingURL=index.d.ts.map