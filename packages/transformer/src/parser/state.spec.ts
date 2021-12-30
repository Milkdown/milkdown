/* Copyright 2021, Milkdown by Mirone. */
import type { NodeType, Schema } from '@milkdown/prose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RemarkParser } from '../utility';
import type { Stack } from './stack';
import { State } from './state';
import { InnerParserSpecMap } from './types';

class MockStack implements Stack {
    build = vi.fn();

    openMark = vi.fn();

    closeMark = vi.fn();

    addText = vi.fn();

    openNode = vi.fn();

    addNode = vi.fn();

    closeNode = vi.fn();
}

const stack = new MockStack();
const schema = { nodes: {}, marks: {}, text: vi.fn() } as unknown as Schema;
const textRunner = vi.fn();
const boldRunner = vi.fn();
const specMap: InnerParserSpecMap = {
    text: {
        key: 'text',
        is: 'node',
        match: (n) => n.type === 'text',
        runner: textRunner,
    },
    bold: {
        key: 'bold',
        is: 'mark',
        match: (n) => n.type === 'bold',
        runner: boldRunner,
    },
};

describe('parser/state', () => {
    let state: State;
    beforeEach(() => {
        state = new State(stack, schema, specMap);
    });

    it('run', async () => {
        vi.spyOn(state, 'next');
        const result: unknown[] = [];
        const parse = vi.fn(() => result);
        const runSync = vi.fn(() => result);
        const mockRemark = { parse, runSync } as unknown as RemarkParser;
        state.run(mockRemark, 'markdown');

        expect(parse).toHaveBeenCalledWith('markdown');
        expect(state.next).toHaveBeenCalledWith(result);
    });

    it('next', () => {
        const textNode = { type: 'text' };
        const boldNode = { type: 'bold' };
        const errorNode = { type: 'error' };

        state.next(textNode);

        expect(textRunner).toBeCalledTimes(1);
        expect(boldRunner).toBeCalledTimes(0);

        state.next([textNode, boldNode]);
        expect(textRunner).toBeCalledTimes(2);
        expect(boldRunner).toBeCalledTimes(1);

        expect(() => state.next(errorNode)).toThrow();
    });

    it('injectRoot', () => {
        vi.spyOn(state, 'next');
        const children = [] as never[];
        const textNode = { type: 'text', children };
        const mockNodeType = {} as NodeType;
        const mockAttr = {};
        state.injectRoot(textNode, mockNodeType, mockAttr);

        expect(stack.openNode).toBeCalledWith(mockNodeType, mockAttr);
        expect(state.next).toBeCalledWith(children);
    });

    it('addText', () => {
        state.addText();
        expect(stack.addText).toBeCalledTimes(1);

        state.addText('foo');
        expect(stack.addText).toBeCalledTimes(2);
    });

    it('addNode', () => {
        const xs = [null, null, null] as [never, never, never];
        state.addNode(...xs);

        expect(stack.addNode).toBeCalledWith(...xs);
    });

    it('openNode', () => {
        const xs = [null, null] as [never, never];
        state.openNode(...xs);

        expect(stack.openNode).toBeCalledWith(...xs);
    });

    it('closeNode', () => {
        state.closeNode();

        expect(stack.closeNode).toBeCalledWith();
    });

    it('openMark', () => {
        const xs = [null, null] as [never, never];
        state.openMark(...xs);

        expect(stack.openMark).toBeCalledWith(...xs);
    });

    it('closeMark', () => {
        state.closeMark(null as never);

        expect(stack.closeMark).toBeCalledWith(null);
    });

    it('toDoc', () => {
        state.toDoc();

        expect(stack.build).toBeCalledTimes(1);
    });
});
