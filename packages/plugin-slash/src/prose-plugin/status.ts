/* Copyright 2021, Milkdown by Mirone. */
import type { StatusConfigBuilder, StatusConfigBuilderParams } from '..'
import type { Action } from '../item'
import { transformAction } from '../item'

export interface StatusCtx {
  placeholder: string | null
  actions: Action[]
}

const createStatusCtx = (): StatusCtx => {
  return {
    placeholder: null,
    actions: [],
  }
}

export type Status = ReturnType<typeof createStatus>

export const createStatus = (builder: StatusConfigBuilder) => {
  const statusCtx = createStatusCtx()

  return {
    get: () => statusCtx,
    clear: () => {
      statusCtx.placeholder = null
      statusCtx.actions = []
    },
    update: (builderParams: StatusConfigBuilderParams) => {
      const config = builder(builderParams)
      statusCtx.placeholder = config?.placeholder ?? null
      statusCtx.actions = (config?.actions ?? []).map(transformAction)
      return statusCtx
    },
    isEmpty: () => statusCtx.actions.length === 0,
  }
}
