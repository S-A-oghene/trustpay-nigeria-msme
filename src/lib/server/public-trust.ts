import { createPublicClient } from '@/lib/supabase/public'

export async function getProductionPublicTrustCard(token: string) {
  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc('get_public_trust_card', { p_token: token })
  if (error) throw new Error(`Public Trust Card lookup failed: ${error.message}`)
  return Array.isArray(data) ? data[0] : undefined
}
