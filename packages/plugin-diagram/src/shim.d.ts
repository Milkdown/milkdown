/* Copyright 2021, Milkdown by Mirone. */

import { Config } from 'mermaid';

declare module 'mermaid' {
    interface Config {
        themeCSS?: string;
    }
}
