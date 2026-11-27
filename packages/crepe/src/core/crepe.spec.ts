import type { Extension } from '@codemirror/state'

import { LanguageDescription } from '@codemirror/language'
import { languages as defaultLanguages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import { afterEach, expect, test } from 'vitest'

import { Crepe } from './crepe'

const editors: Crepe[] = []

afterEach(async () => {
  await Promise.all(editors.splice(0).map((crepe) => crepe.destroy()))
})

const createCrepe = async (...args: ConstructorParameters<typeof Crepe>) => {
  const crepe = new Crepe(...args)
  editors.push(crepe)
  await crepe.create()
  return crepe
}

test('uses the arrays in featureConfigs instead of merging them with the defaults', async () => {
  const haskell = LanguageDescription.of({
    name: 'Haskell',
    load: () => Promise.reject(new Error('not loaded in this test')),
  })
  const languages = [haskell]
  const theme: Extension[] = []
  const crepe = await createCrepe({
    featureConfigs: {
      [Crepe.Feature.CodeMirror]: { languages, theme },
    },
  })

  const config = crepe.editor.ctx.get(codeBlockConfig.key)
  expect(config.languages).toEqual([haskell])
  expect(config.extensions).toContain(theme)
  expect(config.extensions).not.toContain(oneDark)
  // The arrays passed in are not changed.
  expect(languages).toEqual([haskell])
  expect(theme).toEqual([])
})

test('uses the default theme and languages when they are not given', async () => {
  const crepe = await createCrepe({
    featureConfigs: {
      [Crepe.Feature.CodeMirror]: { searchPlaceholder: 'Find a language' },
    },
  })

  const config = crepe.editor.ctx.get(codeBlockConfig.key)
  expect(config.languages).toEqual(defaultLanguages)
  expect(config.extensions).toContain(oneDark)
  expect(config.searchPlaceholder).toBe('Find a language')
})
