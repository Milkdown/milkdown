import { commandsCtx } from '@milkdown/kit/core'
import { clearDiffReviewCmd } from '@milkdown/kit/plugin/diff'
import { callCommand } from '@milkdown/kit/utils'
import { describe, expect, test, vi } from 'vitest'

import { Crepe } from '../../core'
import { CrepeFeature } from '../index'
import { aiSessionCtx, runAICmd } from './commands'

function waitForAsync() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

async function flushStream() {
  // Streaming dispatches are scheduled across microtasks; a few ticks
  // are enough for the simulated provider to drain.
  for (let i = 0; i < 5; i++) await waitForAsync()
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
    await waitForAsync()

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
    await waitForAsync()

    expect(onError).toHaveBeenCalledOnce()
    const error = onError.mock.calls[0]![0]
    expect(error.code).toBe('aiBuildContextError')
    expect(error.message).toContain('context build failed')
    expect(error.cause).toBeInstanceOf(Error)
  })
})

describe('AI session retry metadata', () => {
  async function makeCrepe() {
    const crepe = new Crepe({
      defaultValue: 'hello world',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'replacement'
          },
        },
      },
    })
    await crepe.create()
    return crepe
  }

  test('runAICmd persists instruction, label, and selection range', async () => {
    const crepe = await makeCrepe()

    crepe.editor.action(
      callCommand(runAICmd.key, {
        instruction: 'Improve writing',
        label: 'Improving writing',
      })
    )
    await flushStream()

    const session = crepe.editor.action((ctx) => ctx.get(aiSessionCtx.key))
    expect(session.lastInstruction).toBe('Improve writing')
    expect(session.lastLabel).toBe('Improving writing')
    expect(session.lastFrom).toBeGreaterThanOrEqual(0)
    expect(session.lastTo).toBeGreaterThanOrEqual(session.lastFrom)
  })

  test('rejects a second runAICmd while a session is in flight', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            // Hang forever — caller should see runAICmd return false.
            await new Promise(() => {})
            yield ''
          },
        },
      },
    })
    await crepe.create()

    const first = crepe.editor.action(
      callCommand(runAICmd.key, { instruction: 'first' })
    )
    const second = crepe.editor.action(
      callCommand(runAICmd.key, { instruction: 'second' })
    )

    expect(first).toBe(true)
    expect(second).toBe(false)
  })

  test('lastInstruction survives session cleanup so Retry can replay it', async () => {
    const crepe = await makeCrepe()

    crepe.editor.action(
      callCommand(runAICmd.key, { instruction: 'Improve writing' })
    )
    await flushStream()

    // Whether or not diff review activates, the persistent retry fields
    // must outlive the live session state.
    crepe.editor.action((ctx) => {
      ctx.get(commandsCtx).call(clearDiffReviewCmd.key)
    })

    const session = crepe.editor.action((ctx) => ctx.get(aiSessionCtx.key))
    expect(session.abortController).toBeNull()
    expect(session.label).toBe('')
    expect(session.lastInstruction).toBe('Improve writing')
  })
})
