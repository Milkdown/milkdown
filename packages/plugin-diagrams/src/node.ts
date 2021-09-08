/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';

let i = 0;

export const diagramNode = createNode((options, utils) => {
    const id = 'diagram';
    return {
        id,
        schema: {
            content: 'text*',
            group: 'block',
            marks: '',
            defining: true,
            code: true,
            attrs: {
                value: {
                    default: '',
                },
                identity: {
                    default: id + i++,
                },
            },
            parseDOM: [
                {
                    tag: 'div[data-type="diagram"]',
                    preserveWhitespace: 'full',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            value: dom.innerHTML,
                        };
                    },
                },
            ],
            toDOM: (node) => {
                return [
                    'div',
                    {
                        id: node.attrs.identity,
                        class: utils.getClassName(node.attrs, 'mermaid'),
                        'data-type': id,
                        'data-value': node.attrs.value,
                    },
                    0,
                ];
            },
        },
        parser: {
            match: ({ type }) => type === id,
            runner: (state, node, type) => {
                const value = node.value as string;
                state.openNode(type, { value });
                state.addText(value);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'mermaid' });
            },
        },
        view: (editor, nodeType, node, view, getPos, decorations) => {
            if (options?.view) {
                return options.view(editor, nodeType, node, view, getPos, decorations);
            }
            const dom = document.createElement('div');
            const code = document.createElement('div');
            code.dataset.type = id;
            code.dataset.value = node.attrs.value;
            code.contentEditable = 'true';
            code.innerText = node.attrs.value;

            const rendered = document.createElement('div');
            rendered.id = node.attrs.identity;

            dom.append(code);
            dom.append(rendered);

            mermaid.mermaidAPI.render(node.attrs.identity, node.attrs.value, (svg) => {
                rendered.innerHTML = svg;
            });

            return {
                dom: dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== 'code' || updatedNode.attrs.lang !== 'mermaid') return false;

                    // console.log(updatedNode);

                    return true;
                },
                selectNode() {
                    if (!view.editable) return;

                    dom.classList.add('selected');
                    code.classList.add('ProseMirror-selectednode');
                },
                deselectNode() {
                    dom.classList.remove('selected');
                    code.classList.remove('ProseMirror-selectednode');
                },
            };
        },
    };
});
