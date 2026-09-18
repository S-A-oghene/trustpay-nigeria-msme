import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const required=['README.md','BUILD_STATE.md','CHANGELOG.md','.env.example','proxy.ts','next.config.ts','tsconfig.json','supabase/schema.sql','docs/BEGINNER_BROWSER_DEPLOYMENT.md','docs/CURRENT_EXTERNAL_CLAIMS.md','docs/CHANGE_CONTROL.md','docs/TESTING_ACCEPTANCE.md','src/app/page.tsx','src/app/demo/page.tsx','src/app/dashboard/page.tsx','src/app/trust/[token]/page.tsx','src/lib/domain/state-machine.ts','src/lib/domain/risk.ts','src/lib/server/providers/paystack.ts']
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)))
if(missing.length){console.error('Missing required files:',missing.join(', '));process.exit(1)}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))
if(pkg.dependencies.next!=='16.3.3') throw new Error('Unexpected Next.js version')
const promptRules=['does not hold customer funds','screenshot','UNKNOWN','WhatsApp is an optional communications adapter']
const sources=fs.readFileSync('/mnt/data/MASTER_BUILD_PROMPT.md','utf8')
const built=fs.readFileSync(path.join(root,'BUILD_STATE.md'),'utf8')+'\n'+fs.readFileSync(path.join(root,'README.md'),'utf8')+'\n'+fs.readFileSync(path.join(root,'docs/LEGAL_BOUNDARIES.md'),'utf8')+'\n'+fs.readFileSync(path.join(root,'docs/COMMUNICATIONS.md'),'utf8')
for(const rule of promptRules){if(!sources.toLowerCase().includes(rule.toLowerCase())&&rule!=='UNKNOWN')throw new Error('Prompt invariant source mismatch: '+rule); if(rule!=='UNKNOWN'&&!built.toLowerCase().includes(rule.toLowerCase().split(' ').slice(0,5).join(' ')))throw new Error('Repository does not visibly preserve invariant wording: '+rule)}
console.log(`Repository integrity check passed: ${required.length} required files present.`)
console.log(`Tracked source files: ${walk(root).filter(f=>/\.(ts|tsx|sql|md|mjs|json|css|yml)$/.test(f)).length}`)
function walk(dir){const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.next','.git'].includes(e.name))continue;const full=path.join(dir,e.name);e.isDirectory()?out.push(...walk(full)):out.push(full)}return out}
