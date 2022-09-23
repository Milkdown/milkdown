/* Copyright 2021, Milkdown by Mirone. */
import { $node } from '@milkdown/utils';

const id = 'StackBlitz';
export const stackBlitzNode = $node(id, () => ({
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
            src: `https://stackblitz.com/edit/${node.attrs['src']}?embed=1&view=preview`,
            style: 'width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;',
            class: 'milkdown-iframe',
            allow: 'accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking',
            sandbox: 'allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts',
        },
        0,
    ],
    parseMarkdown: {
        match: (node) => node.type === id,
        runner: (state, node, type) => {
            state.addNode(type, { src: node['value'] as string });
        },
    },
    toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode(id, undefined, node.attrs['src']);
        },
    },
}));
