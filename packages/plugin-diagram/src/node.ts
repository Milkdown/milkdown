/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';
import { Node } from 'prosemirror-model';

let i = 0;

export const diagramNode = createNode((options, utils) => {
    const codeStyle = utils.getStyle(
        ({ palette, size, font }) => css`
            color: ${palette('neutral', 0.87)};
            background-color: ${palette('background')};
            border-radius: ${size.radius};
            padding: 1rem 2rem;
            font-size: 0.875rem;
            font-family: ${font.code};
        `,
    );
    const previewPanelStyle = utils.getStyle(
        () => css`
            display: flex;
            justify-content: center;
            padding: 1rem 0;
        `,
    );

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
            if (codeStyle) {
                code.classList.add(codeStyle);
            }

            const rendered = document.createElement('div');
            rendered.id = node.attrs.identity;
            if (previewPanelStyle) {
                rendered.classList.add(previewPanelStyle);
            }

            dom.append(code);

            const render = (node: Node) => {
                mermaid.mermaidAPI.render(node.attrs.identity, node.attrs.value, (svg) => {
                    rendered.innerHTML = svg;
                    dom.append(rendered);
                });
            };

            render(node);

            return {
                dom: dom,
                contentDOM: code,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;
                    const newVal = updatedNode.content.firstChild?.text || '';

                    code.dataset.value = newVal;
                    updatedNode.attrs.value = newVal;
                    render(updatedNode);

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
                destroy() {
                    rendered.remove();
                    code.remove();
                    dom.remove();
                },
            };
        },
    };
});
