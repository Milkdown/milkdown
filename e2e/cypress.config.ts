import * as process from 'node:process'
import { defineConfig } from 'cypress'
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { input } from './entry'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      bundler: 'vite',
      webServerConfig: {
        reuseExistingServer: true,
      },
      webServerCommands: {
        default: 'nx run @milkdown/e2e:start',
      },
      ciWebServerCommand: 'nx serve @milkdown/e2e',
      viteConfigOverrides: {
        build: {
          rollupOptions: {
            input,
          },
        },
      },
    }),
    baseUrl: `http://localhost:${process.env.CI ? 4173 : 5173}`,
  },
  retries: process.env.CI ? 2 : 0,
})
