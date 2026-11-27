import type { LanguageDescription } from '@codemirror/language'

import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { expect, test } from 'vitest'

import { applyConfig } from '.'
import { CrepeFeature } from '../feature'

const mockHSLanguageDescription = {
  name: 'haskell',
} as LanguageDescription

const mockCppLanguageDescription = {
  name: 'cpp',
} as LanguageDescription

test('should use custom config to override the default config', () => {
  const myConfig = applyConfig({
    [CrepeFeature.CodeMirror]: {
      languages: [mockHSLanguageDescription, mockCppLanguageDescription],
    },
  })

  expect(myConfig[CrepeFeature.CodeMirror]?.languages).toEqual([
    mockHSLanguageDescription,
    mockCppLanguageDescription,
  ])
})

test('keeps the default theme and languages when they are not given', () => {
  const myConfig = applyConfig({
    [CrepeFeature.CodeMirror]: {
      theme: undefined,
      searchPlaceholder: 'Find a language',
    },
  })

  const codeMirror = myConfig[CrepeFeature.CodeMirror]
  expect(codeMirror?.theme).toBe(oneDark)
  expect(codeMirror?.languages).toEqual(languages)
  expect(codeMirror?.searchPlaceholder).toBe('Find a language')
  expect(applyConfig({})[CrepeFeature.CodeMirror]?.theme).toBe(oneDark)
})

test('uses a theme that is an object as it is', () => {
  const theme = { extension: [] }
  const myConfig = applyConfig({
    [CrepeFeature.CodeMirror]: { theme },
  })

  expect(myConfig[CrepeFeature.CodeMirror]?.theme).toBe(theme)
  // The default theme is not changed.
  expect(oneDark).not.toHaveProperty('extension')
})

test('gives each config its own copy of the default languages', () => {
  const first = applyConfig({})[CrepeFeature.CodeMirror]?.languages
  const second = applyConfig({})[CrepeFeature.CodeMirror]?.languages
  const count = languages.length

  first?.push(mockHSLanguageDescription)

  expect(first).not.toBe(languages)
  expect(second).toHaveLength(count)
  expect(languages).toHaveLength(count)
})

test('passes the configs of the other features through as they are', () => {
  const latex = { katexOptions: { macros: {} } }
  const myConfig = applyConfig({ [CrepeFeature.Latex]: latex })

  expect(myConfig[CrepeFeature.Latex]).toBe(latex)
})

test('does not change the config that is passed in', () => {
  const codeMirror = { searchPlaceholder: 'Find a language' }
  const userConfig = { [CrepeFeature.CodeMirror]: codeMirror }
  applyConfig(userConfig)

  expect(userConfig).toEqual({ [CrepeFeature.CodeMirror]: codeMirror })
  expect(codeMirror).toEqual({ searchPlaceholder: 'Find a language' })
})
