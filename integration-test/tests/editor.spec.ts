import { test, expect } from '@playwright/test';

const base = 'http://localhost:7000/';

test('has editor', async ({ page }) => {
    await page.goto(base);
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
    // expect(await editor.waitForSelector('.h1 >> text=Milkdown')).toBeTruthy();
});
