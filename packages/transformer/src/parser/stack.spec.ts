/* Copyright 2021, Milkdown by Mirone. */
import type { Fragment, Mark, MarkType, Node, NodeType, Schema } from '@milkdown/prose';
import { beforeEach, describe, expect, it } from 'vitest';

import { createStack, Stack } from './stack';
import type { Attrs } from './types';

export const createMockNodeType = (name: string) => {
    const mockNode = {
        type: {
            name,
            spec: {},
        },
    } as Node;

    return {
        createAndFill(attrs: Attrs, content?: Fragment, marks: Mark[] = []) {
            mockNode.attrs = attrs;
            mockNode.content = content as Fragment;
            mockNode.marks = marks;
            return { ...mockNode } as Node;
        },
        create() {
            mockNode.marks = [];
            return { ...mockNode } as Node;
        },
    } as NodeType;
};

export const createMockMarkType = (name: string) => {
    const mockMark = {
        type: {
            name,
            spec: {},
            removeFromSet: (marks: Mark[]) => {
                return marks.filter((m) => m.type.name !== name);
            },
        },
    } as Mark;
    return {
        create(attrs: Attrs) {
            mockMark.attrs = attrs;
            mockMark.addToSet = (marks: Mark[]) => {
                return marks.concat(mockMark as Mark);
            };
            mockMark.isInSet = (marks: Mark[]) => {
                return marks.findIndex((m) => m.type.name === name) >= 0;
            };

            return { ...mockMark } as Mark;
        },
    } as MarkType;
};

const textNodeType = createMockNodeType('text');
const rootNodeType = createMockNodeType('root');

const mockSchema = {
    text: (text: string, marks: Mark[]) => {
        const textNode = textNodeType.createAndFill({}, [], marks) as Node;
        textNode.isText = true;
        textNode.text = text;
        return textNode;
    },
} as Schema;

describe('parser/stack', () => {
    let stack: Stack;

    beforeEach(() => {
        stack = createStack(mockSchema);
        stack.openNode(rootNodeType);
    });

    it('add to top node', () => {
        const childNodeType = createMockNodeType('child');

        const childNode = stack.addNode(childNodeType);
        expect(childNode.type.name).toBe('child');

        const doc = stack.build();
        expect(doc.type.name).toEqual('root');
        expect(doc.content).toEqual([childNode]);
    });

    it('add a node', () => {
        const middleNodeType = createMockNodeType('middle');
        stack.openNode(middleNodeType);

        const childNodeType = createMockNodeType('child');
        const childNode = stack.addNode(childNodeType);

        const middleNode = stack.closeNode();
        expect(middleNode.content).toEqual([childNode]);

        const doc = stack.build();
        expect(doc.content).toEqual([middleNode]);
    });

    it('add a mark', () => {
        const childNodeType = createMockNodeType('child');
        stack.addNode(childNodeType);

        const strongMarkType = createMockMarkType('strong');
        stack.openMark(strongMarkType);
        stack.addText('foo');
        const doc = stack.build();

        const children: Node[] = doc.content as unknown as Node[];
        expect(children[0].type.name).toEqual('child');
        expect(children[1].type.name).toEqual('text');
        expect(children[1].text).toBe('foo');
        expect(children[1].marks[0].type.name).toEqual('strong');
    });

    it('add merged mark', () => {
        const childNodeType = createMockNodeType('child');
        stack.openNode(childNodeType);

        const strongMarkType = createMockMarkType('strong');
        stack.openMark(strongMarkType);
        stack.addText('foo');
        stack.addText('bar');
        const doc = stack.build();

        const firstChild: Node = (doc.content as unknown as Node[])[0];
        expect(firstChild.type.name).toEqual('child');
        const texts: Node[] = firstChild.content as unknown as Node[];

        expect(texts).toHaveLength(1);
        expect(texts[0].type.name).toEqual('text');
        expect(texts[0].text).toBe('foobar');
        expect(texts[0].marks[0].type.name).toEqual('strong');
    });
});
