/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest';

import { createMockNodeType } from './stack.spec';
import { createElement } from './stack-element';

const textNodeType = createMockNodeType('text');

describe('parser/stack-element', () => {
    it('create an element', () => {
        const el1 = createElement(textNodeType, []);
        expect(el1.type).toBe(textNodeType);
        expect(el1.content).toEqual([]);
        expect(el1.attrs).toBeUndefined();

        const content = [textNodeType.create(), textNodeType.create()];
        const el2 = createElement(textNodeType, content, { foo: 'bar' });
        expect(el2.type).toBe(textNodeType);
        expect(el2.content).toBe(content);
        expect(el2.attrs).toEqual({ foo: 'bar' });
    });

    it('push & pop element', () => {
        const el1 = createElement(textNodeType, []);

        const text1 = textNodeType.create();
        el1.push(text1);
        expect(el1.content[0]).toBe(text1);

        const text2 = textNodeType.create();
        const text3 = textNodeType.create();
        el1.push(text2, text3);

        expect(el1.content).toEqual([text1, text2, text3]);

        expect(el1.pop()).toBe(text3);
        expect(el1.content).toEqual([text1, text2]);
    });
});
