/* Copyright 2021, Milkdown by Mirone. */
import {
  commandsCtx,
  createSlice, prosePluginsCtx,
} from '@milkdown/core'
import { keymap } from '@milkdown/prose/keymap'
import type { CommandConfig } from '../../types'

import type { Pipeline } from '../pipeline'
import { optionsPipeCtx } from './options'

export const shortcutsPipeCtx = createSlice<Record<string, CommandConfig>>({}, 'shortcutsPipeCtx')
export const createShortcuts: Pipeline = async (env, next) => {
  const { pipelineCtx, ctx, onCleanup } = env

  const shortcuts = pipelineCtx.get(shortcutsPipeCtx)

  const options = pipelineCtx.get(optionsPipeCtx)
  const getKey = (key: string, defaultValue: string | string[]): string | string[] => {
    return options?.keymap?.[key] ?? defaultValue
  }

  const tuples = Object.entries<CommandConfig>(shortcuts)
    .flatMap(([id, [commandKey, defaultKey, args]]) => {
      const runner = () => ctx.get(commandsCtx).call(commandKey, args)
      const key = getKey(id, defaultKey)
      if (Array.isArray(key))
        return key.map(k => ({ key: k, runner }))

      return { key, runner }
    })
    .map(x => [x.key, x.runner] as [string, () => boolean])

  const plugin = keymap(Object.fromEntries(tuples))
  ctx.update(prosePluginsCtx, ps => ps.concat(plugin))
  onCleanup(() => {
    ctx.update(prosePluginsCtx, ps => ps.filter(p => p !== plugin))
  })

  await next()
}
