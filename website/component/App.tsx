/* Copyright 2021, Milkdown by Mirone. */
import { ReactEditorProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import React from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'

import type { Local } from '../route'
import { i18nConfig } from '../route'
import { Context, displaySidebarCtx, setDisplaySidebarCtx, setLocalCtx } from './Context'
// import { Header } from './Header'
import { Main } from './Route'
// import { Sidebar } from './Sidebar'
import className from './style.module.css'

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

const Container: React.FC = () => {
  const setDisplaySidebar = React.useContext(setDisplaySidebarCtx)
  // const displaySidebar = React.useContext(displaySidebarCtx)
  const setLocal = React.useContext(setLocalCtx)

  React.useEffect(() => {
    const path = window.location.pathname.split('/').filter(x => x.length > 0)
    const [first = ''] = path
    const list = Object.values(i18nConfig)
      .map(({ route }) => route)
      .filter(x => x)
    if (list.includes(first))
      setLocal(first as Local)
  }, [setLocal])

  return (
    <div
      onClick={() => {
        if (document.documentElement.clientWidth < 1142)
          setDisplaySidebar(false)
      }}
    >
      {/* <Header /> */}
      <main className={className.main}>
        <Main />
      </main>
    </div>
  )
}

export const App: React.FC = () => (
  <ReactEditorProvider>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ProsemirrorAdapterProvider>
        <HelmetProvider>
          <BrowserRouter>
            <Context>
              {/* <Sidebar /> */}
              <Container />
            </Context>
          </BrowserRouter>
        </HelmetProvider>
      </ProsemirrorAdapterProvider>
    </ErrorBoundary>
  </ReactEditorProvider>
)
