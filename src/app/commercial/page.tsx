import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'

export default function LoginPage() {
  return (
    <>
      <DemoBanner />
      <section className="form-card surface">
        <div className="trust-seal" style={{ background: 'linear-gradient(145deg, var(--lagoon-100), var(--brass-100))', color: 'var(--ink-950)' }}>
          <Icon name="lock" size={25} />
        </div>
        <div className="eyebrow sp-4">ACCOUNT ACCESS</div>
        <h1>Sign in to your business control.</h1>
        <p className="form-note">Production sign-in uses Supabase Auth when configured. Demo Mode remains available without an account.</p>

        <form className="form" action="/auth/sign-in" method="post">
          <label>
            Email
            <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            Password
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="btn primary" type="submit">Sign in securely <Icon name="arrow-right" size={15} /></button>
        </form>

        <div className="info-callout sp-4">
          For first setup, use the Supabase dashboard to enable your chosen sign-in method. Keep real customer data out of staging.
        </div>

        <div className="actions">
          <a className="btn secondary compact" href="/demo">Explore without signing in <Icon name="arrow-up-right" size={14} /></a>
        </div>
      </section>
    </>
  )
}
