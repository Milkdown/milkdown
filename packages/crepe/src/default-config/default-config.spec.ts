import type { LanguageDescription } from '@codemirror/language'

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
