import twemoji from 'twemoji'

const setAttr = (text: string) => ({ title: text })

/// @internal
/// This is copied from https://github.com/twitter/twemoji/blob/master/index.d.ts#L14
/// The file is not released for some reason, so I have to copy it here.
export interface TwemojiOptions {
  /**
   * Default: Cloudflare
   */
  base?: string
  /**
   * Default: .png
   */
  ext?: string
  /**
   * Default: emoji
   */
  className?: string
  /**
   * Default: 72x72
   */
  size?: string | number
  /**
   * To render with SVG use `folder: svg, ext: .svg`
   */
  folder?: string
  /**
   * The function to invoke in order to generate image src(s).
   */
  callback?: (icon: string, options: object, variant: string) => string | false
  /**
   * The function to invoke in order to generate additional, custom attributes for the image tag.
   * Default () => ({})
   * @param icon the lower case HEX code point i.e. "1f4a9"
   * @param variant variant the optional \uFE0F ("as image") variant, in case this info is anyhow meaningful. By default this is ignored.
   *
   */
  attributes?: (icon: string, variant: string) => object
}

export function parse(emoji: string, twemojiOptions?: TwemojiOptions): string {
  return twemoji.parse(emoji, {
    attributes: setAttr,
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/',
    ...twemojiOptions,
  }) as unknown as string
}
