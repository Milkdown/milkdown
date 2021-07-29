import { test, expect } from '@playwright/test';

test('has editor', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test('input heading', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('# Heading1');
    expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();

    await editor.type('\n');

    await editor.type('## Heading2');
    expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
});

test('input blockquote ', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
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

test('input bullet list ', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
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

test('input ordered list ', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
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

test('input hr', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('---');
    expect(await editor.waitForSelector('.hr')).toBeDefined();
});

test('input image', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('![image](url)');
    const image = await editor.waitForSelector('.image');
    expect(image).toBeDefined();
    expect(await image.getAttribute('src')).toBe('url');
});

test('input bold', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('here is **bold test**!');
    expect(await editor.waitForSelector('.strong >> text=bold test')).toBeTruthy();
});

test('input em', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('here is *em test*!');
    expect(await editor.waitForSelector('.em >> text=em test')).toBeTruthy();
});

test('input link', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');

    await editor.type('here is [link test](url)!');
    expect(await editor.waitForSelector('.link >> text=link test')).toBeTruthy();

    const link = await editor.waitForSelector('.link');
    expect(await link.getAttribute('href')).toBe('url');
});
