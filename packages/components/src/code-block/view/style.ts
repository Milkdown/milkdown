/* Copyright 2021, Milkdown by Mirone. */
import { css } from 'atomico'

export const style = css`
  :host {
    display: block;
    position: relative;
  }

  :host .language-list {
    width: max-content;
    position: absolute;
    z-index: 1;
    display: none;
  }

  :host .picker {
    display: flex;
    align-items: center;
  }

  :host .language-list.show {
    display: block;
  }

  :host .search-box {
    display: flex;
    align-items: center;
  }
`
