import type { Icon } from '../../shared';
export interface BlockHandleProps {
    show: boolean;
    onAdd: () => void;
    addIcon: Icon;
    handleIcon: Icon;
}
export declare const BlockHandleElement: import("atomico/types/dom").Atomico<BlockHandleProps | (BlockHandleProps & import("atomico/types/component").SyntheticMetaProps<any>), BlockHandleProps | (BlockHandleProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map