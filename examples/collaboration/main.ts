/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { collaborative, collabServiceCtx } from '@milkdown/plugin-collaborative';
import { math } from '@milkdown/plugin-math';
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
const rndInt = Math.floor(Math.random() * 4);

const status$ = document.getElementById('status');
const connect$ = document.getElementById('connect');
const disconnect$ = document.getElementById('disconnect');

const autoConnect = true;

async function main() {
    const editor = await Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
            ctx.set(defaultValueCtx, markdown);
        })
        .use(nord)
        .use(commonmark)
        .use(math)
        .use(collaborative)
        .create();

    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);
        const doc = new Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', 'milkdown', doc, { connect: autoConnect });
        wsProvider.awareness.setLocalStateField('user', options[rndInt]);
        wsProvider.on('status', (payload: { status: string }) => {
            if (status$) {
                status$.innerText = payload.status;
            }
        });

        collabService.bindDoc(doc).setAwareness(wsProvider.awareness);

        wsProvider.once('synced', async (isSynced: boolean) => {
            if (isSynced) {
                collabService.applyTemplate(markdown).connect();
            }
        });

        if (connect$) {
            connect$.onclick = () => {
                wsProvider.connect();
                collabService.connect();
            };
        }

        if (disconnect$) {
            disconnect$.onclick = () => {
                wsProvider.disconnect();
                collabService.disconnect();
            };
        }
    });

    return editor;
}

main();
