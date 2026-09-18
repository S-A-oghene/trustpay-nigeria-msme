import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig } from '@/lib/config'

const lifecycle = [
  'REQUESTED',
  'OPENED',
  'UPLOADED',
  'RECEIVED',
  'VALIDATING',
  'VALIDATED',
  'VERIFIED',
  'ACCEPTED',
] as const

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  if (!appConfig.demoMode) {
    notFound()
  }

  const document = demoStore().documents.find((item) => item.publicToken === token)

  if (!document) {
    notFound()
  }

  const currentIndex = lifecycle.indexOf(document.status as (typeof lifecycle)[number])

  return (
    <>
      <DemoBanner />

      <section className="section card">
        <div className="eyebrow">DOCUMENTCHASER · SECURE LINK</div>
        <h1>{document.title}</h1>
        <p>
          Requested from: <strong>{document.requestedFrom}</strong>
        </p>
        <p>Why: {document.reason}</p>
        <p>Due: {new Date(document.dueAt).toLocaleString('en-GB')}</p>

        <StatusPill
          label={document.status}
          tone={
            document.status === 'ACCEPTED' || document.status === 'VERIFIED'
              ? 'good'
              : document.status === 'EXPIRED' || document.status === 'REJECTED'
                ? 'bad'
                : 'warn'
          }
        />
      </section>

      <section className="section grid-2">
        <div className="card">
          <h2>Lifecycle</h2>

          <div className="timeline">
            {lifecycle.map((state, index) => (
              <div className="timeline-item" key={state}>
                <div>{state}</div>
                <div>
                  {document.status === state ? (
                    <StatusPill label="CURRENT" tone="good" />
                  ) : index < currentIndex ? (
                    <span className="muted">Completed in a prior step</span>
                  ) : (
                    <span className="muted">Not reached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Submission boundary</h2>
          <p className="muted">
            A document can be uploaded without proving its contents are true.
            Validation checks basic structure/security; verification is a separate evidence-backed decision.
          </p>

          {document.fileName && (
            <div className="success">
              <strong>Artifact received:</strong> {document.fileName}
              <br />
              Hash recorded: {document.artifactHash}
            </div>
          )}

          <div className="actions">
            <a className="btn" href={`/api/demo/document?token=${token}`}>
              Inspect simulated document state
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
