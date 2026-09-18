import type { SVGProps } from 'react'

type IconName =
  | 'arrow-up-right'
  | 'arrow-right'
  | 'check'
  | 'shield'
  | 'scan'
  | 'receipt'
  | 'file'
  | 'clock'
  | 'alert'
  | 'balance'
  | 'spark'
  | 'store'
  | 'user'
  | 'lock'
  | 'activity'
  | 'fingerprint'
  | 'link'
  | 'scale'

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number; strokeWidth?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }

  switch (name) {
    case 'arrow-up-right':
      return <svg {...common}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
    case 'shield':
      return <svg {...common}><path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></svg>
    case 'scan':
      return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3"/><path d="M16 4h3a1 1 0 0 1 1 1v3"/><path d="M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 12h8"/></svg>
    case 'receipt':
      return <svg {...common}><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
    case 'file':
      return <svg {...common}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'alert':
      return <svg {...common}><path d="m12 4 9 16H3z"/><path d="M12 9v4M12 17h.01"/></svg>
    case 'balance':
      return <svg {...common}><path d="M12 3v18M5 7h14M7 7l-3 5a3 3 0 0 0 6 0zM17 7l-3 5a3 3 0 0 0 6 0zM5 20h14"/></svg>
    case 'spark':
      return <svg {...common}><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>
    case 'store':
      return <svg {...common}><path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M7 14h4v6H7z"/><path d="M4 10c1.8 1.6 3.6 1.6 5.5 0 1.7 1.6 3.4 1.6 5 0 1.8 1.6 3.6 1.6 5.5 0"/></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'lock':
      return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
    case 'activity':
      return <svg {...common}><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>
    case 'fingerprint':
      return <svg {...common}><path d="M12 11a2 2 0 0 0-2 2v1"/><path d="M12 7a6 6 0 0 0-6 6v2"/><path d="M12 15v3"/><path d="M16 13a4 4 0 0 0-8 0v2"/><path d="M18 13a6 6 0 0 0-12 0v2"/><path d="M14 13a2 2 0 0 0-4 0v5"/></svg>
    case 'link':
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1.1l2-2A5 5 0 0 0 12 4l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>
    case 'scale':
      return <svg {...common}><path d="M12 3v18M5 6h14M7 6l-3 5a3 3 0 0 0 6 0zM17 6l-3 5a3 3 0 0 0 6 0zM5 21h14"/></svg>
  }
}
