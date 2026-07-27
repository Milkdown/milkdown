import type { StorybookConfig } from '@storybook/html-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/html-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.mts',
      },
    },
  },
  // Storybook's vite builder doesn't honor `server.proxy` from the user
  // vite.config.mts — it manages the dev server itself. The AI provider
  // demos rely on these proxies to dodge CORS (browser → provider direct
  // calls fail because OpenAI doesn't send ACAO headers and Anthropic's
  // allow-list is finicky). Both Authorization and x-api-key headers
  // are forwarded by Vite's http-proxy as-is.
  async viteFinal(viteConfig) {
    viteConfig.server = {
      ...viteConfig.server,
      proxy: {
        ...viteConfig.server?.proxy,
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        },
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        },
      },
    }
    return viteConfig
  },
}

export default config
