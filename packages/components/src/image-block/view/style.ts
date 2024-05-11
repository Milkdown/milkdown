import { css } from 'atomico'

export const style = css`
  :host {
    outline: none;
    margin: 16px 0;
    display: block;
  }

  :host > .image-wrapper {
    position: relative;
    width: fit-content;
    margin: 0 auto;
    min-width: 100px;
  }

  :host > .image-wrapper .operation {
    position: absolute;
    display: flex;
  }

  :host > .image-wrapper .operation > .operation-item {
    cursor: pointer;
  }

  :host > .image-wrapper img {
    max-width: 100%;
    min-height: 100px;
    display: block;
    object-fit: cover;
  }

  :host > .image-wrapper > .image-resize-handle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  :host > .image-wrapper > .image-resize-handle:hover {
    cursor: row-resize;
  }

  :host input {
    background: transparent;
    outline: none;
    border: 0;
  }

  :host > .caption-input {
    display: block;
    width: 100%;
    text-align: center;
  }

  :host > .image-edit {
    display: flex;
  }

  :host > .image-edit .confirm {
    cursor: pointer;
  }

  :host > .image-edit .link-importer {
    position: relative;
    flex: 1;
  }

  :host > .image-edit .link-importer > .link-input-area {
    width: 100%;
  }

  :host > .image-edit .link-importer .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    cursor: text;
  }

  :host > .image-edit .link-importer .placeholder .uploader {
    cursor: pointer;
    display: flex;
  }

  :host .hidden {
    display: none !important;
  }
`
