import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'

const stages = ['REQUESTED', 'OPENED', 'UPLOADED', 'RECEIVED', 'VALIDATING', 'VALIDATED', 'VERIFIED', 'ACCEPTED'] as const

export default async function DocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const doc = demoStore().documents.find(x => x.publicToken === token)
  if (!doc) notFound()
  const currentIndex = stages.indexOf(doc.status as typeof stages[number])

  return (
    <>
      <DemoBanner />
      <section className="page-head">
        <div>
          <div className="eyebrow">DOCUMENTCHASER · SECURE LINK</div>
          <h1>{doc.title}</h1>
          <p className="page-head-copy">Requested from <strong>{doc.requestedFrom}</strong> to help <strong>{doc.reason}</strong>. Due {new Date(doc.dueAt).toLocaleString('en-GB')}.</p>
        </div>
        <div className="page-head-actions"><StatusPill label={doc.status} tone={doc.status === 'ACCEPTED' || doc.status === 'VERIFIED' ? 'good' : doc.status === 'EXPIRED' || doc.status === 'REJECTED' ? 'bad' : 'warn'} /></div>
      </section>

      <section className="grid-12">
        <article className="surface">
          <div className="section-head"><div><div className="eyebrow">LIFECYCLE</div><h2>Evidence moves in steps</h2></div></div>
          <div className="timeline">
            {stages.map((stage, index) => (
              <div className="timeline-item" key={stage}>
                <div className={`timeline-dot ${index < currentIndex ? 'good' : index === currentIndex ? 'warn' : ''}`} />
                <div>
                  <div className="timeline-item-title">{stage}</div>
                  <div className="timeline-item-copy">
                    {index === currentIndex ? 'CURRENT STATE' : index < currentIndex ? 'Completed in a prior step' : 'Not reached'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid">
          <article className="surface">
            <div className="eyebrow">SUBMISSION BOUNDARY</div>
            <h3 className="sp-3">Upload is not verification.</h3>
            <p className="muted-tight sp-2">Validation checks basic structure/security. Verification is a separate evidence-backed decision.</p>
          </article>
          <article className="surface">
            <div className="eyebrow">ARTIFACT</div>
            <h3 className="sp-3">{doc.fileName || 'No artifact received'}</h3>
            {doc.fileName && <p className="muted-tight sp-2">Hash recorded: {doc.artifactHash}</p>}
            <div className={doc.fileName ? 'success sp-3' : 'warning sp-3'}>{doc.fileName ? 'Artifact received in simulation.' : 'No artifact has been submitted in this case.'}</div>
            <div className="actions"><a className="btn secondary compact" href={`/api/demo/document?token=${token}`}>Inspect simulated state <Icon name="arrow-up-right" size={14} /></a></div>
          </article>
        </div>
      </section>

      <div className="sticky-bottom">
        <div className="sticky-bottom-copy"><strong>Next action</strong><span>{doc.status === 'UPLOADED' ? 'Validate, then decide whether the evidence can be verified.' : 'Follow the lifecycle until the required evidence state is established.'}</span></div>
        <StatusPill label={doc.status} tone={doc.status === 'UPLOADED' ? 'warn' : 'info'} />
      </div>
    </>
  )
}
