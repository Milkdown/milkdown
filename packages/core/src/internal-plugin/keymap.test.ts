import { Clock, Container, Ctx } from '@milkdown/ctx'
import { expect, test, vi } from 'vitest'

import { KeymapManager } from './keymap'

test('should work with basic keymap', async () => {
  const km = new KeymapManager()
  const container = new Container()
  const clock = new Clock()
  const ctx = new Ctx(container, clock)
  km.setCtx(ctx)
  km.addBaseKeymap()

  const keymap = km.build()
  expect(keymap['Backspace']).toBeDefined()
  expect(keymap['Enter']).toBeDefined()
})

test('should chain commands for same key', async () => {
  const km = new KeymapManager()
  const container = new Container()
  const clock = new Clock()
  const ctx = new Ctx(container, clock)
  km.setCtx(ctx)

  const mock1 = vi.fn()
  const mock2 = vi.fn()
  const mock3 = vi.fn()

  km.add({
    key: 'Backspace',
    onRun: () => {
      return () => {
        mock1()
        return false
      }
    },
  })

  km.add({
    key: 'Backspace',
    onRun: () => {
      return () => {
        mock2()
        return true
      }
    },
  })

  km.add({
    key: 'Backspace',
    onRun: () => {
      return () => {
        mock3()
        return false
      }
    },
  })

  const keymap = km.build()
  keymap['Backspace']!({} as never, () => {}, {} as never)

  expect(mock1).toHaveBeenCalledTimes(1)
  expect(mock2).toHaveBeenCalledTimes(1)
  expect(mock3).not.toHaveBeenCalled()
})

test('should call high priority keymap first', async () => {
  const km = new KeymapManager()
  const container = new Container()
  const clock = new Clock()
  const ctx = new Ctx(container, clock)
  km.setCtx(ctx)

  const mock1 = vi.fn()
  const mock2 = vi.fn()
  const mock3 = vi.fn()

  km.add({
    key: 'Backspace',
    onRun: () => {
      return () => {
        mock1()
        return false
      }
    },
  })

  km.add({
    key: 'Backspace',
    onRun: () => {
      return () => {
        mock2()
        return true
      }
    },
  })

  km.add({
    key: 'Backspace',
    priority: 100,
    onRun: () => {
      return () => {
        mock3()
        return true
      }
    },
  })

  const keymap = km.build()
  keymap['Backspace']!({} as never, () => {}, {} as never)

  expect(mock1).not.toHaveBeenCalled()
  expect(mock2).not.toHaveBeenCalled()
  expect(mock3).toHaveBeenCalledTimes(1)
})

test('should add object keymap', async () => {
  const km = new KeymapManager()
  const container = new Container()
  const clock = new Clock()
  const ctx = new Ctx(container, clock)
  km.setCtx(ctx)

  const mockBackspace = vi.fn()
  const mockEnter = vi.fn()

  km.addObjectKeymap({
    Backspace: mockBackspace,
    Enter: mockEnter,
  })

  const keymap = km.build()
  expect(keymap['Backspace']).toBeDefined()
  expect(keymap['Enter']).toBeDefined()
})
