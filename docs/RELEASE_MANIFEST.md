# Release Manifest — 0.1.0

## Application

- Next.js 16.3.3
- React 19.2.0
- TypeScript 5.8.3
- Supabase SSR package 0.7.0 (pinned repository intent)
- Supabase JS 2.57.0 (pinned repository intent)
- Vitest 3.2.4
- Playwright 1.55.0

## Important note

These package versions are recorded in `package.json`, but the isolated build container could not reach the npm registry to resolve/install the dependency tree. The repository intentionally ships without a lockfile in this handoff because registry resolution was unavailable in the build container. CI uses `npm install` so a browser-connected GitHub runner can resolve the pinned versions. A real release should commit and adopt a verified lockfile after the first successful dependency resolution.
