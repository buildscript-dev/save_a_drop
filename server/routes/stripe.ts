import { Router, type Request, type Response } from 'express'
import Stripe from 'stripe'

export const stripeRouter = Router()

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2023-10-16' })
}

// POST /api/stripe — create checkout session, return redirect URL
stripeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body as { amount: number }

    if (!amount || isNaN(amount) || amount < 0.99) {
      res.status(400).json({ error: 'Minimum amount is $0.99' })
      return
    }

    const stripe = getStripe()
    const appUrl = process.env.APP_URL ?? 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Water Donation — Orate Love',
              description:
                'Every drop counts. Your contribution helps provide clean water worldwide.',
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}?payment=cancelled`,
      payment_intent_data: {
        metadata: { source: 'orate_love_donation' },
      },
    })

    res.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe] create session error:', message)
    res.status(500).json({ error: message })
  }
})
