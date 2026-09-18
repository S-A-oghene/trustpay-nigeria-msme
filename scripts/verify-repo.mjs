import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const required = [
  'README.md',
  'BUILD_STATE.md',
  'CHANGELOG.md',
  '.env.example',
  'package.json',
  'package-lock.json',
  'proxy.ts',
  'next.config.ts',
  'tsconfig.json',
  'tsconfig.static.json',
  'supabase/schema.sql',
  'docs/BEGINNER_BROWSER_DEPLOYMENT.md',
  'docs/CURRENT_EXTERNAL_CLAIMS.md',
  'docs/CHANGE_CONTROL.md',
  'docs/TESTING_ACCEPTANCE.md',
  'docs/LEGAL_BOUNDARIES.md',
  'docs/COMMUNICATIONS.md',
  'src/app/page.tsx',
  'src/app/demo/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/trust/[token]/page.tsx',
  'src/app/transactions/[token]/page.tsx',
  'src/app/docs/[token]/page.tsx',
  'src/lib/domain/state-machine.ts',
  'src/lib/domain/risk.ts',
  'src/lib/server/providers/paystack.ts',
]

const forbidden = [
  '.githtrustpay-ci.yml',
  'github',
  'tools/typecheck-shims.d.ts',
]

const missing = required.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)))
if (missing.length > 0) {
  console.error('Missing required files:', missing.join(', '))
  process.exit(1)
}

const presentForbidden = forbidden.filter((relativePath) => fs.existsSync(path.join(root, relativePath)))
if (presentForbidden.length > 0) {
  console.error('Forbidden legacy paths remain:', presentForbidden.join(', '))
  process.exit(1)
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

if (packageJson.dependencies?.next !== '16.3.3') {
  throw new Error('Unexpected Next.js version')
}

if (packageJson.packageManager !== 'npm@11.19.1') {
  throw new Error('packageManager must be npm@11.19.1')
}

const documentedControls = [
  fs.readFileSync(path.join(root, 'BUILD_STATE.md'), 'utf8'),
  fs.readFileSync(path.join(root, 'README.md'), 'utf8'),
  fs.readFileSync(path.join(root, 'docs/LEGAL_BOUNDARIES.md'), 'utf8'),
  fs.readFileSync(path.join(root, 'docs/COMMUNICATIONS.md'), 'utf8'),
].join('\n').toLowerCase()

const invariants = [
  'does not hold customer funds',
  'screenshot',
  'unknown',
  'whatsapp is an optional communications adapter',
]

for (const invariant of invariants) {
  if (!documentedControls.includes(invariant)) {
    throw new Error(`Repository invariant missing from documented controls: ${invariant}`)
  }
}

const trackedSourceFiles = walk(root).filter((filePath) =>
  /\.(ts|tsx|sql|md|mjs|json|css|yml)$/.test(filePath),
).length

console.log(`Repository integrity check passed: ${required.length} required files present.`)
console.log(`Tracked source files: ${trackedSourceFiles}`)

function walk(directory) {
  const output = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue

    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      output.push(...walk(fullPath))
    } else {
      output.push(fullPath)
    }
  }

  return output
}
