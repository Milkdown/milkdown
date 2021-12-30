/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest';

import { createElement } from './stack-element';

describe('serializer/stack-element', () => {
    it('create an element', () => {
        const el1 = createElement('root');
        expect(el1.type).toBe('root');

        const el2 = createElement('text', [el1], 'value', {
            foo: 'bar',
        });
        expect(el2.type).toBe('text');
        expect(el2.children).toEqual([el1]);
        expect(el2.value).toBe('value');
        expect(el2.props.foo).toBe('bar');
    });

    it('push & pop element', () => {
        const el1 = createElement('root');
        const el2 = createElement('text');

        el1.push(el2);
        expect(el1.children).toHaveLength(1);
        expect(el1.pop()).toBe(el2);

        const el3 = createElement('text');
        const el4 = createElement('text');
        el1.push(el3, el4);
        expect(el1.children).toHaveLength(2);
        expect(el1.pop()).toBe(el4);
        expect(el1.children).toHaveLength(1);
        expect(el1.pop()).toBe(el3);
    });
});
