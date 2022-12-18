/* Copyright 2021, Milkdown by Mirone. */
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { compose } from '../utils/compose'
import { ErrorProvider } from './ErrorProvider'
import { HelmetProvider } from './HelmetProvider'
import { LocalizationProvider } from './LocalizationProvider'
import { SidePanelStateProvider } from './SidePanelStateProvider'

export const AppProvider = compose(
  StrictMode,
  ErrorProvider,

  HelmetProvider,
  BrowserRouter,

  LocalizationProvider,
  SidePanelStateProvider,
)
