import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

config({ path: '.env.local' })

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.APP_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () =>
  console.log(`\n🚀 API server → http://localhost:${PORT}\n`),
)
