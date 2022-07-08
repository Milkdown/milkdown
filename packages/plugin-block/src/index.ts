/* Copyright 2021, Milkdown by Mirone. */
import { Node, ResolvedPos } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { AtomList, createPlugin } from '@milkdown/utils';

export const defaultNodeFilter = (node: Node) => {
    const { name } = node.type;
    if (name.startsWith('table') && name !== 'table') {
        return false;
    }
    return true;
};

const nodeIsNotBlock = (node: Node) => !node.type.isBlock;
const nodeIsFirstChild = (pos: ResolvedPos) => {
    let parent = pos.parent;
    const node = pos.node();

    if (parent === node) {
        parent = pos.node(pos.depth - 1);
    }
    if (!parent || parent.type.name === 'doc') return false;

    return parent.firstChild === node;
};

const selectRootNodeByDom = (dom: Element, view: EditorView, filterNodes: (node: Node) => boolean) => {
    const pos = view.posAtDOM(dom, 0);
    if (pos === 0) return;

    let pos$ = view.state.doc.resolve(pos);
    let node = pos$.node();

    while (node && (nodeIsNotBlock(node) || nodeIsFirstChild(pos$) || !filterNodes(node))) {
        pos$ = view.state.doc.resolve(pos$.before());
        node = pos$.node();
    }

    return node;
};

type Options = {
    filterNodes: (node: Node) => boolean;
};
export const blockPlugin = createPlugin<string, Options>((_, options) => {
    const filterNodes = options?.filterNodes ?? defaultNodeFilter;

    return {
        prosePlugins: () => {
            return [
                new Plugin({
                    key: new PluginKey('block'),
                    props: {
                        handleDOMEvents: {
                            mousedown: (view, event) => {
                                const dom = event.target;
                                if (!(dom instanceof Element)) return false;

                                const node = selectRootNodeByDom(dom, view, filterNodes);

                                if (!node) return false;

                                // TODO: add decoration here

                                return false;
                            },
                        },
                    },
                }),
            ];
        },
    };
});

export const block: AtomList = AtomList.create([blockPlugin()]);
