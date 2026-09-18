export function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <section className="metric-card"><div className="eyebrow">{label}</div><div className="metric-value">{value}</div><div className="muted">{detail}</div></section>
}
