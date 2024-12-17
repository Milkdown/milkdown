interface RenderLabelProps {
    label: string;
    listType: string;
    readonly?: boolean;
    checked?: boolean;
}
export interface ListItemBlockConfig {
    renderLabel: (props: RenderLabelProps) => void;
}
export declare const defaultListItemBlockConfig: ListItemBlockConfig;
export declare const listItemBlockConfig: import("@milkdown/utils").$Ctx<ListItemBlockConfig, "listItemBlockConfigCtx">;
export {};
//# sourceMappingURL=config.d.ts.map