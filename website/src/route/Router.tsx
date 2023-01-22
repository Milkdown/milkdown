/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from '../component/Home'
import { LazyLoad } from '../component/LazyLoad'
import { usePages, useRootUrl } from '../provider/LocalizationProvider'

const AsyncPlayground = lazy(() => import('../component/Playground').then(module => ({ default: module.Playground })))
const AsyncDocRenderer = lazy(() => import('../component/DocRenderer').then(module => ({ default: module.DocRenderer })))

export const Router: FC = () => {
  const pages = usePages()
  const root = useRootUrl()

  const playgroundURL = `/${[root, 'playground'].filter(x => x).join('/')}`
  const rootURL = `/${root}`

  return (
    <Routes>
      {pages.map((page, i) => (
        <Route
          key={i.toString()}
          path={page.link}
          element={
            <LazyLoad>
              <AsyncDocRenderer content={page.content} />
            </LazyLoad>
          }
        />
      ))}

      <Route
        path={playgroundURL}
        element={
          <LazyLoad>
            <AsyncPlayground />
          </LazyLoad>
        }
      />

      <Route path={rootURL} element={<Home />} />
    </Routes>
  )
}
