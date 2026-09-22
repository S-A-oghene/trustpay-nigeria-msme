'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>

let browserSupabase: BrowserSupabaseClient | null = null

function getSupabase(): BrowserSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return null
  }

  if (!browserSupabase) {
    browserSupabase = createBrowserClient(url, key)
  }

  return browserSupabase
}

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true
    const supabase = getSupabase()

    // Public/demo test environments may intentionally have no Supabase
    // configuration. The navigation must remain usable in that case.
    if (!supabase) {
      return () => {
        mounted = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setIsAuthenticated(Boolean(session))
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    const supabase = getSupabase()

    if (!supabase) {
      setSigningOut(false)
      return
    }

    setSigningOut(true)

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
