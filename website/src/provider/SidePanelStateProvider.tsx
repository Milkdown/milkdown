/* Copyright 2021, Milkdown by Mirone. */
import type { Dispatch, FC, ReactNode, Reducer } from 'react'
import { createContext, useCallback, useContext, useReducer } from 'react'

export type SidePanelActionType =
  | 'Hide'
  | 'ShowRoot'
  | 'ShowSection'

export type SidePanelMode = 'desktop' | 'mobile'

export const ROOT = '$ROOT$'

export type SidePanelAction =
  | { type: 'Hide' }
  | { type: 'ShowRoot' }
  | { type: 'ShowSection'; id: string; mode: SidePanelMode }

export type SidePanelState = {
  visible: boolean
  mode: SidePanelMode
  activeId: typeof ROOT | string
}

const sidePanelDataReducer: Reducer<SidePanelState, SidePanelAction> = (state, action) => {
  switch (action.type) {
    case 'ShowRoot': {
      return {
        visible: true,
        mode: 'mobile',
        activeId: ROOT,
      }
    }
    case 'ShowSection': {
      return {
        visible: true,
        mode: action.mode,
        activeId: action.id,
      }
    }
    case 'Hide':
    default: {
      return {
        ...state,
        visible: false,
      }
    }
  }
}

const defaultState: SidePanelState = {
  visible: false,
  mode: window.innerWidth < 768 ? 'mobile' : 'desktop',
  activeId: ROOT,
}

export const sidePanelStateCtx = createContext(defaultState)
export const sidePanelDispatcherCtx = createContext<Dispatch<SidePanelAction>>(() => undefined)

export const useSidePanelState = () => {
  return useContext(sidePanelStateCtx)
}

export const useSidePanelDispatcher = () => {
  return useContext(sidePanelDispatcherCtx)
}

export const useSidePanelVisible = () => {
  return useSidePanelState().visible
}

let sidePanelControl: number

export const useShowRootSidePanel = () => {
  const dispatch = useSidePanelDispatcher()

  return useCallback(() => {
    window.clearTimeout(sidePanelControl)
    dispatch({ type: 'ShowRoot' })
  }, [dispatch])
}

export const useShowSectionSidePanel = () => {
  const dispatch = useSidePanelDispatcher()

  return useCallback((id: string, mode: SidePanelMode) => {
    window.clearTimeout(sidePanelControl)
    dispatch({ type: 'ShowSection', id, mode })
  }, [dispatch])
}

export const useHoldSidePanel = () => {
  return useCallback(() => {
    window.clearTimeout(sidePanelControl)
  }, [])
}

export const useHideSidePanel = () => {
  const dispatch = useSidePanelDispatcher()
  return useCallback((delay: number) => {
    sidePanelControl = window.setTimeout(() => dispatch({ type: 'Hide' }), delay)
  }, [dispatch])
}

export const SidePanelStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sidePanelDataReducer, defaultState)

  return (
    <sidePanelStateCtx.Provider value={state}>
      <sidePanelDispatcherCtx.Provider value={dispatch} >
        {children}
      </sidePanelDispatcherCtx.Provider>
    </sidePanelStateCtx.Provider>
  )
}
