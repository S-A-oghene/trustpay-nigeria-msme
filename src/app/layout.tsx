import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'TrustPay Nigeria MSME',
  description: 'Evidence and trust control for Nigerian commerce.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG"><body><Nav /><main className="shell">{children}</main><footer className="footer">TrustPay Nigeria MSME · Evidence-first · Provider-neutral · Not a bank, escrow custodian, legal/tax adviser, or universal fraud oracle.</footer></body></html>
}
