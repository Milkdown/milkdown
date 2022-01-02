/* Copyright 2021, Milkdown by Mirone. */
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/#/preset-gfm');
});

test('has editor', async ({ page }) => {
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test.describe.parallel('shortcut:', () => {
    test.describe.parallel('node:', () => {
        test('task list', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Control+Alt+9');
            expect(await editor.waitForSelector('.task-list-item')).toBeDefined();
            await editor.press('Enter');
            await editor.type('The lunatic is on the grass');
            await editor.press('Control+]');
            expect(await editor.$$('.bullet-list')).toHaveLength(2);
            await editor.press('Control+[');
            expect(await editor.$$('.bullet-list')).toHaveLength(1);
        });
    });

    test.describe.parallel('mark:', () => {
        test('strike through', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('The lunatic is on the grass');
            await editor.press('Control+A');
            await editor.press('Control+Alt+x');
            expect(await editor.waitForSelector('.strike-through >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Control+Alt+x');

            await editor.type('The lunatic is ');
            await editor.press('Control+Alt+x');
            await editor.type('on the grass');
            await editor.press('Control+Alt+x');
            await editor.type('!');
            expect(await editor.waitForSelector('.strike-through >> text=on the grass')).toBeTruthy();
        });
    });
});
