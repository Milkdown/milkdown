import { prosePluginFactory } from '@milkdown/core';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';

type DropOptions = Parameters<typeof dropCursor>[0];

export const cursor = (options?: { drop: DropOptions }) =>
    prosePluginFactory([gapCursor(), dropCursor(options?.drop || { color: 'rgba(var(--secondary), 1)' })]);
