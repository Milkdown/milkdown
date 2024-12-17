import type { Component } from 'atomico';
import type { Ctx } from '@milkdown-nota/kit/ctx';
import type { ToolbarFeatureConfig } from './index';
export interface ToolbarProps {
    ctx: Ctx;
    hide: () => void;
    show: boolean;
    config?: ToolbarFeatureConfig;
}
export declare const toolbarComponent: Component<ToolbarProps>;
export declare const ToolbarElement: import("atomico/types/dom").Atomico<ToolbarProps | (ToolbarProps & import("atomico/types/component").SyntheticMetaProps<any>), ToolbarProps | (ToolbarProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map