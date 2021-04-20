import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

type Item = {
    $: Element;
    command: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
};

class SelectionMarksTooltip {
    private $: HTMLDivElement;
    constructor(private items: Item[], private view: EditorView) {
        this.$ = document.createElement('div');
        this.$.className = 'tooltip';
        items.forEach(({ $ }) => this.$.appendChild($));
        view.dom.parentNode?.appendChild(this.$);
        this.update(view);

        this.$.addEventListener('mousedown', this.listener);
    }

    update(view: EditorView, prevState?: EditorState) {
        const state = view.state;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        if (state.selection.empty) {
            this.$.classList.add('hide');
            return;
        }

        this.$.classList.remove('hide');
        const { from, to } = state.selection;

        const box = this.$.offsetParent?.getBoundingClientRect();
        if (!box) return;

        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.$.style.left = left - box.left + 'px';
        this.$.style.bottom = box.bottom - start.top + 'px';
    }

    destroy() {
        this.$.removeEventListener('mousedown', this.listener);
        this.$.remove();
    }

    private listener = (e: Event) => {
        const { view } = this;
        if (!view) return;
        e.preventDefault();
        this.items.forEach(({ $, command }) => {
            if ($.contains(e.target as Element)) {
                command(view.state, view.dispatch);
            }
        });
    };
}

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

function icon(text: string, title = text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.title = title;
    span.className = `icon ${title}`;
    return span;
}

const selectionMarksTooltipPlugin = (ctx: PluginReadyContext) =>
    new Plugin({
        key: new PluginKey(key),
        view: (editorView) =>
            new SelectionMarksTooltip(
                [
                    { $: icon('B', 'strong'), command: toggleMark(ctx.schema.marks.strong) },
                    { $: icon('I', 'italic'), command: toggleMark(ctx.schema.marks.em) },
                    { $: icon('<>', 'code'), command: toggleMark(ctx.schema.marks.code_inline) },
                ],
                editorView,
            ),
    });

export const tooltip = createProsemirrorPlugin('tooltip', (ctx) => [selectionMarksTooltipPlugin(ctx)]);
