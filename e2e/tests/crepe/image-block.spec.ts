import { expect, test, type Page } from '@playwright/test'

import { getMarkdown, setMarkdown } from '../misc'

// A 1000x800 red PNG is impractical as a data URL, so the route
// intercepts the image request and returns a generated PNG.
async function routeMockImage(
  page: Page,
  url: string,
  width: number,
  height: number
) {
  await page.route(url, async (route) => {
    // Generate a minimal valid PNG with the specified dimensions via canvas
    const body = await page.evaluate(
      ({ w, h }) => {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(0, 0, w, h)
        return canvas.toDataURL('image/png').split(',')[1]!
      },
      { w: width, h: height }
    )
    await route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(body, 'base64'),
    })
  })
}

const MOCK_IMAGE_URL = 'https://mock.test/image.png'
const IMAGE_SELECTOR = 'img[data-type="image-block"]'

test.describe('image block maxWidth', () => {
  test('constrains image width to maxWidth', async ({ page }) => {
    await page.addInitScript(() => {
      window.__imageBlockMaxWidth__ = 400
    })

    await routeMockImage(page, MOCK_IMAGE_URL, 1000, 800)
    await page.goto('/image-block/')

    await page.evaluate((url: string) => {
      window.__setMarkdown__(`![1.00](${url})`)
    }, MOCK_IMAGE_URL)

    const img = page.locator(IMAGE_SELECTOR)
    await img.waitFor({ state: 'attached' })
    await expect(img).toHaveCSS('max-width', '400px')
  })
})

test.describe('image block maxHeight', () => {
  test('constrains image height to maxHeight', async ({ page }) => {
    await page.addInitScript(() => {
      window.__imageBlockMaxHeight__ = 300
    })

    // Use a tall image: 400x800 (natural height > maxHeight)
    await routeMockImage(page, MOCK_IMAGE_URL, 400, 800)
    await page.goto('/image-block/')

    await page.evaluate((url: string) => {
      window.__setMarkdown__(`![1.00](${url})`)
    }, MOCK_IMAGE_URL)

    const img = page.locator(IMAGE_SELECTOR)
    await img.waitFor({ state: 'attached' })

    // Wait for the onImageLoad handler to set the height
    await expect(img).toHaveCSS('height', '300px', { timeout: 5000 })
  })
})

test.describe('image block maxWidth and maxHeight combined', () => {
  test('constrains both dimensions', async ({ page }) => {
    await page.addInitScript(() => {
      window.__imageBlockMaxWidth__ = 400
      window.__imageBlockMaxHeight__ = 200
    })

    // A 1000x800 image scaled to a 400px width gives a 320px height,
    // which the clamp then cuts to 200px.
    await routeMockImage(page, MOCK_IMAGE_URL, 1000, 800)
    await page.goto('/image-block/')

    await page.evaluate((url: string) => {
      window.__setMarkdown__(`![1.00](${url})`)
    }, MOCK_IMAGE_URL)

    const img = page.locator(IMAGE_SELECTOR)
    await img.waitFor({ state: 'attached' })

    await expect(img).toHaveCSS('max-width', '400px')
    await expect(img).toHaveCSS('height', '200px', { timeout: 5000 })
  })
})

test.describe('image block alt text', () => {
  test('keeps the alt text and writes the ratio after it on resize', async ({
    page,
  }) => {
    await routeMockImage(page, MOCK_IMAGE_URL, 400, 400)
    await page.goto('/image-block/')

    await setMarkdown(page, `![A red barn](${MOCK_IMAGE_URL})`)

    const img = page.locator(IMAGE_SELECTOR)
    await expect(img).toHaveCSS('height', '400px', { timeout: 5000 })
    await expect(img).toHaveAttribute('alt', 'A red barn')
    expect(await getMarkdown(page)).toBe(`![A red barn](${MOCK_IMAGE_URL})\n`)

    const imageBox = (await img.boundingBox())!
    await page.mouse.move(
      imageBox.x + imageBox.width / 2,
      imageBox.y + imageBox.height / 2
    )
    const handleBox = (await page
      .locator('.milkdown-image-block .image-resize-handle')
      .boundingBox())!
    const x = handleBox.x + handleBox.width / 2
    await page.mouse.move(x, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(x, imageBox.y + 300, { steps: 5 })
    await page.mouse.up()

    await expect(img).toHaveCSS('height', '300px')
    await expect(img).toHaveAttribute('alt', 'A red barn')
    expect(await getMarkdown(page)).toBe(
      `![A red barn|0.75](${MOCK_IMAGE_URL})\n`
    )
  })
})
