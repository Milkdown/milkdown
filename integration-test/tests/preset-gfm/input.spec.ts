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

test.describe.parallel('input:', () => {
    test.describe.parallel('node:', () => {
        test('task list', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');
            await editor.type('[ ] The lunatic is on the grass');
            expect(await editor.waitForSelector('.task-list-item >> text=The lunatic is on the grass')).toBeTruthy();
            await editor.press('Enter');
            await editor.type('The lunatic is in the hell');
            expect(await editor.$$('.task-list-item')).toHaveLength(2);
        });
    });

    test.describe.parallel('mark:', () => {
        test('strike through', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is ~~strike through test~~!');
            expect(await editor.waitForSelector('.strike-through >> text=strike through test')).toBeTruthy();
        });

        test('auto link', async ({ page }) => {
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is https://www.milkdown.dev');

            const link = await editor.waitForSelector('.link');
            expect(link).toBeDefined();
            expect(await link.getAttribute('href')).toBe('https://www.milkdown.dev');
        });
    });
});
