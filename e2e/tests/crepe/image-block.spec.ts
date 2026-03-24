import { expect, test, type Page } from '@playwright/test'

// A 1000x800 red PNG generated as a data URL is impractical,
// so we intercept the image request and return a generated PNG.
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

    // 1000x800 image: scaled to 400px width -> height would be 320px, then clamped to 200px
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
