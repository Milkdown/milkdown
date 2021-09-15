/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';
import { Node } from 'prosemirror-model';

function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function tryRgbToHex(maybeRgb: string) {
    if (!maybeRgb) return '';

    const result = maybeRgb.split(',').map((x) => Number(x.trim()));

    if (result.length < 3) {
        return maybeRgb;
    }

    const valid = result.every((x) => {
        return x >= 0 && x <= 256;
    });

    if (!valid) {
        return maybeRgb;
    }

    return rgbToHex(...(result as [number, number, number]));
}

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
            overflow: hidden;
        `,
    );
    const hideCodeStyle = css`
        display: none;
    `;
    const previewPanelStyle = utils.getStyle(
        () => css`
            display: flex;
            justify-content: center;
            padding: 1rem 0;
        `,
    );
    const mermaidVariables = () => {
        const styleRoot = getComputedStyle(document.documentElement);
        const getColor = (v: string) => tryRgbToHex(styleRoot.getPropertyValue('--' + v));
        const primary = getColor('primary');
        const secondary = getColor('secondary');
        const solid = getColor('solid');
        const neutral = getColor('neutral');
        const background = getColor('background');
        const style = {
            background,
            primaryColor: secondary,
            secondaryColor: primary,
            primaryTextColor: neutral,
            noteBkgColor: background,
            noteTextColor: solid,
        };
        return Object.entries(style)
            .filter(([_, value]) => value.length > 0)
            .map(([key, value]) => `'${key}':'${value}'`)
            .join(', ');
    };
    const header = `%%{init: {'theme': 'base', 'themeVariables': { ${mermaidVariables()} }}}%%\n`;

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
                editing: {
                    default: false,
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
                        'data-editing': node.attrs.editing.toString(),
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
            dom.classList.add('mermaid', 'diagram');
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

            dom.dataset.editing = node.attrs.editing.toString();
            if (!node.attrs.editing) {
                code.classList.add(hideCodeStyle);
            } else {
                code.classList.remove(hideCodeStyle);
            }

            const render = (node: Node) => {
                const code = header + node.attrs.value;

                mermaid.mermaidAPI.render(node.attrs.identity, code, (svg) => {
                    rendered.innerHTML = svg;
                    dom.append(rendered);
                });
            };

            render(node);

            dom.addEventListener('mousedown', (e) => {
                if (node.attrs.editing) return;
                e.preventDefault();
                e.stopPropagation();
                const { tr } = view.state;
                const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                    ...node.attrs,
                    editing: true,
                });
                view.dispatch(_tr);
            });

            return {
                dom,
                contentDOM: code,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    if (!updatedNode.attrs.editing) {
                        code.classList.add(hideCodeStyle);
                    } else {
                        code.classList.remove(hideCodeStyle);
                    }

                    const newVal = updatedNode.content.firstChild?.text || '';

                    code.dataset.value = newVal;
                    dom.dataset.editing = updatedNode.attrs.editing.toString();
                    updatedNode.attrs.value = newVal;
                    render(updatedNode);

                    return true;
                },
                selectNode() {
                    if (!view.editable) return;
                },
                deselectNode() {
                    code.classList.add(hideCodeStyle);
                    const { tr } = view.state;
                    const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                        ...node.attrs,
                        editing: false,
                    });
                    view.dispatch(_tr);
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
