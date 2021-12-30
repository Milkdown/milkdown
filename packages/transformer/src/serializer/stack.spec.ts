/* Copyright 2021, Milkdown by Mirone. */
import { beforeEach, describe, expect, it } from 'vitest';

import { createMockMarkType } from '../parser/stack.spec';
import { createStack, Stack } from './stack';

describe('serializer/stack', () => {
    let stack: Stack;

    beforeEach(() => {
        stack = createStack();
    });

    it('add node', () => {
        stack.openNode('test');

        expect(stack.closeNode().type).toBe('test');

        stack.openNode('test', 'value');
        const node1 = stack.closeNode();
        expect(node1.type).toBe('test');
        expect(node1.value).toBe('value');

        stack.openNode('test', undefined, { foo: 'bar' });
        const node2 = stack.closeNode();
        expect(node2.type).toBe('test');
        expect(node2.foo).toBe('bar');

        stack.openNode('test');
        stack.addNode('text');
        const node3 = stack.closeNode();
        expect(node3.type).toBe('test');
        expect(node3.children).toHaveLength(1);
        expect(node3.children?.[0].type).toBe('text');
    });

    it('add mark', () => {
        const strongMark = createMockMarkType('strong').create();
        const italicMark = createMockMarkType('italic').create();

        stack.openMark(strongMark, 'strong');
        expect(stack.closeMark(strongMark)?.type).toBe('strong');

        stack.openMark(strongMark, 'strong');
        stack.openMark(strongMark, 'strong');
        expect(stack.closeMark(strongMark)?.type).toBe('strong');
        expect(() => stack.closeMark(strongMark)).not.toThrow();

        stack.openMark(strongMark, 'strong');
        stack.openMark(italicMark, 'italic');
        expect(stack.closeMark(italicMark)?.type).toBe('italic');
        expect(stack.closeMark(strongMark)?.type).toBe('strong');
    });

    it('build', () => {
        stack.openNode('root');
        stack.openNode('paragraph');
        stack.addNode('text');

        expect(stack.build()).toEqual({
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [{ type: 'text' }],
                },
            ],
        });
    });
});
