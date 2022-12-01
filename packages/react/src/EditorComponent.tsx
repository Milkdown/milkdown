/* Copyright 2021, Milkdown by Mirone. */
import React from 'react'

import { useGetEditor } from './useGetEditor'

export const EditorComponent = () => {
  const domRef = useGetEditor()

  return <div data-milkdown-root ref={domRef} />
}
