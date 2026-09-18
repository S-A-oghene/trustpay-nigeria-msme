export interface ReminderPolicy {
  id: string
  version: string
  daysBefore: number[]
  overdueDays: number[]
  enabled: boolean
}

export const defaultReminderPolicy: ReminderPolicy = {
  id:'default', version:'1', daysBefore:[90,60,30,14,7,3,0], overdueDays:[1,7,30], enabled:true,
}

export function reminderOffsets(policy: ReminderPolicy, target: Date, now = new Date()) {
  if (!policy.enabled) return []
  return policy.daysBefore.filter(days => new Date(target.getTime()-days*86400000) > now)
}
