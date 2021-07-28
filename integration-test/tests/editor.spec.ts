import { test, expect } from '@playwright/test';

test('has editor', async ({ page }) => {
    await page.goto('/preset-commonmark');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
    // expect(await editor.waitForSelector('.h1 >> text=Milkdown')).toBeTruthy();
});
