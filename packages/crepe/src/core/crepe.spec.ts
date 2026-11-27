import type { Extension } from '@codemirror/state'

import { LanguageDescription } from '@codemirror/language'
import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import { expect, test } from 'vitest'

import { Crepe } from './crepe'

test('uses the arrays in featureConfigs instead of merging them with the defaults', async () => {
  const haskell = LanguageDescription.of({
    name: 'Haskell',
    load: () => Promise.reject(new Error('not loaded in this test')),
  })
  const languages = [haskell]
  const theme: Extension[] = []
  const crepe = new Crepe({
    featureConfigs: {
      [Crepe.Feature.CodeMirror]: { languages, theme },
    },
  })
  await crepe.create()

  const config = crepe.editor.ctx.get(codeBlockConfig.key)
  expect(config.languages).toEqual([haskell])
  expect(config.extensions).toContain(theme)
  // The arrays passed in are not changed.
  expect(languages).toEqual([haskell])
  expect(theme).toEqual([])

  await crepe.destroy()
})
