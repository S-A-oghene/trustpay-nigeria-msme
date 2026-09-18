import { createHash, randomUUID } from 'node:crypto'

export function sanitizeFileName(name:string){
  const cleaned=name.replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,120)
  return cleaned || 'upload.bin'
}

export function validateDocumentUpload(input:{name:string;type:string;size:number;maxBytes:number}){
  const allowed=new Set(['application/pdf','image/jpeg','image/png','image/webp','text/plain'])
  const ext=/\.([a-zA-Z0-9]+)$/.exec(input.name)?.[1]?.toLowerCase()||''
  const allowedExt=new Set(['pdf','jpg','jpeg','png','webp','txt'])
  if(input.size<=0)return {ok:false,error:'Empty files are not accepted.'}
  if(input.size>input.maxBytes)return {ok:false,error:'File exceeds the configured maximum size.'}
  if(!allowed.has(input.type)||!allowedExt.has(ext))return {ok:false,error:'File type is not allowed.'}
  return {ok:true}
}

export async function sha256(buffer:ArrayBuffer){
  return createHash('sha256').update(Buffer.from(buffer)).digest('hex')
}

export function storagePath(tenantId:string, documentId:string, name:string){
  return `${tenantId}/${documentId}/${randomUUID()}-${sanitizeFileName(name)}`
}

export function validateDocumentContent(bytes: ArrayBuffer, mimeType: string) {
  const view = new Uint8Array(bytes).subarray(0, 12)
  const text = new TextDecoder().decode(view)
  if (mimeType === 'application/pdf') return text.startsWith('%PDF-')
  if (mimeType === 'image/png') return view.length >= 8 && view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4e && view[3] === 0x47
  if (mimeType === 'image/jpeg') return view.length >= 3 && view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff
  if (mimeType === 'image/webp') return text.slice(0,4) === 'RIFF' && text.slice(8,12) === 'WEBP'
  return mimeType === 'text/plain'
}
