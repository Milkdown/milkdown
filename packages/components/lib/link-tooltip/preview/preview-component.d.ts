import type { Component } from 'atomico';
import type { LinkTooltipConfig } from '../slices';
export interface LinkPreviewProps {
    config: LinkTooltipConfig;
    src: string;
    onEdit: () => void;
    onRemove: () => void;
}
export declare const linkPreviewComponent: Component<LinkPreviewProps>;
export declare const LinkPreviewElement: import("atomico/types/dom").Atomico<LinkPreviewProps | (LinkPreviewProps & import("atomico/types/component").SyntheticMetaProps<any>), LinkPreviewProps | (LinkPreviewProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=preview-component.d.ts.map