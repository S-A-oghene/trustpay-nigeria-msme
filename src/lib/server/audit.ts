import crypto from 'node:crypto'
import type { AuditEvent } from '@/lib/domain/types'

export function createAuditEvent(input: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  return { ...input, id: `audit_${crypto.randomUUID()}`, timestamp: new Date().toISOString() }
}

export function hashEventPayload(event: AuditEvent, previousHash = '') {
  return crypto.createHash('sha256').update(`${previousHash}|${JSON.stringify(event)}`).digest('hex')
}
