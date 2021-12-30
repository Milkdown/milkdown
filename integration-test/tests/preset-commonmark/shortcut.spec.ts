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

test.describe('shortcuts:', () => {
    test.describe.parallel('system:', () => {
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

    test.describe.parallel('node:', () => {
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
