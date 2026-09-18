import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Nav } from '@/components/Nav'
import { BrandMark } from '@/components/BrandMark'

export const metadata: Metadata = {
  title: 'TrustPay | Evidence-first commerce trust for Nigeria',
  description: 'TrustPay helps buyers and businesses verify evidence around identity, payment, documents, obligations and disputes.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://trustpay-nigeria-msme.vercel.app'),
}

export const viewport: Viewport = {
  themeColor: '#061a1f',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>
        <div className="site-shell">
          <Nav />
          <main className="site-main">
            <div className="shell">{children}</div>
          </main>
          <footer className="footer">
            <div className="footer-inner">
              <div>
                <div className="footer-brand"><BrandMark compact /><strong>TrustPay Nigeria MSME</strong></div>
                <p className="footer-note">
                  Evidence-first trust and control for Nigerian commerce. TrustPay does not hold customer funds in the base product, does not treat screenshots as authoritative payment confirmation, and does not promise certainty beyond the evidence available.
                </p>
              </div>
              <div className="footer-meta">
                <div>Evidence-first · Provider-neutral · Browser-first</div>
                <div className="sp-1">Not a bank, escrow custodian, legal/tax adviser, or universal fraud oracle.</div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
