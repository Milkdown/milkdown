/* Copyright 2021, Milkdown by Mirone. */
import { css } from 'atomico'

export const style = css`
  :host > .list-item {
    display: flex;
    align-items: start;
  }

  :host > .list-item > .children {
    min-width: 0;
    flex: 1;
  }
`
