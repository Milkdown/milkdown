import type { Ref } from 'vue'

type ProxyDomURL = (url: string) => Promise<string> | string

// Return a function that sets `src` to the URL to show for a node src. The
// function returns false when the view must not take the node src.
//
// An img keeps its old picture until a new src loads. ProseMirror can also
// offer the view of an image to a new image inserted before it. So a view
// takes a new src only while its src is empty. A proxy answer thus always
// belongs to the src of the view.
export function createSrcBinder(
  src: Ref<string>,
  proxyDomURL?: ProxyDomURL
): (nodeSrc: string) => boolean {
  let boundSrc: string | undefined

  return (nodeSrc) => {
    if (nodeSrc === boundSrc) return true
    if (boundSrc) return false

    boundSrc = nodeSrc
    // An empty src has nothing to load. A late answer for it can also hide
    // the src that the view takes next.
    if (!proxyDomURL || !nodeSrc) {
      src.value = nodeSrc
      return true
    }

    const proxiedURL = proxyDomURL(nodeSrc)
    if (typeof proxiedURL === 'string') {
      src.value = proxiedURL
      return true
    }

    proxiedURL
      .then((url) => {
        src.value = url
      })
      .catch((error) => {
        console.error(error)
        src.value = nodeSrc
      })
    return true
  }
}
