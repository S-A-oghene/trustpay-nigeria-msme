import { createHash } from 'node:crypto'

export function hashStable(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function idempotencyKey(operation: string, id: string, version = '1') {
  return hashStable(`${operation}:${id}:${version}`)
}
