import type { Mark, Node } from '@milkdown/prose/model';
import type { $Ctx } from '../$ctx';
export type $NodeAttr = $Ctx<(node: Node) => Record<string, any>, `${string}Attr`>;
export declare const $nodeAttr: (name: string, value?: (node: Node) => Record<string, any>) => $NodeAttr;
export type $MarkAttr = $Ctx<(node: Mark) => Record<string, any>, `${string}Attr`>;
export declare const $markAttr: (name: string, value?: (mark: Mark) => Record<string, any>) => $MarkAttr;
//# sourceMappingURL=$attr.d.ts.map