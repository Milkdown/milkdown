/* Copyright 2021, Milkdown by Mirone. */

/* eslint-disable no-var */

/// <reference types="cypress" />
/// <reference types="vite/client" />

import { Editor } from '@milkdown/core';

declare global {
    var __milkdown__: Editor;
    var __setMarkdown__: (markdown: string) => void;
    var __getMarkdown__: () => string;

    namespace Cypress {
        interface Chainable<Subject = any> {
          // Add your method here
        }
    }
}
