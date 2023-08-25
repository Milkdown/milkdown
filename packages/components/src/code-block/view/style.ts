/* Copyright 2021, Milkdown by Mirone. */
import { css } from 'atomico'

export const style = css`
  :host {
    display: block;
    position: relative;
  }

  :host .language-picker {
    width: max-content;
    position: absolute;
    z-index: 1;
    display: none;
  }

  :host .language-picker.show {
    display: block;
  }

  :host .language-button {
    display: flex;
    align-items: center;
  }

  :host .search-box {
    display: flex;
    align-items: center;
  }

  :host .search-box .clear-icon {
    cursor: pointer;
  }
`
