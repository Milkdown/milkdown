/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from '../component/Home'
import { DocRenderer } from '../component/DocRenderer'
import { Playground } from '../component/Playground'
import { usePages, useRootUrl } from '../provider/LocalizationProvider'

export const Router: FC = () => {
  const pages = usePages()
  const root = useRootUrl()

  const playgroundURL = `/${[root, 'playground'].filter(x => x).join('/')}`
  const rootURL = `/${root}`

  return (
    <Routes>
      {pages.map((page, i) => (
        <Route key={i.toString()} path={page.link} element={<DocRenderer content={page.content} />} />
      ))}

      <Route path={playgroundURL} element={<Playground />} />

      <Route path={rootURL} element={<Home />} />
    </Routes>
  )
}
