/* Copyright 2021, Milkdown by Mirone. */
import * as Switch from '@radix-ui/react-switch'
import type { FC } from 'react'
import { useFeatureToggle, useSetFeatureToggle } from '../Milkdown/FeatureToggleProvider'

import './style.css'

export const PluginToggle: FC = () => {
  const { enableGFM } = useFeatureToggle()
  const setFeatureToggle = useSetFeatureToggle()
  return (
    <div className="my-4">
      <div className="flex items-center gap-4 px-10">
        <Switch.Root
          checked={enableGFM}
          onCheckedChange={(value) => {
            setFeatureToggle({ enableGFM: value })
          }}
          className="switch-root relative rounded-full shadow">
          <Switch.Thumb className="switch-thumb bg-nord6 block h-5 w-5 rounded-full" />
        </Switch.Root>
        <span>Enable GFM</span>
      </div>
    </div>
  )
}
