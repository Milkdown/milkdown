/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { AtomList, createPlugin } from '@milkdown/utils';

export const blockPlugin = createPlugin(() => ({
    prosePlugins: () => {
        return [
            new Plugin({
                key: new PluginKey('block'),
                props: {
                    handleDOMEvents: {
                        mouseover: (view, event) => {
                            const dom = event.target;
                            if (!(dom instanceof Element)) return false;

                            const pos = view.posAtDOM(dom, 0);
                            if (pos === 0) return false;

                            const pos$ = view.state.doc.resolve(pos);

                            let node = pos$.node();
                            // TODO: add a priority list for the node types
                            while (node?.isText) {
                                node = pos$.node(pos$.depth - 1);
                            }

                            return false;
                        },
                    },
                },
            }),
        ];
    },
}));

export const block: AtomList = AtomList.create([blockPlugin()]);
