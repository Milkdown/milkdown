/* Copyright 2021, Milkdown by Mirone. */
import { $node, $remark } from '@milkdown/utils';
import { Literal, Node } from 'unist';
import { visit } from 'unist-util-visit';

const regex = /!CodeSandBox\{[^\s]+\}/g;

const replaceLineBreak = $remark(() => () => {
    function transformer(tree: Node) {
        visit(tree, 'text', (node: Literal) => {
            const value = node.value as string;
            node.value = value.replace(/\n{1}/g, ' ');
        });
    }
    return transformer;
});

const remarkIframePlugin = $remark(() => () => {
    function transformer(tree: Node) {
        visit(tree, 'text', (node: Literal) => {
            const value = node.value as string;
            if (regex.test(value)) {
                const [url] = value.match(/\{[^\s]+\}/) || [];
                if (url) {
                    node.type = 'CodeSandBox';
                    node.value = url.slice(1, -1);
                }
            }
        });
    }
    return transformer;
});

const id = 'codeSandBox';
const codeSandBoxNode = $node(id, () => ({
    attrs: {
        src: { default: '' },
    },
    group: 'inline',
    inline: true,
    marks: '',
    atom: true,
    parseDOM: [
        {
            tag: 'iframe',
            getAttrs: (dom) => {
                if (!(dom instanceof HTMLElement)) {
                    throw new Error();
                }
                return {
                    src: dom.getAttribute('src'),
                };
            },
        },
    ],
    toDOM: (node) => [
        'iframe',
        {
            src: `https://codesandbox.io/embed/${node.attrs.src}`,
            style: 'width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;',
            class: 'milkdown-iframe',
            allow: 'accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking',
            sandbox: 'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts',
        },
        0,
    ],
    parseMarkdown: {
        match: (node) => {
            return node.type === 'CodeSandBox';
        },
        runner: (state, node, type) => {
            state.addNode(type, { src: node.value as string });
        },
    },
    toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('CodeSandBox', undefined, node.attrs.src);
        },
    },
}));

export const codeSandBox = [codeSandBoxNode, replaceLineBreak, remarkIframePlugin];
