/* Copyright 2021, Milkdown by Mirone. */
import { MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useLocal } from '../../provider/LocalizationProvider'
import { HomeEditor } from './Editor'

export const Home: React.FC = () => {
  const lang = useLocal()
  const prefix = lang === 'en' ? '' : `/${lang}`
  const gettingStarted = `${prefix}/getting-started`

  return (
    <div>
      <div className="mt-24 text-center">
        <h1 className="text-4xl font-medium sm:text-6xl xl:text-8xl">The <span className="text-nord10">WYSIWYG Markdown</span> Editor Framework</h1>
        <p className="mt-6 text-lg font-light sm:text-2xl">🍼 A plugin driven framework to build WYSIWYG Markdown editor.</p>
        <div className="mt-9 flex justify-center gap-4">
          <button className="bg-nord10 hover:bg-nord9 inline-flex h-14 items-center rounded-2xl py-4 px-5 text-gray-50 shadow-md hover:shadow-lg">
            <span className="material-symbols-outlined mr-3 text-base">play_circle</span>
            <span className="text-sm">
              <NavLink to={gettingStarted}>
                GET STARTED
              </NavLink>
            </span>
          </button>
          <button className="hover-shadow-lg dark:bg-nord3 hover:dark:bg-nord1 inline-flex h-14 items-center rounded-2xl bg-gray-200 py-4 px-5 shadow-md hover:bg-gray-100">
            <span className="text-sm">
              <a href="https://github.com/Saul-Mirone/milkdown" target="_blank" rel="noreferrer">
                VIEW ON GITHUB
              </a>
            </span>
          </button>
        </div>
      </div>
      <div className="mt-24">
        <MilkdownProvider>
          <ProsemirrorAdapterProvider>
            <HomeEditor />
          </ProsemirrorAdapterProvider>
        </MilkdownProvider>
      </div>
      <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="dark:bg-nord3 flex-1/2 rounded-2xl bg-gray-50 py-3 px-4">
          <div className="text-xl font-bold">Plugin Driven</div>
          <p className="mt-7 font-light">
            Everything in milkdown are plugins. Extend your editor with different types of plugins:
            syntax, theme, UI, etc.
          </p>
        </div>
        <div className="dark:bg-nord3 flex-1/2 rounded-2xl bg-gray-50 py-3 px-4">
          <div className="text-xl font-bold">Collaborative</div>
          <p className="mt-7 font-light">
            With the support of Y.js, milkdown can be used in real-time collaborative editing.
          </p>
        </div>
        <div className="dark:bg-nord3 flex-1/2 rounded-2xl bg-gray-50 py-3 px-4">
          <div className="text-xl font-bold">Headless</div>
          <p className="mt-7 font-light">
            Milkdown is headless and comes without any CSS.
            You can easily customize the editor to fit the style of your application.
          </p>
        </div>
        <div className="dark:bg-nord3 flex-1/2 rounded-2xl bg-gray-50 py-3 px-4">
          <div className="text-xl font-bold">Reliable</div>
          <p className="mt-7 font-light">
            Milkdown is built on top of some great libraries, such as ProseMirror, Y.js, and Remark.
            Which means you can use their community and eco system to get help.
          </p>
        </div>
      </div>
    </div>
  )
}
