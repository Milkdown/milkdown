/* Copyright 2021, Milkdown by Mirone. */
import React from 'react'
import { HomeEditor } from './Editor'

export const Home: React.FC = () => {
  return (
    <div>
      <div className="text-center mt-24">
        <h1 className="xl:text-8xl sm:text-6xl text-4xl font-medium">The <span className="text-nord10">WYSIWYG Markdown</span> Editor Framework</h1>
        <p className="sm:text-2xl text-lg mt-6">A plugin driven framework to build <span className="text-nord10">WYSIWYG markdown</span> editor.</p>
        <div className="flex justify-center gap-4 mt-9">
          <button className="bg-nord10 text-gray-50 rounded-2xl shadow-md py-4 px-5 inline-flex items-center h-14 hover:bg-nord9 hover:shadow-lg">
            <span className="material-symbols-outlined mr-3 text-base">play_circle</span>
            <span className="text-sm">GET STARTED</span>
          </button>
          <button className="rounded-2xl shadow-md py-4 px-5 inline-flex items-center bg-gray-200 h-14 hover:bg-gray-100 hover-shadow-lg">
            <span className="text-sm">VIEW ON GITHUB</span>
          </button>
        </div>
      </div>
      <div className="mt-24">
        <HomeEditor />
      </div>
      <div className="mt-24 grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="bg-gray-50 flex-1/2 rounded-2xl py-3 px-4">
          <div className="text-xl font-bold">Header</div>
          <p className="font-light mt-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>
        </div>
        <div className="bg-gray-50 flex-1/2 rounded-2xl py-3 px-4">
          <div className="text-xl font-bold">Header</div>
          <p className="font-light mt-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>
        </div>
        <div className="bg-gray-50 flex-1/2 rounded-2xl py-3 px-4">
          <div className="text-xl font-bold">Header</div>
          <p className="font-light mt-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>
        </div>
        <div className="bg-gray-50 flex-1/2 rounded-2xl py-3 px-4">
          <div className="text-xl font-bold">Header</div>
          <p className="font-light mt-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          </p>
        </div>
      </div>
    </div>
  )
}
