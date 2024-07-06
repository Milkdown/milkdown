import { toggleStrikethroughCommand } from '../mark'
import { addColAfterCommand, addColBeforeCommand, addRowAfterCommand, addRowBeforeCommand, deleteSelectedCellsCommand, exitTable, goToNextTableCellCommand, goToPrevTableCellCommand, insertTableCommand, moveColCommand, moveRowCommand, selectColCommand, selectRowCommand, selectTableCommand, setAlignCommand } from '../node'

/// @internal
export const commands = [
  goToNextTableCellCommand,
  goToPrevTableCellCommand,
  exitTable,
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
