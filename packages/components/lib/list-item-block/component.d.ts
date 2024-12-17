import type { Component } from 'atomico';
import type { ListItemBlockConfig } from './config';
interface Attrs {
    label: string;
    checked: boolean;
    listType: string;
}
export type ListItemComponentProps = Attrs & {
    config: ListItemBlockConfig;
    readonly: boolean;
    selected: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    onMount: () => void;
};
export declare const listItemComponent: Component<ListItemComponentProps>;
export declare const ListItemElement: import("atomico/types/dom").Atomico<ListItemComponentProps | (Attrs & {
    config: ListItemBlockConfig;
    readonly: boolean;
    selected: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    onMount: () => void;
} & import("atomico/types/component").SyntheticMetaProps<any>), ListItemComponentProps | (Attrs & {
    config: ListItemBlockConfig;
    readonly: boolean;
    selected: boolean;
    setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void;
    onMount: () => void;
} & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
export {};
//# sourceMappingURL=component.d.ts.map