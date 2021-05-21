import { mathBackspaceCmd, mathPlugin } from '@benrbray/prosemirror-math';
import { createMarkdownItPlugin, createProsemirrorPlugin } from '@milkdown/core';
import markdownItMath from '@traptitech/markdown-it-katex';
import type { PluginSimple } from 'markdown-it';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { nodes } from './nodes';

const keys = keymap({
    Backspace: chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
});

export const math = [
    ...nodes,
    createProsemirrorPlugin('mathProsemirrorPlugin', () => [mathPlugin, keys]),
    createMarkdownItPlugin('mathMarkdownItPlugin', () => [markdownItMath as PluginSimple]),
];
