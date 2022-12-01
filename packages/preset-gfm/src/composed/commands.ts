/* Copyright 2021, Milkdown by Mirone. */
import { toggleStrikethroughCommand } from '../mark'
import { breakTableCommand, goToNextTableCellCommand, goToPrevTableCellCommand, insertTableCommand } from '../node'

export const commands = [
  goToNextTableCellCommand,
  goToPrevTableCellCommand,
  breakTableCommand,
  insertTableCommand,

  toggleStrikethroughCommand,
]
