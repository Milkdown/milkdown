/* Copyright 2021, Milkdown by Mirone. */
import type { Mark as ProseMark, Node as ProseNode, Schema } from '@milkdown/prose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InnerSerializerSpecMap } from '..';
import { createMockMarkType, createMockNodeType } from '../parser/stack.spec';
import { RemarkParser } from '../utility';
import type { Stack } from './stack';
import { State } from './state';

class MockStack implements Stack {
    build = vi.fn();

    openMark = vi.fn();

    closeMark = vi.fn();

    openNode = vi.fn();

    addNode = vi.fn();

    closeNode = vi.fn();

    top = vi.fn();
}

const stack = new MockStack();
const schema = { nodes: {}, marks: {}, text: vi.fn() } as unknown as Schema;
const textRunner = vi.fn();
const boldRunner = vi.fn();
const italicRunner = vi.fn();
const specMap: InnerSerializerSpecMap = {
    text: {
        match: (n: ProseNode) => n.type.name === 'text',
        runner: textRunner,
    },
    bold: {
        match: (n: ProseMark) => n.type.name === 'bold',
        runner: boldRunner,
    },
    italic: {
        match: (n: ProseMark) => n.type.name === 'italic',
        runner: italicRunner,
    },
};

const textType = createMockNodeType('text');
const boldType = createMockMarkType('bold');
const italicType = createMockMarkType('italic');

describe('serializer/state', () => {
    let state: State;
    beforeEach(() => {
        state = new State(stack, schema, specMap);
    });

    it('run', () => {
        vi.spyOn(state, 'next');
        const text = textType.create();
        state.run(text);

        expect(state.next).toHaveBeenCalledWith(text);
    });

    it('toString', () => {
        const stringify = vi.fn();
        state.toString({ stringify } as unknown as RemarkParser);
        expect(stack.build).toBeCalledTimes(1);
        expect(stringify).toBeCalledTimes(1);
    });

    it('next', () => {
        const text = textType.create();
        const strong = boldType.create();
        const italic = italicType.create();
        text.marks = [strong, italic];

        textRunner.mockClear();
        state.next(text);
        expect(boldRunner).toBeCalledTimes(1);
        expect(italicRunner).toBeCalledTimes(1);
        expect(textRunner).toBeCalledTimes(1);
    });

    it('addNode', () => {
        state.addNode('node');
        expect(stack.addNode).toBeCalledWith('node');
    });

    it('openNode', () => {
        state.openNode('node');
        expect(stack.openNode).toBeCalledWith('node');
    });

    it('closeNode', () => {
        state.closeNode();
        expect(stack.closeNode).toBeCalledWith();
    });

    it('withMark', () => {
        const bold = boldType.create();
        state.withMark(bold, 'bold');
        expect(stack.openMark).toBeCalledWith(bold, 'bold');
    });
});
