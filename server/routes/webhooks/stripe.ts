import { Router, type Request, type Response } from 'express'
import Stripe from 'stripe'

export const stripeWebhookRouter = Router()

// POST /api/webhooks/stripe
// Body is raw Buffer (registered with express.raw in server/index.ts)
stripeWebhookRouter.post('/', async (req: Request, res: Response) => {
  const sig    = req.headers['stripe-signature'] as string
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set')
    res.status(500).send('Server misconfiguration')
    return
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bad request'
    console.error('[stripe webhook] signature verification failed:', msg)
    res.status(400).send(`Webhook error: ${msg}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const donation = {
      provider:       'stripe',
      amount:         (session.amount_total ?? 0) / 100,
      currency:       session.currency ?? 'usd',
      payment_status: 'completed',
      donor_email:    session.customer_details?.email ?? null,
      session_id:     session.id,
    }

    console.log('[stripe webhook] payment completed:', donation)

    // ── Optional Supabase insert ──────────────────────────────────────────────
    // import { createClient } from '@supabase/supabase-js'
    // const supabase = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_KEY!
    // )
    // await supabase.from('donations').insert(donation)
  }

  res.json({ received: true })
})
