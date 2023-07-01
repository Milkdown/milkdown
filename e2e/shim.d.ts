/* Copyright 2021, Milkdown by Mirone. */

/* eslint-disable no-var */

/// <reference types="cypress" />
/// <reference types="vite/client" />

import { Editor } from '@milkdown/core';
import type { Telemetry } from "@milkdown/ctx";

declare global {
    var __milkdown__: Editor;
    var __setMarkdown__: (markdown: string) => void;
    var __getMarkdown__: () => string;

    var __inspect__: () => Telemetry[]

    namespace Cypress {
        interface Chainable {
          paste(payload: Record<string, unknown>): Chainable<void>
        }
    }

    var commands: {
      toggleStrong?: () => void;
      toggleEmphasis?: () => void;
      addTable?: (x?: number, y?: number) => void;
      addTable2?: (x?: number, y?: number) => void;
    }
}
