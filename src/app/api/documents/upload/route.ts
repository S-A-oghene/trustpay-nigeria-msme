import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/lib/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { sha256, storagePath, validateDocumentContent, validateDocumentUpload } from '@/lib/server/providers/storage'
import { rateLimit, clientRateLimitKey } from '@/lib/server/rate-limit'

export const runtime='nodejs'

export async function POST(request:NextRequest){
  const form=await request.formData(); const token=String(form.get('token')||''); const file=form.get('file')
  if(!token||!(file instanceof File))return NextResponse.json({ok:false,error:'A secure document token and file are required.'},{status:400})
  if(token.length<16 && process.env.NEXT_PUBLIC_DEMO_MODE==='false')return NextResponse.json({ok:false,error:'Production document tokens must be high entropy.'},{status:400})
  const limit=rateLimit(clientRateLimitKey(request, `document:${token}`), 10, 60_000)
  if(!limit.allowed)return NextResponse.json({ok:false,error:'Too many document-upload attempts. Please retry later.'},{status:429,headers:{'Retry-After':String(limit.retryAfterSeconds)}})
  const validation=validateDocumentUpload({name:file.name,type:file.type,size:file.size,maxBytes:appConfig.maxDocumentBytes})
  if(!validation.ok)return NextResponse.json({ok:false,error:validation.error},{status:400})
  const bytes=await file.arrayBuffer()
  if(!validateDocumentContent(bytes,file.type))return NextResponse.json({ok:false,error:'File content does not match the declared type.'},{status:400})
  if(appConfig.demoMode)return NextResponse.json({ok:true,demo:true,status:'UPLOADED',artifactHash:await sha256(bytes),message:'DEMO / SIMULATED — file was not persisted to a live storage bucket.'})
  const supabase=createAdminClient()
  const {data:doc,error:docError}=await supabase.from('documents').select('id,tenant_id,status').eq('public_token',token).single()
  if(docError||!doc)return NextResponse.json({ok:false,error:'Document request not found.'},{status:404})
  if(['ACCEPTED','CANCELLED','EXPIRED'].includes(doc.status))return NextResponse.json({ok:false,error:'This document request is not accepting new files.'},{status:409})
  const hash=await sha256(bytes); const path=storagePath(doc.tenant_id,doc.id,file.name)
  const upload=await supabase.storage.from('private-documents').upload(path,bytes,{contentType:file.type,upsert:false})
  if(upload.error)return NextResponse.json({ok:false,error:'Upload failed.'},{status:502})
  const update=await supabase.from('documents').update({status:'UPLOADED',storage_path:path,artifact_hash:hash}).eq('id',doc.id)
  if(update.error)return NextResponse.json({ok:false,error:'File stored but control record update failed; preserve the storage path for incident reconciliation.'},{status:500})
  return NextResponse.json({ok:true,status:'UPLOADED',artifactHash:hash})
}
