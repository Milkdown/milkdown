/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type {
  Emotion,
  ThemeManager,
  ThemeSliceKey,
} from '@milkdown/design-system'
import {
  ThemeGlobal,
  createThemeManager,
  emotionConfigCtx,
  emotionCtx,
  initEmotion,
  internalThemeKeys,
  themeManagerCtx,
} from '@milkdown/design-system'
import { Plugin, PluginKey } from '@milkdown/prose/state'

import { ConfigReady } from './config'
import { InitReady, prosePluginsCtx } from './init'

export const themeTimerCtx = createSlice([] as Timer[], 'themeTimer')
export const ThemeEnvironmentReady = createTimer('ThemeEnvironmentReady')
export const ThemeReady = createTimer('ThemeReady')

const key = new PluginKey('MILKDOWN_THEME_RESET')

export const themeEnvironment: MilkdownPlugin = (pre) => {
  const themeManager = createThemeManager()

  pre.inject(emotionConfigCtx)
    .inject(emotionCtx)
    .inject(themeManagerCtx, themeManager)
    .inject(themeTimerCtx, [ConfigReady])
    .record(ThemeReady)
    .record(ThemeEnvironmentReady)

  return async (ctx) => {
    await ctx.waitTimers(themeTimerCtx)
    const emotion = initEmotion(ctx.get(emotionConfigCtx))

    internalThemeKeys.forEach((key) => {
      themeManager.inject(key as ThemeSliceKey)
    })

    ctx.set(emotionCtx, emotion)

    ctx.done(ThemeEnvironmentReady)
    ctx.done(ThemeReady)

    await ctx.wait(InitReady)
    ctx.update(prosePluginsCtx, xs =>
      xs.concat(
        new Plugin({
          key,
          view: () => {
            themeManager.runExecutor()
            return {
              destroy: () => {
                emotion.flush()
              },
            }
          },
        }),
      ),
    )

    return (post) => {
      post.remove(emotionConfigCtx)
        .remove(emotionCtx)
        .remove(themeManagerCtx)
        .remove(themeTimerCtx)
        .clearTimer(ThemeReady)
        .clearTimer(ThemeEnvironmentReady)
    }
  }
}

export type CreateThemePack = (emotion: Emotion, manager: ThemeManager) => void
export type ThemePlugin = MilkdownPlugin & {
  override: (overrideFn: CreateThemePack) => ThemePlugin
}

export const themeFactory = (createThemePack?: CreateThemePack): ThemePlugin => {
  let overrideFn: CreateThemePack | null = null
  const theme: ThemePlugin = () => async (ctx) => {
    await ctx.wait(ThemeEnvironmentReady)
    const emotion = ctx.get(emotionCtx)
    const themeManager = ctx.get(themeManagerCtx)

    themeManager.setExecutor(() => {
      createThemePack?.(emotion, themeManager)
      overrideFn?.(emotion, themeManager)

      internalThemeKeys.forEach((key) => {
        if (!themeManager.has(key as ThemeSliceKey))
          console.warn('Theme key not found: ', key.sliceName)
      })

      themeManager.get(ThemeGlobal, undefined)
    })
  }
  theme.override = (fn) => {
    overrideFn = fn
    return theme
  }
  return theme
}
