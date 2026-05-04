import type { EditorView } from '@milkdown/kit/prose/view'

import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import {
  clearDiffReviewCmd,
  diffPluginKey,
  startDiffReviewCmd,
} from '@milkdown/kit/plugin/diff'
import {
  startStreamingCmd,
  streamingPluginKey,
} from '@milkdown/kit/plugin/streaming'
import { callCommand } from '@milkdown/kit/utils'
import { describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'

import { Crepe } from '../../core'
import { CrepeFeature } from '../index'
import { aiSessionCtx, runAICmd } from './commands'
import { aiInstructionTooltipAPI } from './instruction-tooltip'

function waitForAsync() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

async function flushStream() {
  // Streaming dispatches are scheduled across microtasks; a few ticks
  // are enough for the simulated provider to drain.
  for (let i = 0; i < 5; i++) await waitForAsync()
}

function dispatchKeyDown(
  view: EditorView,
  key: string,
  modifiers: { metaKey?: boolean; ctrlKey?: boolean } = {}
): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers,
  })
  // Iterate every plugin's handleKeyDown until one claims the event.
  // Returning `undefined` from the visitor keeps `someProp` looking;
  // returning `true` short-circuits and is what we treat as "handled".
  return (
    view.someProp('handleKeyDown', (handler) =>
      handler(view, event) ? true : undefined
    ) === true
  )
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

describe('AI keybindings', () => {
  test('Mod-Enter accepts all changes for an AI-owned diff review', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'unused'
          },
        },
      },
    })
    await crepe.create()
    try {
      // Simulate the end of an AI session: the streaming side flips
      // `diffOwnedByAI` on right before handing off to diff review.
      crepe.editor.action((ctx) => {
        const session = ctx.get(aiSessionCtx.key)
        ctx.set(aiSessionCtx.key, { ...session, diffOwnedByAI: true })
        ctx.get(commandsCtx).call(startDiffReviewCmd.key, 'goodbye')
      })

      const view = crepe.editor.ctx.get(editorViewCtx)
      expect(diffPluginKey.getState(view.state)?.active).toBe(true)

      expect(dispatchKeyDown(view, 'Enter', { metaKey: true })).toBe(true)
      expect(diffPluginKey.getState(view.state)?.active).toBeFalsy()
      expect(view.state.doc.textContent).toContain('goodbye')
    } finally {
      await crepe.destroy()
    }
  })

  test('Mod-Enter does not hijack a manually-started diff review', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'unused'
          },
        },
      },
    })
    await crepe.create()
    try {
      // No `diffOwnedByAI` flip — this represents host code calling
      // `startDiffReviewCmd` directly, independent of the AI feature.
      crepe.editor.action((ctx) => {
        ctx.get(commandsCtx).call(startDiffReviewCmd.key, 'goodbye')
      })

      const view = crepe.editor.ctx.get(editorViewCtx)
      expect(diffPluginKey.getState(view.state)?.active).toBe(true)

      // Handler must let the event fall through; the diff stays active.
      expect(dispatchKeyDown(view, 'Enter', { metaKey: true })).toBe(false)
      expect(diffPluginKey.getState(view.state)?.active).toBe(true)
    } finally {
      await crepe.destroy()
    }
  })

  test('Esc aborts an in-flight AI session', async () => {
    const crepe = new Crepe({
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            // Hang indefinitely so the session stays open until aborted.
            await new Promise(() => {})
            yield ''
          },
          diffReviewOnEnd: false,
        },
      },
    })
    await crepe.create()
    try {
      crepe.editor.action(callCommand(runAICmd.key, { instruction: 'test' }))
      await waitForAsync()

      const view = crepe.editor.ctx.get(editorViewCtx)
      expect(streamingPluginKey.getState(view.state)?.active).toBe(true)

      expect(dispatchKeyDown(view, 'Escape')).toBe(true)
      await waitForAsync()

      const session = crepe.editor.action((ctx) => ctx.get(aiSessionCtx.key))
      expect(session.abortController).toBeNull()
      expect(streamingPluginKey.getState(view.state)?.active).toBeFalsy()
    } finally {
      await crepe.destroy()
    }
  })

  test('Esc aborts a manual streaming session when no AI session is active', async () => {
    const crepe = new Crepe({
      features: { [CrepeFeature.AI]: true },
    })
    await crepe.create()
    try {
      crepe.editor.action((ctx) => {
        ctx.get(commandsCtx).call(startStreamingCmd.key, { insertAt: 'cursor' })
      })

      const view = crepe.editor.ctx.get(editorViewCtx)
      expect(streamingPluginKey.getState(view.state)?.active).toBe(true)
      // Sanity: no AI session is in flight.
      expect(
        crepe.editor.action((ctx) => ctx.get(aiSessionCtx.key).abortController)
      ).toBeNull()

      expect(dispatchKeyDown(view, 'Escape')).toBe(true)
      expect(streamingPluginKey.getState(view.state)?.active).toBeFalsy()
    } finally {
      await crepe.destroy()
    }
  })
})

describe('AI diff actions panel visibility', () => {
  /// Panels from earlier tests may linger in `document.body` until their
  /// editor view is fully torn down, so always look up the panel
  /// relative to the current crepe instance's `.milkdown` host.
  function findPanelFor(crepe: Crepe): HTMLElement | null {
    const view = crepe.editor.ctx.get(editorViewCtx)
    const host = view.dom.closest('.milkdown') ?? document.body
    return host.querySelector<HTMLElement>('.milkdown-ai-diff-actions')
  }

  test('panel stays hidden for a manually-started diff review', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'unused'
          },
        },
      },
    })
    await crepe.create()
    try {
      crepe.editor.action((ctx) => {
        ctx.get(commandsCtx).call(startDiffReviewCmd.key, 'goodbye')
      })

      expect(findPanelFor(crepe)?.dataset.show).toBe('false')
    } finally {
      await crepe.destroy()
    }
  })

  test('panel shows for an AI-owned diff review', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'unused'
          },
        },
      },
    })
    await crepe.create()
    try {
      crepe.editor.action((ctx) => {
        const session = ctx.get(aiSessionCtx.key)
        ctx.set(aiSessionCtx.key, { ...session, diffOwnedByAI: true })
        ctx.get(commandsCtx).call(startDiffReviewCmd.key, 'goodbye')
      })

      expect(findPanelFor(crepe)?.dataset.show).toBe('true')
    } finally {
      await crepe.destroy()
    }
  })
})

describe('AI instruction palette', () => {
  test('show() mounts a palette input under .milkdown-ai-instruction', async () => {
    const crepe = new Crepe({
      defaultValue: 'hello',
      features: { [CrepeFeature.AI]: true },
      featureConfigs: {
        [CrepeFeature.AI]: {
          provider: async function* () {
            yield 'unused'
          },
        },
      },
    })
    await crepe.create()
    try {
      crepe.editor.ctx.get(aiInstructionTooltipAPI.key).show(0, 0)
      await nextTick()

      const input = document.querySelector<HTMLInputElement>(
        '.milkdown-ai-instruction input'
      )
      expect(input).not.toBeNull()
    } finally {
      await crepe.destroy()
    }
  })
})
