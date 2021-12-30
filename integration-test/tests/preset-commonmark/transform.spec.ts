/* Copyright 2021, Milkdown by Mirone. */

import { expect } from '@playwright/test';

import { test } from './transform.fixtures';

test.beforeEach(async ({ page }) => {
    await page.goto('/#/preset-commonmark');
});

test('has editor', async ({ page }) => {
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test.describe('transform:', () => {
    test('paragraph', async ({ page, setFixture }) => {
        await setFixture('paragraph');
        const editor = await page.waitForSelector('.editor');
        expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
    });

    test('heading', async ({ page, setFixture }) => {
        await setFixture('heading');
        const editor = await page.waitForSelector('.editor');

        expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();
        expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
    });

    test('blockquote', async ({ page, setFixture }) => {
        await setFixture('quote');

        const editor = await page.waitForSelector('.editor');
        const blockquote = await editor.waitForSelector('.blockquote');

        expect(await blockquote.$$('p')).toHaveLength(2);
        expect(await blockquote.waitForSelector('p:first-child >> text=Blockquote. First line.')).toBeTruthy();

        expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
    });

    test('bullet list', async ({ page, setFixture }) => {
        await setFixture('bulletList');

        const editor = await page.waitForSelector('.editor');
        const list = await editor.waitForSelector('.bullet-list');

        const item1 = await list.$(':nth-match(.list-item, 1)');
        expect(await item1?.$$('.bullet-list')).toHaveLength(1);
        expect(await item1?.$$('p')).toHaveLength(3);

        const item2 = await list.$(':nth-match(.list-item, 4)');
        expect(await item2?.$$('p')).toHaveLength(2);

        const item3 = await list.$(':nth-match(.list-item, 5)');
        expect(await item3?.$$('p')).toHaveLength(1);

        expect(await list.$$('.list-item')).toHaveLength(5);
        expect(await list.waitForSelector(':nth-match(.list-item, 1) >> text=list item 1')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 2) >> text=sub list item 1')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 3) >> text=sub list item 2')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 4) >> text=list item 2')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 5) >> text=list item 3')).toBeTruthy();

        expect(await list.waitForSelector(':nth-match(.list-item, 4) >> text=list content for item 2')).toBeTruthy();
    });

    test('ordered list', async ({ page, setFixture }) => {
        await setFixture('orderedList');

        const editor = await page.waitForSelector('.editor');
        const list = await editor.waitForSelector('.ordered-list');

        const item1 = await list.$(':nth-match(.list-item, 1)');
        expect(await item1?.$$('.ordered-list')).toHaveLength(1);
        expect(await item1?.$$('p')).toHaveLength(3);

        const item2 = await list.$(':nth-match(.list-item, 4)');
        expect(await item2?.$$('p')).toHaveLength(2);

        const item3 = await list.$(':nth-match(.list-item, 5)');
        expect(await item3?.$$('p')).toHaveLength(1);

        expect(await list.$$('.list-item')).toHaveLength(5);
        expect(await list.waitForSelector(':nth-match(.list-item, 1) >> text=list item 1')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 2) >> text=sub list item 1')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 3) >> text=sub list item 2')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 4) >> text=list item 2')).toBeTruthy();
        expect(await list.waitForSelector(':nth-match(.list-item, 5) >> text=list item 3')).toBeTruthy();

        expect(await list.waitForSelector(':nth-match(.list-item, 4) >> text=list content for item 2')).toBeTruthy();
    });
});
