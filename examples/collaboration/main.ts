/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { collaborative, y } from '@milkdown/plugin-collaborative';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';

const markdown = `
# Milkdown Collaborative Example

---

Now you can play!
`;

const options = [
    { color: '#5e81AC', name: 'milkdown user 1' },
    { color: '#8FBCBB', name: 'milkdown user 2' },
    { color: '#dbfdbf', name: 'milkdown user 3' },
    { color: '#D08770', name: 'milkdown user 4' },
];
const rndInt = Math.floor(Math.random() * 4) + 1;

async function main() {
    const doc = new Doc();
    const wsProvider = new WebsocketProvider('ws://localhost:1234', 'milkdown', doc);
    wsProvider.awareness.setLocalStateField('user', options[rndInt]);
    return Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
            ctx.set(defaultValueCtx, markdown);
        })
        .use(nord)
        .use(commonmark)
        .use(
            collaborative.configure(y, {
                doc,
                awareness: wsProvider.awareness,
            }),
        )
        .create();
}

main();
