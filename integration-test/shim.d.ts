/* Copyright 2021, Milkdown by Mirone. */

/* eslint-disable no-var */

/// <reference types="cypress" />

import { Editor } from '@milkdown/core';

declare global {
    var __milkdown__: Editor;
    var __setMarkdown__: (markdown: string) => void;
    var __getMarkdown__: () => string;

    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        interface Chainable<Subject = any> {
            snapshot: (options?: { name?: string; json?: boolean }) => void;
        }
    }
}
