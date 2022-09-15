/* Copyright 2021, Milkdown by Mirone. */
import { defineConfig } from 'cypress';

export default defineConfig({
    projectId: 's5pmro',
    e2e: {
        baseUrl: 'http://localhost:7000',
    },
});
