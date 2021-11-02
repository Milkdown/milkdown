/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/ctx';
import type { NodeSpec } from '@milkdown/prose';

import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';

export type NodeSchema = {
    readonly id: string;
    readonly toMarkdown: NodeSerializerSpec;
    readonly parseMarkdown: NodeParserSpec;
} & Readonly<NodeSpec>;

export const nodesCtx = createSlice<NodeSchema[]>([], 'nodes');
