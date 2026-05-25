import { Router, type Request, type Response } from 'express'
import { createHmac } from 'crypto'

export const razorpayWebhookRouter = Router()

// POST /api/webhooks/razorpay
razorpayWebhookRouter.post('/', (req: Request, res: Response) => {
  const secret      = process.env.RAZORPAY_WEBHOOK_SECRET
  const receivedSig = req.headers['x-razorpay-signature'] as string

  if (!secret) {
    console.error('[razorpay webhook] RAZORPAY_WEBHOOK_SECRET is not set')
    res.status(500).json({ error: 'Server misconfiguration' })
    return
  }

  const expected = createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (expected !== receivedSig) {
    console.warn('[razorpay webhook] signature mismatch')
    res.status(400).json({ error: 'Invalid signature' })
    return
  }

  const event = req.body as {
    event: string
    payload: { payment: { entity: Record<string, unknown> } }
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity

    const donation = {
      provider:       'razorpay',
      amount:         Number(payment.amount) / 100,
      currency:       payment.currency as string,
      payment_status: 'completed',
      donor_email:    (payment.email as string) ?? null,
      payment_id:     payment.id as string,
    }

    console.log('[razorpay webhook] payment captured:', donation)

    // ── Optional Supabase insert ──────────────────────────────────────────────
    // await supabase.from('donations').insert(donation)
  }

  res.json({ received: true })
})
