/* Copyright 2021, Milkdown by Mirone. */

export const isMac = () => window.navigator.platform.includes('Mac')

export const mod = () => (isMac() ? 'meta' : 'ctrl')

export function pressMod(keys: string) {
  const m = mod()
  return `{${m}>}${keys}{/${m}}`
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
