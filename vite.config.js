import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A new id for every build. The app compares it with /version.json to know when to refresh itself.
const APP_VERSION = new Date().toISOString()

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'wild-version-file',
      apply: 'build',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: APP_VERSION }) })
      },
    },
  ],
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
})
