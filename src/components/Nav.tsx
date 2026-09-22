'use client'

import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      )
    }

    return supabaseRef.current
  }

  useEffect(() => {
    const supabase = getSupabase()
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setIsAuthenticated(Boolean(data.user))
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)

    const supabase = getSupabase()

    const { error } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (error) {
      setSigningOut(false)
      return
    }

    setIsAuthenticated(false)
    router.replace('/login')
    router.refresh()
  }

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
              className={`${link.demo ? 'nav-demo' : ''} ${
                isActive(pathname, link.href) ? 'active' : ''
              }`}
              aria-current={
                isActive(pathname, link.href) ? 'page' : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {isAuthenticated ? (
          <button
            className="nav-cta"
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <Link className="nav-cta" href="/login">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  )
}
