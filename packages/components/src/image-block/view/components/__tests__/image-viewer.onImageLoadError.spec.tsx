import { render } from '@testing-library/vue'
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { ImageViewer } from '../image-viewer'

test('calls onImageLoadError when img fires error', async () => {
  const onImageLoadError = vi.fn()
  const config = {
    onImageLoadError,
    captionIcon: '💬',
    captionPlaceholderText: 'Image caption',
    imageIcon: '🖼️',
    uploadButton: 'Upload',
    confirmButton: 'Confirm',
    uploadPlaceholderText: 'or paste an image URL',
    onUpload: async () => 'https://example.com/photo.png',
  }

  // render the ImageViewer component
  const { container } = render(ImageViewer, {
    props: {
      src: ref('https://example.com/photo.png'),
      caption: ref(''),
      ratio: ref(1),
      selected: ref(false),
      readonly: ref(false),
      setAttr: () => {},
      config,
    },
  })

  const img = container.querySelector('img[data-type="image-block"]')
  expect(img).toBeTruthy()

  // simulate the image load error
  img!.dispatchEvent(new Event('error'))

  expect(onImageLoadError).toHaveBeenCalledTimes(1)
  expect(onImageLoadError).toHaveBeenCalledWith(expect.any(Event))
})
