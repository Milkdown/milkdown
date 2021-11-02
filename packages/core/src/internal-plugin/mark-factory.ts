/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/ctx';
import type { MarkSpec } from '@milkdown/prose';

import type { MarkParserSpec } from '../parser';
import type { MarkSerializerSpec } from '../serializer';

export type MarkSchema = {
    readonly id: string;
    readonly toMarkdown: MarkSerializerSpec;
    readonly parseMarkdown: MarkParserSpec;
} & Readonly<MarkSpec>;
export const marksCtx = createSlice<MarkSchema[]>([], 'marks');
