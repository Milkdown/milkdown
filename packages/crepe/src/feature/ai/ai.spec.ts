import { callCommand } from '@milkdown/kit/utils'
import { describe, expect, test, vi } from 'vitest'

import { Crepe } from '../../core'
import { CrepeFeature } from '../index'
import { runAICmd } from './commands'

function flushMicrotasks() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

describe('AI onError', () => {
  test('provider error triggers onError with aiProviderError code', async () => {
    const onError = vi.fn()

    const crepe = new Crepe({
      features: {
        [CrepeFeature.AI]: true,
      },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'partial'
            throw new Error('network failure')
          },
          onError,
          diffReviewOnEnd: false,
        },
      },
    })
    await crepe.create()

    crepe.editor.action(callCommand(runAICmd.key, { instruction: 'test' }))
    await flushMicrotasks()

    expect(onError).toHaveBeenCalledOnce()
    const error = onError.mock.calls[0]![0]
    expect(error.code).toBe('aiProviderError')
    expect(error.message).toContain('network failure')
    expect(error.cause).toBeInstanceOf(Error)
  })

  test('buildContext error triggers onError with aiBuildContextError code', async () => {
    const onError = vi.fn()

    const crepe = new Crepe({
      features: {
        [CrepeFeature.AI]: true,
      },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'hello'
          },
          buildContext: () => {
            throw new Error('context build failed')
          },
          onError,
          diffReviewOnEnd: false,
        },
      },
    })
    await crepe.create()

    crepe.editor.action(callCommand(runAICmd.key, { instruction: 'test' }))
    await flushMicrotasks()

    expect(onError).toHaveBeenCalledOnce()
    const error = onError.mock.calls[0]![0]
    expect(error.code).toBe('aiBuildContextError')
    expect(error.message).toContain('context build failed')
    expect(error.cause).toBeInstanceOf(Error)
  })
})
