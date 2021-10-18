/* Copyright 2021, Milkdown by Mirone. */
import { getAtomFromSchemaFail } from '@milkdown/exception';
import type { MarkType, NodeType, Schema } from 'prosemirror-model';

export const getNodeFromSchema = (type: string, schema: Schema): NodeType => {
    const target = schema.nodes[type];

    if (!target) {
        throw getAtomFromSchemaFail('node', type);
    }

    return target;
};

export const getMarkFromSchema = (type: string, schema: Schema): MarkType => {
    const target = schema.marks[type];

    if (!target) {
        throw getAtomFromSchemaFail('mark', type);
    }

    return target;
};
