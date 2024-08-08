import * as process from 'node:process'
import { defineConfig } from 'cypress'
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      webServerConfig: {
        reuseExistingServer: !process.env.CI,
      },
      webServerCommands: {
        default: 'nx run @milkdown/e2e:start',
      },
      ciWebServerCommand: 'nx serve @milkdown/e2e',
    }),
    baseUrl: `http://localhost:${process.env.CI ? 4173 : 5173}`,
    fileServerFolder: '.',
  },
  retries: process.env.CI ? 2 : 0,
})
