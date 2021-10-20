/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType, NodeType, Schema } from '@milkdown/prose';

export const getAtom = (id: string, schema: Schema, isNode: boolean) =>
    schema[isNode ? 'nodes' : 'marks'][id] as (NodeType & MarkType) | undefined;
