/* Copyright 2021, Milkdown by Mirone. */
import { toggleStrikethroughCommand } from '../mark'
import { addColAfterCommand, addColBeforeCommand, addRowAfterCommand, addRowBeforeCommand, breakTableCommand, deleteSelectedCellsCommand, goToNextTableCellCommand, goToPrevTableCellCommand, insertTableCommand, moveColCommand, moveRowCommand, selectColCommand, selectRowCommand, selectTableCommand, setAlignCommand } from '../node'

/// @internal
export const commands = [
  goToNextTableCellCommand,
  goToPrevTableCellCommand,
  breakTableCommand,
  insertTableCommand,
  moveRowCommand,
  moveColCommand,
  selectRowCommand,
  selectColCommand,
  selectTableCommand,
  deleteSelectedCellsCommand,
  addRowBeforeCommand,
  addRowAfterCommand,
  addColBeforeCommand,
  addColAfterCommand,
  setAlignCommand,

  toggleStrikethroughCommand,
]
