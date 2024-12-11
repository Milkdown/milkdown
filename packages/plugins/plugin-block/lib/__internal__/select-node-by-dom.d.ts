import type { EditorView } from '@milkdown/prose/view';
import type { FilterNodes } from '../block-config';
import type { ActiveNode } from '../types';
export declare function selectRootNodeByDom(view: EditorView, coords: {
    x: number;
    y: number;
}, filterNodes: FilterNodes): ActiveNode | null;
//# sourceMappingURL=select-node-by-dom.d.ts.map