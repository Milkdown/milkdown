import { test, expect } from '@playwright/test';

test('has editor', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test('input markdown heading', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('# Heading1');
    expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();

    await editor.type('\n');

    await editor.type('## Heading2');
    expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
});
