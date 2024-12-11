import type { Ctx } from '@milkdown/ctx';
import type { DefaultValue } from '@milkdown/core';
import type { Node } from '@milkdown/prose/model';
import { PluginKey } from '@milkdown/prose/state';
import type { DecorationAttrs } from '@milkdown/prose/view';
import type { Awareness } from 'y-protocols/awareness';
import type { Doc, PermanentUserData } from 'yjs';
export interface ColorDef {
    light: string;
    dark: string;
}
export interface YSyncOpts {
    colors?: Array<ColorDef>;
    colorMapping?: Map<string, ColorDef>;
    permanentUserData?: PermanentUserData | null;
}
export interface yCursorOpts {
    cursorBuilder?: (arg: any) => HTMLElement;
    selectionBuilder?: (arg: any) => DecorationAttrs;
    getSelection?: (arg: any) => any;
}
export interface yUndoOpts {
    protectedNodes?: Set<string>;
    trackedOrigins?: any[];
    undoManager?: any;
}
export interface CollabServiceOptions {
    yCursorStateField?: string;
    ySyncOpts?: YSyncOpts;
    yCursorOpts?: yCursorOpts;
    yUndoOpts?: yUndoOpts;
}
export declare const CollabKeymapPluginKey: PluginKey<any>;
export declare class CollabService {
    #private;
    bindCtx(ctx: Ctx): this;
    bindDoc(doc: Doc): this;
    setOptions(options: CollabServiceOptions): this;
    mergeOptions(options: Partial<CollabServiceOptions>): this;
    setAwareness(awareness: Awareness): this;
    applyTemplate(template: DefaultValue, condition?: (yDocNode: Node, templateNode: Node) => boolean): this;
    connect(): this | undefined;
    disconnect(): this;
}
//# sourceMappingURL=collab-service.d.ts.map