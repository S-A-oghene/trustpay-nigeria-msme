import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/lib/config'
import { getDemoDocument } from '@/lib/demo/store'

export async function GET(request: NextRequest) {
  if (!appConfig.demoMode) {
    return NextResponse.json(
      { ok: false, error: 'Demo endpoint is disabled in production mode.' },
      { status: 404 },
    )
  }

  const token = request.nextUrl.searchParams.get('token') || ''
  const document = getDemoDocument(token)

  if (!document) {
    return NextResponse.json(
      { ok: false, error: 'Document request not found.' },
      { status: 404 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      demo: true,
      document,
      nextStates: [
        'OPENED',
        'UPLOADED',
        'RECEIVED',
        'VALIDATING',
        'VALIDATED',
        'VERIFIED',
        'ACCEPTED',
      ],
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
