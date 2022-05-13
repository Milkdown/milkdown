/* Copyright 2021, Milkdown by Mirone. */
import { keymap } from '@milkdown/prose/keymap';
import { DecorationAttrs } from '@milkdown/prose/view';
import { AtomList, createPlugin } from '@milkdown/utils';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { Awareness } from 'y-protocols/awareness';
import type { Doc, PermanentUserData } from 'yjs';

import { injectStyle } from './injectStyle';

export type ColorDef = {
    light: string;
    dark: string;
};
export type YSyncOpts = {
    colors?: Array<ColorDef>;
    colorMapping?: Map<string, ColorDef>;
    permanentUserData?: PermanentUserData | null;
};
export type yCursorOpts = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorBuilder?: (arg: any) => HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectionBuilder?: (arg: any) => DecorationAttrs;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSelection?: (arg: any) => any;
};
export type yUndoOpts = {
    protectedNodes?: Set<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackedOrigins?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    undoManager?: any;
};

type Options = {
    doc: Doc;
    awareness: Awareness;
    ySyncOpts: YSyncOpts;
    yCursorOpts: yCursorOpts;
    yCursorStateField?: string;
    yUndoOpts?: yUndoOpts;
};

export const y = createPlugin<string, Options>(
    (utils, { doc, awareness, ySyncOpts, yCursorOpts, yCursorStateField, yUndoOpts } = {}) => {
        if (!doc || !awareness) {
            throw new Error('Must provide doc and awareness for collaborative plugin');
        }
        return {
            prosePlugins: () => {
                const type = doc.getXmlFragment('prosemirror');

                utils.themeManager.onFlush(() => {
                    utils.getStyle((emotion) => injectStyle(utils.themeManager, emotion));
                });

                const plugin = [
                    ySyncPlugin(type, ySyncOpts),
                    yCursorPlugin(awareness, yCursorOpts as Required<yCursorOpts>, yCursorStateField),
                    yUndoPlugin(yUndoOpts),
                    keymap({
                        'Mod-z': undo,
                        'Mod-y': redo,
                        'Mod-Shift-z': redo,
                    }),
                ];
                return plugin;
            },
        };
    },
);

export const collaborative = AtomList.create([y()]);
export * from 'y-prosemirror';
