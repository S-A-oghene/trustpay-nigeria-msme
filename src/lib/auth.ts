import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect('/login?reason=configuration')
  }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) redirect('/login')
  return data.claims
}


export async function requireUserApi() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return { claims: null, response: NextResponse.json({ok:false,error:'Authentication service is not configured.'},{status:503}) }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) return { claims: null, response: NextResponse.json({ok:false,error:'Authentication required.'},{status:401}) }
  return { claims: data.claims, response: null }
}
