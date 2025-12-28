import { expect, test } from '@playwright/test'

import { focusEditor } from '../misc'

const email = 'test@example.com'

test.beforeEach(async ({ page }) => {
  await page.goto('/plugin-automd/')
  await focusEditor(page)
})

test('auto link email', async ({ page }) => {
  await page.keyboard.type('test@example.c', { delay: 10 })
  await page.keyboard.press('o')
  await page.waitForTimeout(100)
  await page.keyboard.press('m')
  await page.waitForTimeout(100)

  const link = page.locator('a').first()
  await expect(link).toBeVisible()
  await expect(link).toHaveText(email)

  const href = await link.getAttribute('href')

  expect(href).toContain(email)
})

test('auto link email backspace', async ({ page }) => {
  await page.keyboard.type(email, { delay: 10 })
  await page.waitForTimeout(100)

  // Delete "om"
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')

  // Check intermediate state
  await page.waitForTimeout(100)
  const link = page.locator('a').first()
  const href = await link.getAttribute('href')
  expect(href).toContain('test@example.c') // Should match truncated text

  // Delete everything
  for (let i = 0; i < 'test@example.c'.length; i++) {
    await page.keyboard.press('Backspace')
  }

  // Type new email
  const newEmail = 'new@test.com'
  await page.keyboard.type(newEmail)
  await page.waitForTimeout(100)

  const linkNew = page.locator('a').first()
  await expect(linkNew).toHaveText(newEmail)
  const hrefNew = await linkNew.getAttribute('href')
  expect(hrefNew).toContain(newEmail)
})

test('phantom link check', async ({ page }) => {
  await page.keyboard.type(email, { delay: 5 })
  await page.waitForTimeout(50)

  // Delete everything
  for (const _ of email) {
    await page.keyboard.press('Backspace')
  }
  await page.waitForTimeout(50)

  // Type non-email text
  await page.keyboard.type('hello world')
  await page.waitForTimeout(50)

  // Should NOT be a link
  const link = page.locator('a').first()
  await expect(link).not.toBeVisible()
})

test('trailing space should not remove link', async ({ page }) => {
  await page.keyboard.type(email, { delay: 10 })
  await page.waitForTimeout(100)

  // Add a space
  await page.keyboard.press('Space')
  await page.waitForTimeout(100)

  const link = page.locator('a').first()
  // Link should still exist and point to the email
  await expect(link).toBeVisible()
  await expect(link).toHaveText(email + ' ')

  // Check href doesn't become broken or vanish
  const href = await link.getAttribute('href')
  expect(href).toContain(email)
})

test('trailing dot should be excluded', async ({ page }) => {
  // Type email ending with dot
  await page.keyboard.type('test@example.com.', { delay: 10 })
  await page.waitForTimeout(100)

  const link = page.locator('a').first()

  // Valid part 'test@example.com' should be linked
  await expect(link).toHaveText(email)

  const paragraph = page.locator('.editor p').last() // assuming it's in a paragraph
  await expect(paragraph).toHaveText(email + '.')

  const href = await link.getAttribute('href')
  expect(href).toContain(email)
  expect(href).not.toContain(email + '.')
})

test('backspace to dot', async ({ page }) => {
  await page.keyboard.type(email)
  await page.waitForTimeout(100)

  // Backspace 3 times to 'test@example.'
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')
  await page.waitForTimeout(100)

  // Type 'c' -> 'test@example.c'
  await page.keyboard.type('c')
  await page.waitForTimeout(100)

  const link = page.locator('a').first()
  await expect(link).toHaveText('test@example.c')

  const href = await link.getAttribute('href')
  expect(href).toBe('mailto:test@example.c')
})

test('typing after email', async ({ page }) => {
  await page.keyboard.type(email)
  await page.waitForTimeout(100)

  // Type space and text
  await page.keyboard.type(' hello')
  await page.waitForTimeout(100)

  const link = page.locator('a').first()
  await expect(link).toHaveText(email)

  const href = await link.getAttribute('href')
  expect(href).toBe('mailto:test@example.com')
})

test('leaking char check', async ({ page }) => {
  await page.keyboard.type(email)
  await page.waitForTimeout(100)

  // Delete '.com' (4 chars)
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Backspace')
  }
  await page.waitForTimeout(100)
  // Now 'test@example.com' -> 'test@example.'

  // "add spaces"
  await page.keyboard.type('    ')

  // "type again"
  await page.keyboard.type('hello')
  await page.waitForTimeout(100)

  const paragraph = page.locator('.editor p').last()
  const text = await paragraph.innerText()

  expect(text).not.toContain('<')
  expect(text).not.toContain('>')
  expect(text).toContain('test@example.')
  const linkCount = await page.locator('a').count()
  expect(linkCount).toBe(0)
})
