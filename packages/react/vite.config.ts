/* Copyright 2021, Milkdown by Mirone. */
import react from '@vitejs/plugin-react';

import { pluginViteConfig } from '../../vite.config';

export default pluginViteConfig('react', {
    plugins: [react()],
});
