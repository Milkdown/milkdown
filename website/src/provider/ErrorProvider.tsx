/* Copyright 2021, Milkdown by Mirone. */
import type { ReactNode } from 'react'
import React from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ErrorBoundary>
)
