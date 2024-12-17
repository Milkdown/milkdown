import type { Mark } from '@milkdown/prose/model';
import { html } from 'atomico';
export interface LinkToolTipState {
    mode: 'preview' | 'edit';
}
export declare const linkTooltipState: import("@milkdown/utils").$Ctx<{
    mode: "preview" | "edit";
}, "linkTooltipStateCtx">;
export interface LinkTooltipAPI {
    addLink: (from: number, to: number) => void;
    editLink: (mark: Mark, from: number, to: number) => void;
    removeLink: (from: number, to: number) => void;
}
export declare const linkTooltipAPI: import("@milkdown/utils").$Ctx<{
    addLink: (from: number, to: number) => void;
    editLink: (mark: Mark, from: number, to: number) => void;
    removeLink: (from: number, to: number) => void;
}, "linkTooltipAPICtx">;
export interface LinkTooltipConfig {
    linkIcon: () => ReturnType<typeof html>;
    editButton: () => ReturnType<typeof html>;
    confirmButton: () => ReturnType<typeof html>;
    removeButton: () => ReturnType<typeof html>;
    onCopyLink: (link: string) => void;
    inputPlaceholder: string;
    shouldOpenOutside: (src: string) => boolean;
    getActualSrc: (src: string) => string;
}
export declare const linkTooltipConfig: import("@milkdown/utils").$Ctx<{
    linkIcon: () => ReturnType<typeof html>;
    editButton: () => ReturnType<typeof html>;
    confirmButton: () => ReturnType<typeof html>;
    removeButton: () => ReturnType<typeof html>;
    onCopyLink: (link: string) => void;
    inputPlaceholder: string;
    shouldOpenOutside: (src: string) => boolean;
    getActualSrc: (src: string) => string;
}, "linkTooltipConfigCtx">;
//# sourceMappingURL=slices.d.ts.map