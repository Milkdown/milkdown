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

test.describe('input:', () => {
    test.describe('node:', () => {
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

    test.describe('mark:', () => {
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

test.describe('shortcuts:', () => {
    test.describe('system:', () => {
        test('press hard break', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('something');
            await editor.press('Shift+Enter');
            await editor.type('new line');
            await editor.press('Shift+Enter');
            expect(await editor.$$('.hardbreak')).toHaveLength(2);
        });

        test('enter', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Enter');
            await editor.type('The lunatic is in the hall');
            expect(
                await editor.waitForSelector(':nth-match(.paragraph, 2) >> text=The lunatic is in the hall'),
            ).toBeTruthy();
            await expect(page.locator('.editor > .paragraph')).toHaveCount(2);
        });

        test('delete', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Delete');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the gras')).toBeTruthy();
            await editor.press('Backspace');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the gra')).toBeTruthy();
        });

        test('select all', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Control+A');
            await editor.type('Lunatic');
            expect(await editor.waitForSelector('.paragraph >> text=Lunatic')).toBeTruthy();
        });

        test('copy and paste', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await expect(page.locator('.editor > .paragraph')).toHaveCount(1);
            await editor.press('Control+A');
            await editor.press('Control+C');
            await editor.press('ArrowRight');
            await editor.type('. ');
            await editor.press('Control+V');
            await editor.type('!');
            await expect(page.locator('.editor > .paragraph')).toHaveCount(1);
            expect(
                await editor.waitForSelector(
                    '.paragraph >> text=The lunatic is on the grass. The lunatic is on the grass!',
                ),
            ).toBeTruthy();

            await editor.press('Control+A');
            await editor.press('Control+X');
            await editor.type('Lyrics:');
            await editor.press('Enter');
            await editor.press('Control+V');
            await expect(page.locator('.editor > .paragraph')).toHaveCount(2);
            expect(
                await editor.waitForSelector(
                    ':nth-match(.paragraph, 2) >> text=The lunatic is on the grass. The lunatic is on the grass!',
                ),
            ).toBeTruthy();
        });
    });

    test.describe('node:', () => {
        test('heading', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Control+Alt+1');
            expect(await editor.waitForSelector('h1 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+2');
            expect(await editor.waitForSelector('h2 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+3');
            expect(await editor.waitForSelector('h3 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+4');
            expect(await editor.waitForSelector('h4 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+5');
            expect(await editor.waitForSelector('h5 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+6');
            expect(await editor.waitForSelector('h6 >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+0');
            expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
        });
    });
});

test.describe('transform:', () => {
    test('paragraph', async ({ page }) => {
        await page.evaluate(() => {
            window.__setMarkdown__('The lunatic is on the grass');
        });
        const editor = await page.waitForSelector('.editor');
        expect(await editor.waitForSelector('.paragraph >> text=The lunatic is on the grass')).toBeTruthy();
    });

    test('heading', async ({ page }) => {
        const markdown = `
# Heading1

## Heading2`;
        await page.evaluate(
            ({ markdown }) => {
                window.__setMarkdown__(markdown);
            },
            { markdown },
        );
        const editor = await page.waitForSelector('.editor');

        expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();
        expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
    });

    test('blockquote', async ({ page }) => {
        const markdown = `
> Blockquote.
> First line.
>
> Next line.
`;
        await page.evaluate(
            ({ markdown }) => {
                window.__setMarkdown__(markdown);
            },
            { markdown },
        );

        const editor = await page.waitForSelector('.editor');
        const blockquote = await editor.waitForSelector('.blockquote');

        expect(await blockquote.$$('p')).toHaveLength(2);
        expect(await blockquote.waitForSelector('p:first-child >> text=Blockquote. First line.')).toBeTruthy();

        expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
    });
});
