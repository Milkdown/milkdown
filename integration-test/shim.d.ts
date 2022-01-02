/* Copyright 2021, Milkdown by Mirone. */
import { Editor } from '@milkdown/core';

declare global {
    // eslint-disable-next-line no-var
    var __milkdown__: Editor;
    // eslint-disable-next-line no-var
    var __setMarkdown__: (markdown: string) => void;
    // eslint-disable-next-line no-var
    var __getMarkdown__: () => string;
}
