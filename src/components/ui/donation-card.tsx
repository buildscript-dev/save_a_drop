import React from "react"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

const tiers = [
  { name: "A Droplet", amount: 1,   label: "₹1",   description: "Clean water for one day" },
  { name: "A Stream",  amount: 25,  label: "₹25",  description: "Household filter — one week", popular: true },
  { name: "An Ocean",  amount: 100, label: "₹100", description: "Community well contribution" },
]

const METHODS = ["UPI", "GPay", "PhonePe", "Paytm", "BHIM", "Cards"]

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("rzp-js")) { resolve(); return }
    const s   = document.createElement("script")
    s.id      = "rzp-js"
    s.src     = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Razorpay"))
    document.body.appendChild(s)
  })
}

// ── Success overlay ───────────────────────────────────────────────────────────

function SuccessState({
  amount,
  onReset,
}: {
  amount: number
  onReset: () => void
}) {
  return (
    <div className="relative border border-zinc-800/60 rounded-[28px] p-8 w-full max-w-sm bg-zinc-950 flex flex-col items-center gap-6 overflow-hidden text-center card-glow">
      {/* ambient glow behind orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full success-ambient" />
      </div>

      {/* ripple rings */}
      <div className="relative flex items-center justify-center mt-4">
        <div className="absolute w-28 h-28 rounded-full border border-white/10 ripple-ring ripple-1" />
        <div className="absolute w-20 h-20 rounded-full border border-white/15 ripple-ring ripple-2" />
        <div className="absolute w-14 h-14 rounded-full border border-white/20 ripple-ring ripple-3" />

        {/* orb */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center orb-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z"
              fill="rgba(180,220,255,0.9)"
            />
          </svg>
        </div>
      </div>

      {/* copy */}
      <div className="relative z-10 success-text-rise">
        <p className="text-white text-2xl font-light tracking-tight">
          Thank&nbsp;you
        </p>
        <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
          Your&nbsp;
          <span className="text-white font-medium">₹{amount}</span>
          &nbsp;brings clean water closer.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="relative z-10 text-zinc-600 text-xs tracking-widest uppercase hover:text-zinc-400 transition-colors duration-300"
      >
        Donate again
      </button>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function DonationCard() {
  const [selected,   setSelected]   = React.useState(1)
  const [custom,     setCustom]     = React.useState("")
  const [loading,    setLoading]    = React.useState(false)
  const [success,    setSuccess]    = React.useState(false)
  const [paidAmount, setPaidAmount] = React.useState(0)
  const [error,      setError]      = React.useState<string | null>(null)

  async function handleDonate() {
    const amount = custom.trim() ? parseFloat(custom) : tiers[selected].amount
    if (!amount || isNaN(amount) || amount < 1) {
      setError("Minimum amount is ₹1")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await loadRazorpay()

      const res = await fetch("/api/razorpay", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount }),
      })
      if (!res.ok) throw new Error("Could not create order")
      const order = await res.json() as { id: string; amount: number; currency: string }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id:    order.id,
          amount:      order.amount,
          currency:    order.currency,
          name:        "Orate Love",
          description: custom.trim()
            ? `Custom donation — ₹${amount}`
            : tiers[selected].description,
          theme: { color: "#18181b" },
          modal: {
            backdropclose: false,
            escape:        false,
            animation:     true,
            ondismiss:     () => reject(new Error("cancelled")),
          },
          handler: async (response: {
            razorpay_order_id:   string
            razorpay_payment_id: string
            razorpay_signature:  string
          }) => {
            try {
              const vr = await fetch("/api/razorpay/verify", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(response),
              })
              const { verified } = await vr.json() as { verified: boolean }
              if (verified) resolve()
              else reject(new Error("Payment verification failed"))
            } catch (e) { reject(e) }
          },
        })
        rzp.open()
      })

      setPaidAmount(amount)
      setSuccess(true)
    } catch (e) {
      if (e instanceof Error && e.message !== "cancelled")
        setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <SuccessState
        amount={paidAmount}
        onReset={() => { setSuccess(false); setCustom(""); setPaidAmount(0) }}
      />
    )
  }

  return (
    <div className="border border-zinc-800/60 rounded-[28px] p-4 shadow-2xl max-w-sm w-full flex flex-col gap-3 bg-zinc-950">

      {/* ── Header ── */}
      <div className="px-1 pt-1 pb-0.5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-1">
          India · Secure Payments
        </p>
        <p className="text-white text-xl font-light tracking-tight">
          Support clean water
        </p>
      </div>

      {/* ── Tier rows ── */}
      <div className="flex flex-col gap-2.5">
        {tiers.map((tier, i) => {
          const active = selected === i && !custom.trim()
          return (
            <div
              key={tier.name}
              onClick={() => { setSelected(i); setCustom(""); setError(null) }}
              className="flex justify-between items-center cursor-pointer p-4 rounded-2xl transition-all duration-300"
              style={{
                border:     `1.5px solid ${active ? "rgba(255,255,255,0.7)" : "rgba(63,63,70,0.7)"}`,
                background: active ? "rgba(255,255,255,0.04)" : "transparent",
                boxShadow:  active ? "0 0 24px rgba(200,230,255,0.07)" : "none",
              }}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-white font-medium text-base flex items-center gap-2 flex-wrap">
                  {tier.name}
                  {tier.popular && (
                    <span className="text-[10px] uppercase tracking-widest text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5">
                      Popular
                    </span>
                  )}
                </p>
                <p className="text-zinc-500 text-sm">
                  <span className="text-zinc-300">{tier.label}</span>
                  {" · "}
                  {tier.description}
                </p>
              </div>

              <div
                className="flex-shrink-0 ml-3 size-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                style={{ borderColor: active ? "#fff" : "#52525b" }}
              >
                <div
                  className="size-2.5 rounded-full bg-white transition-all duration-300"
                  style={{ opacity: active ? 1 : 0, transform: `scale(${active ? 1 : 0.4})` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Custom amount ── */}
      <div
        className="flex items-center gap-2 border rounded-2xl px-4 py-3 transition-all duration-300"
        style={{
          borderColor: custom.trim() ? "rgba(255,255,255,0.55)" : "rgba(63,63,70,0.7)",
          background:  custom.trim() ? "rgba(255,255,255,0.04)" : "transparent",
        }}
      >
        <span className="text-zinc-500 text-base select-none">₹</span>
        <input
          type="number"
          min="1"
          step="1"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setError(null) }}
          placeholder="Custom amount"
          className="bg-transparent text-white text-base w-full outline-none placeholder:text-zinc-700"
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="text-red-400/90 text-xs tracking-wide px-1">{error}</p>
      )}

      {/* ── CTA ── */}
      <button
        type="button"
        disabled={loading}
        onClick={handleDonate}
        className="relative overflow-hidden rounded-full bg-white text-zinc-950 font-medium text-base w-full py-3 transition-all duration-300 hover:bg-zinc-100 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="size-4 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          "Donate Now"
        )}
      </button>

      {/* ── Payment methods ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-1 pb-1">
        {METHODS.map((m) => (
          <span
            key={m}
            className="text-[10px] text-zinc-600 border border-zinc-800 rounded-md px-2 py-0.5 tracking-wide"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}
