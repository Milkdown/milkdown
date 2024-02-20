/* Copyright 2021, Milkdown by Mirone. */
import type { StorybookConfig } from '@storybook/html-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/html-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.mts',
      },
    },
  },
}

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
export default config
