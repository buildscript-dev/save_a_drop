import { Router, type Request, type Response } from 'express'
import Razorpay from 'razorpay'
import { createHmac } from 'crypto'

export const razorpayRouter = Router()

function getRazorpay() {
  const key_id     = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret)
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set')
  return new Razorpay({ key_id, key_secret })
}

// POST /api/razorpay — create order
razorpayRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body as { amount: number }

    if (!amount || isNaN(amount) || amount < 1) {
      res.status(400).json({ error: 'Minimum amount is ₹1' })
      return
    }

    const instance = getRazorpay()

    const order = await instance.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    { source: 'orate_love_donation' },
    })

    res.json({
      id:       order.id,
      amount:   order.amount,
      currency: order.currency,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay] create order error:', message)
    res.status(500).json({ error: message })
  }
})

// POST /api/razorpay/verify — verify payment signature
razorpayRouter.post('/verify', (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' })
      return
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body as Record<string, string>

    const expected = createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected === razorpay_signature) {
      console.log('[razorpay] payment verified:', razorpay_payment_id)
      res.json({ verified: true })
    } else {
      console.warn('[razorpay] signature mismatch:', razorpay_payment_id)
      res.status(400).json({ verified: false, error: 'Invalid signature' })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})
