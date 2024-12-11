import type { Component } from 'atomico';
import type { InlineImageConfig } from './config';
export interface Attrs {
    src: string;
    alt: string;
    title: string;
}
export type InlineImageComponentProps = Attrs & {
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    selected: boolean;
    config: InlineImageConfig;
};
export declare const inlineImageComponent: Component<InlineImageComponentProps>;
export declare const InlineImageElement: import("atomico/types/dom").Atomico<InlineImageComponentProps | (Attrs & {
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    selected: boolean;
    config: InlineImageConfig;
} & import("atomico/types/component").SyntheticMetaProps<any>), InlineImageComponentProps | (Attrs & {
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    selected: boolean;
    config: InlineImageConfig;
} & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map