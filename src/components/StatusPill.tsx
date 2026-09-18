type Tone = 'good' | 'warn' | 'bad' | 'neutral' | 'info'

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: Tone
}) {
  return <span className={`pill pill-${tone}`}>{label}</span>
}
