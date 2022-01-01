/* Copyright 2021, Milkdown by Mirone. */

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/#/preset-commonmark');
});

test('has editor', async ({ page }) => {
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test.describe.parallel('input:', () => {
    test.describe.parallel('node:', () => {
        test('paragraph', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
        });

        test('heading', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('# Heading1');
            expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('## Heading2');
            expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
        });

        test('blockquote ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('> Blockquote');
            const blockquote = await page.waitForSelector('.blockquote');

            expect(await blockquote.$$('p')).toHaveLength(1);
            expect(await blockquote.waitForSelector('p >> text=Blockquote')).toBeTruthy();

            await editor.type('\n');

            await editor.type('Next line.');

            expect(await blockquote.$$('p')).toHaveLength(2);
            expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
        });

        test('bullet list ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('* list item 1');
            const list = await page.waitForSelector('.bullet-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('ordered list ', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('1. list item 1');
            const list = await page.waitForSelector('.ordered-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('hr', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('---');
            expect(await editor.waitForSelector('.hr')).toBeDefined();
        });

        test('image', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('![image](url)');
            const image = await editor.waitForSelector('.image');
            expect(image).toBeDefined();
        });

        test('image with title', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('![image](url "title")');
            const image = await editor.waitForSelector('.image');
            expect(image).toBeDefined();
        });

        test('code block', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('```markdown ');
            const fence = await editor.waitForSelector('.code-fence');
            expect(fence).toBeDefined();
            expect(await fence.getAttribute('data-language')).toBe('markdown');
        });
    });

    test.describe.parallel('mark:', () => {
        test('bold', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is **bold test**!');
            expect(await editor.waitForSelector('.strong >> text=bold test')).toBeTruthy();
        });

        test('em', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is *em test*!');
            expect(await editor.waitForSelector('.em >> text=em test')).toBeTruthy();
        });

        test('bold + em', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is ***bold with em test***!');
            expect(await editor.waitForSelector('.em >> text=bold with em test')).toBeTruthy();
            expect(await editor.waitForSelector('.strong >> text=bold with em test')).toBeTruthy();
        });

        test('code + em', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is `*code with em test*`!');
            expect(await editor.waitForSelector('.code-inline >> text=code with em test')).toBeTruthy();
        });

        test('inline code', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is `code test`!');
            expect(await editor.waitForSelector('.code-inline >> text=code test')).toBeTruthy();
        });

        test('link', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is [link test](url)!');
            expect(await editor.waitForSelector('.link >> text=link test')).toBeTruthy();

            const link = await editor.waitForSelector('.link');
            expect(await link.getAttribute('href')).toBe('url');
        });
    });
});
