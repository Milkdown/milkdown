/* Copyright 2021, Milkdown by Mirone. */
import {
    Ctx,
    DefaultValue,
    editorViewCtx,
    getDoc,
    parserCtx,
    prosePluginsCtx,
    schemaCtx,
    themeManagerCtx,
} from '@milkdown/core';
import { ctxNotBind, missingYjsDoc } from '@milkdown/exception';
import { keydownHandler } from '@milkdown/prose/keymap';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import type { DecorationAttrs } from '@milkdown/prose/view';
import {
    prosemirrorToYDoc,
    redo,
    undo,
    yCursorPlugin,
    yCursorPluginKey,
    yDocToProsemirror,
    ySyncPlugin,
    ySyncPluginKey,
    yUndoPlugin,
    yUndoPluginKey,
} from 'y-prosemirror';
import { Awareness } from 'y-protocols/awareness';
import { applyUpdate, Doc, encodeStateAsUpdate, PermanentUserData } from 'yjs';

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

export type Options = {
    ySyncOpts?: YSyncOpts;
    yCursorOpts?: yCursorOpts;
    yCursorStateField?: string;
    yUndoOpts?: yUndoOpts;
};

export const CollabKeymapPluginKey = new PluginKey('MILKDOWN_COLLAB_KEYMAP');

const collabPluginKeys = [CollabKeymapPluginKey, ySyncPluginKey, yCursorPluginKey, yUndoPluginKey];

export class CollabService {
    #options: Options = {};
    #doc: Doc | null = null;
    #awareness: Awareness | null = null;
    #ctx: Ctx | null = null;
    #connected = false;

    #valueToNode(value: DefaultValue): Node | undefined {
        if (!this.#ctx) throw ctxNotBind();

        const schema = this.#ctx.get(schemaCtx);
        const parser = this.#ctx.get(parserCtx);

        const doc = getDoc(value, parser, schema);
        return doc;
    }

    #createPlugins(): Plugin[] {
        if (!this.#doc) throw missingYjsDoc();
        const { ySyncOpts, yUndoOpts } = this.#options;
        const type = this.#doc.getXmlFragment('prosemirror');
        const plugins = [
            ySyncPlugin(type, ySyncOpts),
            yUndoPlugin(yUndoOpts),
            new Plugin({
                key: CollabKeymapPluginKey,
                props: {
                    handleKeyDown: keydownHandler({
                        'Mod-z': undo,
                        'Mod-y': redo,
                        'Mod-Shift-z': redo,
                    }),
                },
            }),
        ];
        if (this.#awareness) {
            const { yCursorOpts, yCursorStateField } = this.#options;
            plugins.push(yCursorPlugin(this.#awareness, yCursorOpts as Required<yCursorOpts>, yCursorStateField));
        }

        return plugins;
    }

    #flushEditor(plugins: Plugin[]) {
        if (!this.#ctx) throw ctxNotBind();
        this.#ctx.set(prosePluginsCtx, plugins);

        const view = this.#ctx.get(editorViewCtx);
        const newState = view.state.reconfigure({ plugins });
        view.updateState(newState);

        const theme = this.#ctx.get(themeManagerCtx);
        theme.flush(this.#ctx);
    }

    bindCtx(ctx: Ctx) {
        this.#ctx = ctx;
        return this;
    }

    bindDoc(doc: Doc) {
        this.#doc = doc;
        return this;
    }

    setOptions(options: Options) {
        this.#options = options;
        return this;
    }

    mergeOptions(options: Partial<Options>) {
        Object.assign(this.#options, options);
        return this;
    }

    setAwareness(awareness: Awareness) {
        this.#awareness = awareness;
        return this;
    }

    applyTemplate(template: DefaultValue, condition?: (yDocNode: Node, templateNode: Node) => boolean) {
        if (!this.#ctx) throw ctxNotBind();
        if (!this.#doc) throw missingYjsDoc();
        const conditionFn = condition || ((yDocNode) => yDocNode.textContent.length === 0);

        const node = this.#valueToNode(template);
        const schema = this.#ctx.get(schemaCtx);
        const yDocNode = yDocToProsemirror(schema, this.#doc);

        if (node && conditionFn(yDocNode, node)) {
            const fragment = this.#doc.getXmlFragment('prosemirror');
            fragment.delete(0, fragment.length);
            const templateDoc = prosemirrorToYDoc(node);
            const template = encodeStateAsUpdate(templateDoc);
            applyUpdate(this.#doc, template);
            templateDoc.destroy();
        }

        return this;
    }

    connect() {
        if (!this.#ctx) throw ctxNotBind();
        if (this.#connected) return;

        const prosePlugins = this.#ctx.get(prosePluginsCtx);
        const collabPlugins = this.#createPlugins();
        const plugins = prosePlugins.concat(collabPlugins);

        this.#flushEditor(plugins);
        this.#connected = true;

        return this;
    }

    disconnect() {
        if (!this.#ctx) throw ctxNotBind();
        if (!this.#connected) return this;

        const prosePlugins = this.#ctx.get(prosePluginsCtx);
        const plugins = prosePlugins.filter(
            (plugin) => !plugin.spec.key || !collabPluginKeys.includes(plugin.spec.key),
        );

        this.#flushEditor(plugins);
        this.#connected = false;

        return this;
    }
}
