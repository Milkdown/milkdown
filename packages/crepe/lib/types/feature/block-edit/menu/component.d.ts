import type { Component } from 'atomico';
import type { Ctx } from '@milkdown/kit/ctx';
import type { BlockEditFeatureConfig } from '../index';
export interface MenuProps {
    ctx: Ctx;
    show: boolean;
    filter: string;
    hide: () => void;
    config?: BlockEditFeatureConfig;
}
export declare const menuComponent: Component<MenuProps>;
export declare const MenuElement: import("atomico/types/dom").Atomico<MenuProps | (MenuProps & import("atomico/types/component").SyntheticMetaProps<any>), MenuProps | (MenuProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map