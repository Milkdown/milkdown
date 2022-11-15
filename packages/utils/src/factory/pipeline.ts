/* Copyright 2021, Milkdown by Mirone. */

import type { Cleanup, Ctx, Post, Pre } from '@milkdown/core'
import { Env, createClock, createContainer } from '@milkdown/core'

export interface PipelineEnv {
  readonly pre: Pre
  readonly ctx: Ctx
  readonly pipelineCtx: Env
  readonly onCleanup: (cleanup: Cleanup) => void
}

export type Pipeline = (env: PipelineEnv, next: () => Promise<void>) => Promise<void>

const runPipeline = (pipelines: Pipeline[]) => {
  return (env: PipelineEnv, next?: Pipeline): Promise<void> => {
    let index = -1
    const dispatch = (i: number): Promise<void> => {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = pipelines[i]
      if (i === pipelines.length)
        fn = next
      if (!fn)
        return Promise.resolve()
      try {
        return Promise.resolve(fn(env, () => dispatch(i + 1)))
      }
      catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

export const run = (pipelines: Pipeline[]) => {
  const runner = runPipeline(pipelines)
  const container = createContainer()
  const clock = createClock()

  const cleanupSet = new Set<Cleanup>()

  const pipelineCtx = new Env(container, clock)

  const onCleanup = (cleanup: Cleanup) => {
    cleanupSet.add(cleanup)
  }

  const runCleanup = async (post: Post) => {
    await Promise.all(
      [...cleanupSet].map((cleanup) => {
        return cleanup(post)
      }),
    )
  }

  const main = (pre: Pre, ctx: Ctx) =>
    runner({
      pre,
      ctx,
      pipelineCtx,
      onCleanup,
    })

  main.runCleanup = runCleanup

  return main
}
