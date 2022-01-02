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

test.describe.parallel('transform:', () => {
    test.describe.parallel('node:', () => {
        test('paragraph', async ({ page, setFixture, getMd }) => {
            await setFixture('paragraph');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
            expect((await getMd()).trim()).toMatchSnapshot('paragraph.md');
        });

        test('heading', async ({ page, setFixture, getMd }) => {
            await setFixture('heading');
            const editor = await page.waitForSelector('.editor');

            expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();
            expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
            expect((await getMd()).trim()).toMatchSnapshot('heading.md');
        });

        test('blockquote', async ({ page, setFixture, getMd }) => {
            await setFixture('quote');

            const editor = await page.waitForSelector('.editor');
            const blockquote = await editor.waitForSelector('.blockquote');

            expect(await blockquote.$$('p')).toHaveLength(2);
            expect(await blockquote.waitForSelector('p:first-child >> text=Blockquote. First line.')).toBeTruthy();

            expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
            expect((await getMd()).trim()).toMatchSnapshot('blockquote.md');
        });

        test('bullet list', async ({ page, setFixture, getMd }) => {
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

            expect(
                await list.waitForSelector(':nth-match(.list-item, 4) >> text=list content for item 2'),
            ).toBeTruthy();

            expect((await getMd()).trim()).toMatchSnapshot('bulletList.md');
        });

        test('ordered list', async ({ page, setFixture, getMd }) => {
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

            expect(
                await list.waitForSelector(':nth-match(.list-item, 4) >> text=list content for item 2'),
            ).toBeTruthy();

            expect((await getMd()).trim()).toMatchSnapshot('orderedList.md');
        });

        test('hr', async ({ page, setFixture }) => {
            await setFixture('hr');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.hr')).toBeDefined();
        });

        test('image', async ({ page, setFixture }) => {
            await setFixture('image');
            const editor = await page.waitForSelector('.editor');
            const image = await editor.waitForSelector('.image');
            expect(image).toBeDefined();

            expect(await image.$eval('img', (img) => img.src)).toContain('url');
            expect(await image.$eval('img', (img) => img.title)).toBe('title');
            expect(await image.$eval('img', (img) => img.alt)).toBe('image');
        });

        test('code block', async ({ page, setFixture }) => {
            await setFixture('codeFence');
            const editor = await page.waitForSelector('.editor');
            const fence = await editor.waitForSelector('.code-fence');
            expect(fence).toBeDefined();
            expect(await fence.getAttribute('data-language')).toBe('javascript');
        });

        test('hardbreak', async ({ page, setFixture }) => {
            await setFixture('hardbreak');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.$$('.hardbreak')).toHaveLength(2);
        });
    });

    test.describe.parallel('mark:', () => {
        test('bold', async ({ page, setFixture }) => {
            await setFixture('bold');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.strong >> text=bold test')).toBeTruthy();
        });

        test('em', async ({ page, setFixture }) => {
            await setFixture('em');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.em >> text=em test')).toBeTruthy();
        });

        test('bold with em', async ({ page, setFixture }) => {
            await setFixture('boldWithEm');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.em >> text=bold with em test')).toBeTruthy();
            expect(await editor.waitForSelector('.strong >> text=bold with em test')).toBeTruthy();
        });

        test('code with em', async ({ page, setFixture }) => {
            await setFixture('codeWithEm');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.code-inline >> text=*code with em test*')).toBeTruthy();
        });

        test('inline code', async ({ page, setFixture }) => {
            await setFixture('inlineCode');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.code-inline >> text=inline code test')).toBeTruthy();
        });

        test('link', async ({ page, setFixture }) => {
            await setFixture('link');
            const editor = await page.waitForSelector('.editor');
            expect(await editor.waitForSelector('.link >> text=link test')).toBeTruthy();

            const link = await editor.waitForSelector('.link');
            expect(await link.getAttribute('href')).toBe('url');
        });
    });
});
