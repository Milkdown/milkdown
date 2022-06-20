/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state';

const key = new PluginKey('MILKDOWN_TRAILING');
const notAfter = ['paragraph', 'heading'];
class Trialing extends Plugin {
    constructor() {
        super({
            key,
            view: () => ({
                update: (view) => {
                    const { state } = view;
                    const insertNodeAtEnd = key.getState(state);

                    if (!insertNodeAtEnd) {
                        return;
                    }

                    const { doc, schema, tr } = state;
                    const type = schema.nodes['paragraph'];
                    const transaction = tr
                        .insert(doc.content.size, type.create({ auto: true }))
                        .setMeta('addToHistory', false);
                    view.dispatch(transaction);
                },
            }),
            state: {
                init: (_, state) => {
                    const lastNode = state.tr.doc.lastChild;
                    return lastNode ? !notAfter.includes(lastNode.type.name) : false;
                },
                apply: (tr, value) => {
                    if (!tr.docChanged) {
                        return value;
                    }

                    const lastNode = tr.doc.lastChild;
                    return lastNode ? !notAfter.includes(lastNode.type.name) : false;
                },
            },
        });
    }
}

function createTrialing() {
    return new Trialing();
}
export { createTrialing };
