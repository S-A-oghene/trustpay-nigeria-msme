import type { PaymentProviderAdapter } from './payment'
import { DemoPaymentProvider } from './mock-payment'
import { PaystackPaymentProvider } from './paystack'

export function paymentProvider(): PaymentProviderAdapter {
  const configured = process.env.PAYMENT_PROVIDER || 'demo'
  if (configured === 'paystack' && process.env.PAYSTACK_SECRET_KEY) return new PaystackPaymentProvider()
  return new DemoPaymentProvider()
}
