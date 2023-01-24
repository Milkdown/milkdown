/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const nord0 = '#2e3440'
const nord1 = '#3b4252'
const nord2 = '#434c5e'
const nord3 = '#4c566a'
const nord4 = '#d8dee9'
const nord5 = '#e5e9f0'
const nord6 = '#eceff4'
const nord7 = '#8fbcbb'
const nord8 = '#88c0d0'
const nord9 = '#81a1c1'
const nord10 = '#5e81ac'
const nord11 = '#bf616a'
const nord12 = '#d08770'
const nord13 = '#ebcb8b'
const nord14 = '#a3be8c'
const nord15 = '#b48ead'

export const nordTheme = (dark: boolean) => {
  const highlightBackground = dark ? '#2c313a' : '#e5e9f0'
  const selection = dark ? nord0 : nord4
  return EditorView.theme(
    {
      '&': {
        color: dark ? nord4 : nord0,
      },

      '&.cm-focused': { outline: 'none !important' },

      '.cm-content': {
        caretColor: dark ? nord4 : nord0,
      },

      '&.cm-focused .cm-cursor': { borderLeftColor: dark ? nord6 : nord1 },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: selection },

      '.cm-panels': { backgroundColor: dark ? nord0 : nord4, color: dark ? nord4 : nord0 },
      '.cm-panels.cm-panels-top': { borderBottom: `2px solid ${dark ? nord0 : nord4}` },
      '.cm-panels.cm-panels-bottom': { borderTop: `2px solid ${dark ? nord0 : nord4}` },

      '.cm-searchMatch': {
        backgroundColor: nord15,
        outline: `1px solid ${nord15}`,
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: selection,
      },

      '.cm-activeLine': { backgroundColor: highlightBackground },
      '.cm-selectionMatch': { backgroundColor: nord15 },

      '.cm-matchingBracket, .cm-nonmatchingBracket': {
        backgroundColor: nord13,
        outline: `1px solid ${nord13}`,
      },

      '.cm-tooltip': {
        border: `1px solid ${dark ? '#181a1f' : '#ddd'}`,
        backgroundColor: dark ? nord2 : nord4,
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li[aria-selected]': {
          backgroundColor: highlightBackground,
          color: dark ? nord4 : nord2,
        },
      },
    },
    { dark },
  )
}

/// The highlighting style for code in the One Dark theme.
export const nordHighlightStyle = (dark: boolean) => HighlightStyle.define([
  { tag: t.keyword, color: dark ? nord9 : nord5 },
  {
    tag: [t.deleted, t.character, t.propertyName, t.macroName],
    color: dark ? nord7 : nord10,
  },
  { tag: [t.function(t.variableName), t.labelName], color: nord8 },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: dark ? nord4 : nord10 },
  { tag: [t.definition(t.name), t.separator], color: dark ? nord4 : nord10 },
  {
    tag: [
      t.typeName,
      t.className,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: nord12,
  },
  {
    tag: [t.typeName],
    color: nord9,
  },
  { tag: t.number, color: nord15 },
  {
    tag: [t.url, t.link],
    color: nord8,
  },
  {
    tag: [t.operator, t.operatorKeyword],
    color: nord9,
  },
  { tag: [t.escape, t.regexp, t.special(t.string)], color: nord14 },
  { tag: [t.meta, t.comment], color: nord3 },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: dark ? nord7 : nord10, textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: dark ? nord7 : nord10 },
  { tag: [t.bool], color: nord9 },
  { tag: [t.special(t.variableName)], color: nord5 },
  { tag: [t.processingInstruction, t.string, t.inserted], color: nord12 },
  { tag: t.invalid, color: nord11 },
])

export const nord = (dark: boolean): Extension => [nordTheme(dark), syntaxHighlighting(nordHighlightStyle(dark))]
