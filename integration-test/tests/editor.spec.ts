import { test, expect } from '@playwright/test';

test('url redirect', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const url = page.url();
    expect(url).toBe('http://localhost:3000/milkdown/#/');
});

test('has editor', async ({ page }) => {
    await page.goto('http://localhost:3000/milkdown/#/online-demo');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');

    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('editor-overview.png');
});
