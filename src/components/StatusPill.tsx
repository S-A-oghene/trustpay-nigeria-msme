export function StatusPill({ label, tone='neutral' }: { label: string; tone?: 'good'|'warn'|'bad'|'neutral' }) {
  return <span className={`pill pill-${tone}`}>{label}</span>
}
