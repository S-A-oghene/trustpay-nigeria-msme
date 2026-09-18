"use client"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="section card"><h1>TrustPay could not complete this view.</h1><p className="muted">The affected operation has been stopped rather than silently inventing a result.</p><button className="btn" onClick={() => reset()}>Try again</button></section>
}
