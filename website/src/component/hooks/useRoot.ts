/* Copyright 2021, Milkdown by Mirone. */
import React from 'react'
import { useLocal } from '../../provider/LocalizationProvider'

import { i18nConfig } from '../../route'

export const useRoot = () => {
  const local = useLocal()
  return React.useMemo(() => i18nConfig[local].route, [local])
}
