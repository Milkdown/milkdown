import type { Component } from 'atomico';
import type { ImageBlockConfig } from '../config';
export interface Attrs {
    src: string;
    caption: string;
    ratio: number;
}
export type ImageComponentProps = Attrs & {
    config: ImageBlockConfig;
    selected: boolean;
    readonly: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
};
export declare const imageComponent: Component<ImageComponentProps>;
export declare const ImageElement: import("atomico/types/dom").Atomico<ImageComponentProps | (Attrs & {
    config: ImageBlockConfig;
    selected: boolean;
    readonly: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
} & import("atomico/types/component").SyntheticMetaProps<any>), ImageComponentProps | (Attrs & {
    config: ImageBlockConfig;
    selected: boolean;
    readonly: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
} & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map