/* Copyright 2021, Milkdown by Mirone. */
import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
    use: {
        baseURL: 'http://localhost:7000',
        channel: 'chrome',
    },
};
export default config;
