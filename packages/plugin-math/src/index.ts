import { mathBackspaceCmd, mathPlugin } from '@benrbray/prosemirror-math';
import { createProsemirrorPlugin, createRemarkPlugin } from '@milkdown/core';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import remarkMath from 'remark-math';
import { nodes } from './nodes';

const keys = keymap({
    Backspace: chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
});

export const math = [
    ...nodes,
    createProsemirrorPlugin('mathProsemirrorPlugin', () => [mathPlugin, keys]),
    createRemarkPlugin('mathRemarkPlugin', () => [remarkMath]),
];
