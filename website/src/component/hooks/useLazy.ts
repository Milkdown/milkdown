/* Copyright 2021, Milkdown by Mirone. */
import { useEffect, useState } from 'react'

export type Content = string | (() => Promise<{ default: string }>)

const notFound = `# 404

😿 This document is currently not been added.

💖 We're grateful if you're willing to help us improve it.`

export const useLazy = (content: Content) => {
  const [md, setMd] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof content === 'string') {
      setMd(content)
      setLoading(false)
      return
    }
    setLoading(true)
    content()
      .then((s) => {
        setMd(s.default)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setMd(notFound)
        setLoading(false)
      })
    return () => {
      setLoading(true)
    }
  }, [content])

  return [loading, md] as const
}
