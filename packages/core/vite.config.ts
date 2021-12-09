/* Copyright 2021, Milkdown by Mirone. */
import path from 'path';
import { defineConfig } from 'vite';

import { viteBuild } from '../vite.config.common';

export default defineConfig({
    build: viteBuild('core'),
});
