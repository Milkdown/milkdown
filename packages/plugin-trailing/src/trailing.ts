/* Copyright 2021, Milkdown by ezone. */
import { Plugin, PluginKey } from '@milkdown/prose/state';

const name = new PluginKey('trailingNode');
const notAfter = ['paragraph', 'heading'];
class TrialingNode extends Plugin {
    constructor() {
        super({
            key: name,
            view: () => ({
                update: (view) => {
                    const { state } = view;
                    const insertNodeAtEnd = name.getState(state);

                    if (!insertNodeAtEnd) {
                        return;
                    }

                    const { doc, schema, tr } = state;
                    const type = schema.nodes['paragraph'];
                    const transaction = tr.insert(doc.content.size, type.create());
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
    return new TrialingNode();
}
export { createTrialing };
