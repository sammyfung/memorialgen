/**
 * Copies dynamically-loaded packages into the Nitro output directory.
 *
 * Nitro's file tracer (nft) only traces statically-imported modules.
 * Packages loaded via createRequire() at runtime are missed.
 *
 * We also overlay the full drizzle-orm to restore the .cjs files that
 * Nitro's output folder is missing (it only keeps .js ESM variants).
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, '..')
const outMods   = join(root, '.output', 'server', 'node_modules')

// Pairs of [source-relative-to-root, dest-relative-to-outMods]
const toCopy = [
  // Full drizzle-orm with CJS files (overrides the partial Nitro-traced copy)
  ['node_modules/drizzle-orm', 'drizzle-orm'],
  // Native SQLite binding
  ['node_modules/better-sqlite3', 'better-sqlite3'],
]

for (const [src, dest] of toCopy) {
  const srcPath  = join(root, src)
  const destPath = join(outMods, dest)

  if (!existsSync(srcPath)) {
    console.warn(`[copy-native-deps] Skip (not found): ${src}`)
    continue
  }

  mkdirSync(dirname(destPath), { recursive: true })
  cpSync(srcPath, destPath, { recursive: true, force: true })
  console.log(`[copy-native-deps] Copied: ${src} → .output/server/node_modules/${dest}`)
}
