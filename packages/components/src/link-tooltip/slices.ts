/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import type { Mark } from '@milkdown/prose/model'
import { html } from 'atomico'
import { link } from '../__internal__/icons'

export interface LinkToolTipState {
  mode: 'preview' | 'edit'
}

const defaultState: LinkToolTipState = {
  mode: 'preview',
}

export const linkTooltipState = $ctx({ ...defaultState }, 'linkTooltipStateCtx')

export interface LinkTooltipAPI {
  addLink: (from: number, to: number) => void
  editLink: (mark: Mark, from: number, to: number) => void
  removeLink: (from: number, to: number) => void
}

const defaultAPI: LinkTooltipAPI = {
  addLink: () => {},
  editLink: () => {},
  removeLink: () => {},
}

export const linkTooltipAPI = $ctx({ ...defaultAPI }, 'linkTooltipAPICtx')

export interface LinkTooltipConfig {
  linkIcon: () => ReturnType<typeof html>
  editButton: () => ReturnType<typeof html>
  confirmButton: () => ReturnType<typeof html>
  removeButton: () => ReturnType<typeof html>
  onCopyLink: (link: string) => void
}

const defaultConfig: LinkTooltipConfig = {
  linkIcon: () => link,
  editButton: () => html`Edit`,
  confirmButton: () => html`Confirm ⏎`,
  removeButton: () => html`Remove`,
  onCopyLink: () => {},
}

export const linkTooltipConfig = $ctx({
  ...defaultConfig,
}, 'linkTooltipConfigCtx')
