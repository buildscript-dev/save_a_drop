import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { stripeRouter } from './routes/stripe.js'
import { razorpayRouter } from './routes/razorpay.js'
import { stripeWebhookRouter } from './routes/webhooks/stripe.js'
import { razorpayWebhookRouter } from './routes/webhooks/razorpay.js'

config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT ?? 3001

// ── Webhooks need raw body — register BEFORE json middleware ──────────────────
app.use(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookRouter,
)

app.use(
  '/api/webhooks/razorpay',
  express.json(),
  razorpayWebhookRouter,
)

// ── Standard middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.APP_URL ?? 'http://localhost:5173' }))
app.use(express.json())

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/stripe',    stripeRouter)
app.use('/api/razorpay',  razorpayRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () =>
  console.log(`\n🚀 API server → http://localhost:${PORT}\n`),
)
