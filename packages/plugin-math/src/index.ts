import { mathBackspaceCmd, mathPlugin } from '@benrbray/prosemirror-math';
import { prosePluginFactory, remarkPluginFactory } from '@milkdown/core';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import remarkMath from 'remark-math';

import { nodes } from './nodes';

const keys = keymap({
    Backspace: chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
});

export const math = [remarkPluginFactory(remarkMath), prosePluginFactory([mathPlugin, keys]), ...nodes];
