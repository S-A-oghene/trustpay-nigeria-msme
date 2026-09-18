import { NextRequest, NextResponse } from 'next/server'
import { getDemoDocument } from '@/lib/demo/store'

export async function GET(request: NextRequest){ const token=request.nextUrl.searchParams.get('token')||''; const doc=getDemoDocument(token); if(!doc)return NextResponse.json({ok:false,error:'Document request not found.'},{status:404}); return NextResponse.json({ok:true,demo:true,document:doc,nextStates:['OPENED','UPLOADED','RECEIVED','VALIDATING','VALIDATED','VERIFIED','ACCEPTED']}) }
