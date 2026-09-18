import Link from 'next/link'

export function Nav() {
  return <nav className="nav" aria-label="Primary navigation">
    <Link className="brand" href="/">TrustPay <span>Nigeria MSME</span></Link>
    <div className="navlinks">
      <Link href="/demo">Demo</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/trust/trust-demo-1001">Trust Card</Link>
      <Link href="/docs/doc-demo-1001">DocumentChaser</Link>
      <Link href="/obligations">Obligation Watch</Link><Link href="/disputes">Disputes</Link><Link href="/commercial">Commercial</Link><Link href="/disputes">Disputes</Link><Link href="/commercial">Commercial</Link>
    </div>
  </nav>
}
