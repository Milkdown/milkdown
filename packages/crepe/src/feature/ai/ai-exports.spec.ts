import { test, expect, describe } from 'vitest'

import * as aiFeature from './index'

describe('public AI feature surface', () => {
  // A host that renders its own toolbar needs these two slices to reproduce
  // Crepe's AI button: one to gate on a configured provider, one to open the
  // instruction palette. Without them the only route is a deep import, which
  // the package's `exports` map blocks.
  test('exports the ctx slices a replacement toolbar needs', () => {
    expect(aiFeature.aiProviderConfig).toBeDefined()
    expect(aiFeature.aiInstructionTooltipAPI).toBeDefined()
  })

  test('the slices are addressable by their stable names', () => {
    expect(aiFeature.aiProviderConfig.key.name).toBe('aiProviderConfig')
    expect(aiFeature.aiInstructionTooltipAPI.key.name).toBe(
      'aiInstructionTooltipAPI'
    )
  })
})
