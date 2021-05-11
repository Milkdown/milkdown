import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core/lib';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { createDropdown, findParentNode } from './utility';

export const slashPlugin = createProsemirrorPlugin('slash', (ctx) => [plugin(ctx)]);

const plugin = (ctx: PluginReadyContext) =>
    new Plugin({
        view: (editorView) => new SlashPlugin(editorView, ctx),
        props: {
            decorations: (state) => {
                const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
                if (!parent) return null;

                const isEmpty = parent.node.content.size === 0;
                const isSlash = parent.node.textContent === '/';
                if (isEmpty) {
                    return DecorationSet.create(state.doc, [
                        Decoration.widget(parent.pos + 1, document.createTextNode('Enter something')),
                    ]);
                }

                if (isSlash) {
                    return DecorationSet.create(state.doc, [
                        Decoration.widget(parent.pos + 2, document.createTextNode('Enter command')),
                    ]);
                }

                return null;
            },
        },
    });

class SlashPlugin {
    #element: HTMLDivElement;
    #ctx: PluginReadyContext;
    constructor(editorView: EditorView, ctx: PluginReadyContext) {
        this.#element = createDropdown();
        this.#ctx = ctx;

        editorView.dom.parentNode?.appendChild(this.#element);
    }

    update(view: EditorView) {
        const { state } = view;

        const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);

        if (!parent) return;

        const isEmpty = parent.node.content.size === 0;
        const isSlash = parent.node.textContent === '/';

        console.log(isEmpty, isSlash, this.#ctx);
    }

    destroy() {
        this.#element.remove();
    }
}
