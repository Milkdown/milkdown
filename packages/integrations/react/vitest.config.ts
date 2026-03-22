import react from '@vitejs/plugin-react'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vueJsx({
      include: [/\/(crepe|components)\/.*\.tsx$/],
    }),
    react({
      include: [/\/react\/.*\.[jt]sx$/],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
