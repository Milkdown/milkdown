import type { Component } from 'atomico';
import type { Node } from '@milkdown/prose/model';
import type { EditorView } from '@milkdown/prose/view';
import type { Ctx } from '@milkdown/ctx';
import type { TableBlockConfig } from '../config';
export interface TableComponentProps {
    view: EditorView;
    ctx: Ctx;
    getPos: () => number | undefined;
    node: Node;
    config: TableBlockConfig;
}
export declare const tableComponent: Component<TableComponentProps>;
export declare const TableElement: import("atomico/types/dom").Atomico<TableComponentProps | (TableComponentProps & import("atomico/types/component").SyntheticMetaProps<any>), TableComponentProps | (TableComponentProps & import("atomico/types/component").SyntheticMetaProps<any>), {
    new (): HTMLElement;
    prototype: HTMLElement;
}>;
//# sourceMappingURL=component.d.ts.map