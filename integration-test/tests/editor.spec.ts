import { test, expect } from '@playwright/test';

// const base = 'https://saul-mirone.github.io/milkdown/';
const base = 'http://localhost:3000/milkdown/';

test('url redirect', async ({ page }) => {
    await page.goto(base);
    const url = page.url();
    expect(url).toBe(base + '#/');
});

test('has editor', async ({ page }) => {
    await page.goto(base + '#/online-demo');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
    expect(await editor.waitForSelector('.h1 >> text=Milkdown')).toBeTruthy();
});
