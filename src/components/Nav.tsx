'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandMark } from './BrandMark'

const links = [
  { href: '/', label: 'Overview' },
  { href: '/demo', label: 'Demo', demo: true },
  { href: '/dashboard', label: 'Control' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/trust/trust-demo-1001', label: 'Trust' },
  { href: '/docs/doc-demo-1001', label: 'Documents' },
  { href: '/obligations', label: 'Watch' },
  { href: '/disputes', label: 'Resolve' },
  { href: '/commercial', label: 'Pricing' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="TrustPay home">
          <BrandMark />
        </Link>
        <div className="navlinks">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.demo ? 'nav-demo' : ''} ${isActive(pathname, link.href) ? 'active' : ''}`}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link className="nav-cta" href="/login">Sign in</Link>
      </nav>
    </header>
  )
}
