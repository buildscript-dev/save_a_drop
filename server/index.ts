import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import rateLimit from 'express-rate-limit'

config({ path: '.env.local' })

const app  = express()
const PORT = process.env.PORT ?? 3001

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
})

app.use(limiter)
app.use(cors({ origin: process.env.APP_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/donations', (req, res) => {
  const { amount, vpa } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }
  console.log(`💰 Donation received: ₹${amount} from ${vpa}`);
  res.json({ success: true, message: 'Donation recorded' });
})

app.listen(PORT, () =>
  console.log(`\n🚀 API server → http://localhost:${PORT}\n`),
)
