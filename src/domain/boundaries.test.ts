import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DOMAIN_DIR = join(process.cwd(), 'src', 'domain')

const FORBIDDEN: RegExp[] = [
  /^react(-dom)?(\/.*)?$/,
  /^recharts(\/.*)?$/,
  /(^|\.\.?\/|\/)(application|infrastructure|presentation)\//,
]

function domainFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return domainFiles(full)
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

describe('domain layer boundaries', () => {
  it('forbids framework and inner-layer imports inside src/domain', () => {
    const violations: string[] = []
    for (const file of domainFiles(DOMAIN_DIR)) {
      const source = readFileSync(file, 'utf8')
      for (const specifier of importSpecifiers(source)) {
        if (FORBIDDEN.some((re) => re.test(specifier))) {
          violations.push(`${file} imports "${specifier}"`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})