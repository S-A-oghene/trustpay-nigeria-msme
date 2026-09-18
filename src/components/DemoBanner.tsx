import Link from 'next/link'
import { Icon } from './Icon'

export function DemoBanner() {
  return (
    <div className="demo-banner" role="status">
      <div className="demo-banner-copy">
        <span className="demo-badge"><Icon name="spark" size={11} /> Demo</span>
        <span>
          <strong>Simulated environment.</strong> No live funds, live identity result, registry result, or production provider confirmation is used here.
        </span>
      </div>
      <Link className="btn secondary compact" href="/demo">Open demo control room <Icon name="arrow-up-right" size={14} /></Link>
    </div>
  )
}
