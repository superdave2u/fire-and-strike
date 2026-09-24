import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')

const LAYER_RULES: Record<string, RegExp[]> = {
  domain: [/^react(-dom)?(\/.*)?$/, /^recharts(\/.*)?$/, /(^|\.\.?\/|\/)(application|infrastructure|presentation)\//],
  application: [/^(react|react-dom|recharts)(\/.*)?$/, /(^|\.\.?\/|\/)(infrastructure|presentation)\//],
  infrastructure: [/^(react|react-dom|recharts)(\/.*)?$/, /(^|\.\.?\/|\/)(application|presentation)\//],
}

function layerFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return layerFiles(full)
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [full] : []
  })
}

function importSpecifiers(source: string): string[] {
  const specifiers: string[] = []
  const patterns = [/from\s+['"]([^'"]+)['"]/g, /import\s+['"]([^'"]+)['"]/g]
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1])
  }
  return specifiers
}

describe('layer boundaries', () => {
  for (const [layer, forbidden] of Object.entries(LAYER_RULES)) {
    it(`keeps src/${layer} free of framework and outer-layer imports`, () => {
      const violations: string[] = []
      for (const file of layerFiles(join(SRC, layer))) {
        const source = readFileSync(file, 'utf8')
        for (const specifier of importSpecifiers(source)) {
          if (forbidden.some((re) => re.test(specifier))) {
            violations.push(`${file} imports "${specifier}"`)
          }
        }
      }
      expect(violations).toEqual([])
    })
  }
})