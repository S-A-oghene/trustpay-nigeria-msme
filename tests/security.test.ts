import { describe, expect, it } from 'vitest'
import crypto from 'node:crypto'
import { PaystackPaymentProvider } from '@/lib/server/providers/paystack'

describe('webhook security boundary',()=>{
  it('rejects missing Paystack signatures',()=>{
    const p=new PaystackPaymentProvider()
    expect(p.verifyWebhookSignature('{"event":"charge.success"}',null)).toBe(false)
  })
  it('uses HMAC SHA512 and timing-safe comparison when a secret is available',()=>{
    process.env.PAYSTACK_SECRET_KEY='unit-test-secret'
    const body='{"event":"charge.success","data":{"reference":"abc"}}'
    const signature=crypto.createHmac('sha512','unit-test-secret').update(body).digest('hex')
    const p=new PaystackPaymentProvider()
    expect(p.verifyWebhookSignature(body,signature)).toBe(true)
    expect(p.verifyWebhookSignature(body,signature.slice(0,-1)+'0')).toBe(false)
    delete process.env.PAYSTACK_SECRET_KEY
  })
})
