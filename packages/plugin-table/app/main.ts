/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { table } from '../src';

const markdown = `
# Milkdown Test

| First Header  | Second Header     |
| ------------- | :---------------: |
| Content Cell  | \`Content\` Cell  |
|               | __Content__ Cell  |
`;

const root = document.getElementById('app');

if (!root) throw new Error();

Editor.make()
    .config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            root,
            defaultValue: markdown,
        }));
    })
    .use(nodes)
    .use(marks)
    .use(table)
    .create();
