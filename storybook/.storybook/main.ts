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
  // The Storybook vite builder manages the dev server itself and
  // ignores `server.proxy` from the user vite.config.mts. The AI
  // provider demos need these proxies to dodge CORS, because a direct
  // browser call fails: OpenAI sends no ACAO header, and the Anthropic
  // allow-list is strict. The Vite http-proxy forwards both the
  // Authorization header and the x-api-key header unchanged.
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
