/* Copyright 2021, Milkdown by Mirone. */
import { css } from 'atomico'

export const style = css`
  :host {
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :host input {
    background: transparent;
    outline: none;
    border: 0;
  }

  :host.empty {
    vertical-align: bottom;
  }

  :host > .empty-inline-image {
    display: inline-flex;
  }

  :host > .empty-inline-image .confirm {
    cursor: pointer;
  }

  :host > .empty-inline-image .link-importer {
    position: relative;
    flex: 1;
  }

  :host > .empty-inline-image .link-importer > .link-input-area {
    width: 208px;
  }

  :host > .empty-inline-image .link-importer .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    cursor: text;
  }

  :host > .empty-inline-image .link-importer .placeholder .uploader {
    cursor: pointer;
    display: flex;
  }

  :host .hidden {
    display: none !important;
  }
`
