import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const email = String(form.get('email') || '').trim()
  const password = String(form.get('password') || '')
  if (!email || !password) redirect('/login?error=missing')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=invalid')
  redirect('/dashboard')
}
