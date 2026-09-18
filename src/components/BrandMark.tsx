export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="TrustPay Nigeria MSME">
      <span className="brand-mark">
        <svg width={compact ? 20 : 22} height={compact ? 20 : 22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 8.5C7.2 5.4 10 4 12.4 5.1c2 .9 2.7 2.8 1.9 4.4-.9 1.8-2.8 2.4-4.4 3.3-1.6.8-2.3 2.4-1.7 3.9.7 1.8 2.8 2.6 4.8 1.7 1.7-.7 3-2.5 3.6-4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M8.2 14.4c.7-1.6 1.9-2.7 3.3-3.4 1.6-.8 2.9-.7 4.2.2 1.6 1.1 2 3.2 1 4.9-1.1 1.9-3.4 3-5.6 2.4" stroke="#c99c2b" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
      {!compact && <span><span className="brand-wordmark">TrustPay</span><span className="brand-sub">Nigeria MSME</span></span>}
    </span>
  )
}
