/* Copyright 2021, Milkdown by Mirone. */
export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface'

export type Font = 'typography' | 'code'

export type Size = 'radius' | 'lineWidth'

export type KnownIcon =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'text'
    | 'loading'
    | 'quote'
    | 'code'
    | 'table'
    | 'divider'
    | 'image'
    | 'brokenImage'
    | 'bulletList'
    | 'orderedList'
    | 'taskList'
    | 'bold'
    | 'italic'
    | 'inlineCode'
    | 'strikeThrough'
    | 'link'
    | 'leftArrow'
    | 'rightArrow'
    | 'upArrow'
    | 'downArrow'
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'delete'
    | 'select'
    | 'unchecked'
    | 'checked'
    | 'undo'
    | 'redo'
    | 'liftList'
    | 'sinkList'
    | 'dragHandle'

// A workaround to keep the intellisense

export type Icon = KnownIcon | (string & {})

export interface IconValue {
  dom: HTMLElement
  label: string
}
