// Ensures Next.js critical build artifacts exist before dev server boots.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const serverDir = join(process.cwd(), '.next', 'server')
const manifestPath = join(serverDir, 'middleware-manifest.json')

mkdirSync(serverDir, { recursive: true })

if (!existsSync(manifestPath)) {
  const placeholderManifest = {
    version: 3,
    middleware: {},
    functions: {},
    sortedMiddleware: [],
  }

  writeFileSync(manifestPath, JSON.stringify(placeholderManifest, null, 2))
}
