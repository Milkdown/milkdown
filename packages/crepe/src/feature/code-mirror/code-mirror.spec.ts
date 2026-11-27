import postcss from 'postcss'
import nested from 'postcss-nested'
import { describe, expect, it } from 'vitest'

describe('code-mirror theme CSS', () => {
  it('uses zero-specificity :where() fallback backgrounds so CodeMirror themes like oneDark win', async () => {
    const fsSpecifier = 'node:fs'
    const pathSpecifier = 'node:path'
    const urlSpecifier = 'node:url'
    const { existsSync, readFileSync } = await import(fsSpecifier)
    const { resolve } = await import(pathSpecifier)
    const { fileURLToPath } = await import(urlSpecifier)
    const cssUrl = new URL(
      '../../theme/common/code-mirror.css',
      import.meta.url
    )
    const cssPath = [
      cssUrl.protocol === 'file:' ? fileURLToPath(cssUrl) : '',
      resolve(cssUrl.pathname.replace(/^\/+/, '')),
      resolve('packages/crepe', cssUrl.pathname.replace(/^\/+/, '')),
    ].find((candidate) => candidate && existsSync(candidate))

    expect(cssPath).toBeTruthy()
    const source = readFileSync(cssPath!, 'utf8')
    const result = await postcss([nested]).process(source, {
      from: undefined,
    })

    const backgroundSelectors: string[] = []
    result.root.walkDecls(/^background(-color)?$/, (decl) => {
      const rule = decl.parent
      if (rule?.type === 'rule') {
        for (const selector of rule.selectors) {
          if (/\.cm-(editor|gutters)\b/.test(selector)) {
            backgroundSelectors.push(selector.trim())
          }
        }
      }
    })

    expect(backgroundSelectors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\.cm-editor\b/),
        expect.stringMatching(/\.cm-gutters\b/),
      ])
    )
    for (const selector of backgroundSelectors) {
      expect(selector).toMatch(/^:where\(/)
    }
  })
})
