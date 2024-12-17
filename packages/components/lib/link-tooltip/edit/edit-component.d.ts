import type { Component } from 'atomico';
import type { LinkTooltipConfig } from '../slices';
export interface LinkEditProps {
    config: LinkTooltipConfig;
    src: string;
    onConfirm: (href: string) => void;
    onCancel: () => void;
}
export declare const linkEditComponent: Component<LinkEditProps>;
export declare const LinkEditElement: import("atomico/types/dom").Atomico<LinkEditProps | (LinkEditProps & import("atomico/types/component").SyntheticMetaProps<any>), LinkEditProps | (LinkEditProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=edit-component.d.ts.map