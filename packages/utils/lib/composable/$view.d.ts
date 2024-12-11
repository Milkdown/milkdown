import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import type { $Mark, $Node } from '.';
export type $View<T extends $Node | $Mark, V extends NodeViewConstructor | MarkViewConstructor> = MilkdownPlugin & {
    view: V;
    type: T;
};
export type GetConstructor<T extends $Node | $Mark> = T extends $Node ? NodeViewConstructor : T extends $Mark ? MarkViewConstructor : NodeViewConstructor | MarkViewConstructor;
export declare function $view<T extends $Node | $Mark, V extends NodeViewConstructor | MarkViewConstructor = GetConstructor<T>>(type: T, view: (ctx: Ctx) => V): $View<T, V>;
export declare function $viewAsync<T extends $Node | $Mark, V extends NodeViewConstructor | MarkViewConstructor = GetConstructor<T>>(type: T, view: (ctx: Ctx) => Promise<V>, timerName?: string): import("./utils").WithTimer<$View<T, V>>;
//# sourceMappingURL=$view.d.ts.map