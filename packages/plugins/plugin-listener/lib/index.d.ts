import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { Node as ProseNode } from '@milkdown/prose/model';
import { PluginKey } from '@milkdown/prose/state';
export interface Subscribers {
    beforeMount: ((ctx: Ctx) => void)[];
    mounted: ((ctx: Ctx) => void)[];
    updated: ((ctx: Ctx, doc: ProseNode, prevDoc: ProseNode) => void)[];
    markdownUpdated: ((ctx: Ctx, markdown: string, prevMarkdown: string) => void)[];
    blur: ((ctx: Ctx) => void)[];
    focus: ((ctx: Ctx) => void)[];
    destroy: ((ctx: Ctx) => void)[];
}
export declare class ListenerManager {
    private beforeMountedListeners;
    private mountedListeners;
    private updatedListeners;
    private markdownUpdatedListeners;
    private blurListeners;
    private focusListeners;
    private destroyListeners;
    get listeners(): Subscribers;
    beforeMount: (fn: (ctx: Ctx) => void) => this;
    mounted: (fn: (ctx: Ctx) => void) => this;
    updated: (fn: (ctx: Ctx, doc: ProseNode, prevDoc: ProseNode | null) => void) => this;
    markdownUpdated(fn: (ctx: Ctx, markdown: string, prevMarkdown: string) => void): this;
    blur(fn: (ctx: Ctx) => void): this;
    focus(fn: (ctx: Ctx) => void): this;
    destroy(fn: (ctx: Ctx) => void): this;
}
export declare const listenerCtx: import("@milkdown/ctx").SliceType<ListenerManager, string>;
export declare const key: PluginKey<any>;
export declare const listener: MilkdownPlugin;
//# sourceMappingURL=index.d.ts.map