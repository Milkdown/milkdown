import type { Ref } from 'vue'

type ProxyDomURL = (url: string) => Promise<string> | string

// Return a function that sets `src` to the URL to show for a node src.
// It calls the proxy again only when the node src changes.
export function createSrcBinder(
  src: Ref<string>,
  proxyDomURL?: ProxyDomURL
): (nodeSrc: string) => void {
  let requestedSrc: string | undefined

  return (nodeSrc) => {
    if (!proxyDomURL) {
      src.value = nodeSrc
      return
    }
    if (nodeSrc === requestedSrc) return

    requestedSrc = nodeSrc
    const proxiedURL = proxyDomURL(nodeSrc)
    if (typeof proxiedURL === 'string') {
      src.value = proxiedURL
      return
    }

    // A Promise can settle after the node src changes again. Drop that
    // stale answer.
    proxiedURL
      .then((url) => {
        if (requestedSrc === nodeSrc) src.value = url
      })
      .catch((error) => {
        console.error(error)
        // Do not keep the URL of an older src on screen.
        if (requestedSrc === nodeSrc) src.value = nodeSrc
      })
  }
}
