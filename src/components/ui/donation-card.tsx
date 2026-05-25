import React from "react"

const VPA  = import.meta.env.VITE_UPI_VPA  as string
const NAME = import.meta.env.VITE_UPI_NAME as string

const tiers = [
  { name: "A Droplet", amount: 1,   label: "₹1",   description: "Clean water for one day" },
  { name: "A Stream",  amount: 25,  label: "₹25",  description: "Household filter — one week", popular: true },
  { name: "An Ocean",  amount: 100, label: "₹100", description: "Community well contribution" },
]

function upiLink(amount: number, app?: "gpay" | "phonepe" | "paytm") {
  const base = `pa=${encodeURIComponent(VPA)}&pn=${encodeURIComponent(NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Donation - Orate Love")}`
  if (app === "gpay")    return `tez://upi/pay?${base}`
  if (app === "phonepe") return `phonepe://pay?${base}`
  if (app === "paytm")   return `paytmmp://pay?${base}`
  return `upi://pay?${base}`
}

function qrUrl(amount: number) {
  const data = encodeURIComponent(upiLink(amount))
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&color=ffffff&bgcolor=18181b&data=${data}`
}

const UPI_APPS = [
  { id: "gpay"    as const, label: "G Pay" },
  { id: "phonepe" as const, label: "PhonePe" },
  { id: "paytm"   as const, label: "Paytm" },
  { id: undefined,          label: "BHIM / Other" },
]

// ── Success ───────────────────────────────────────────────────────────────────

function SuccessState({ amount, onReset }: { amount: number; onReset(): void }) {
  return (
    <div className="relative border border-zinc-800/60 rounded-[28px] p-8 w-full max-w-sm bg-zinc-950 flex flex-col items-center gap-6 overflow-hidden text-center card-glow">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full success-ambient" />
      </div>

      <div className="relative flex items-center justify-center mt-4">
        <div className="absolute w-28 h-28 rounded-full border border-white/10 ripple-ring ripple-1" />
        <div className="absolute w-20 h-20 rounded-full border border-white/15 ripple-ring ripple-2" />
        <div className="absolute w-14 h-14 rounded-full border border-white/20 ripple-ring ripple-3" />
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center orb-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" fill="rgba(180,220,255,0.9)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 success-text-rise">
        <p className="text-white text-2xl font-light tracking-tight">Thank you</p>
        <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
          Your&nbsp;<span className="text-white font-medium">₹{amount}</span>&nbsp;brings clean water closer.
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

// ── Pay sheet ─────────────────────────────────────────────────────────────────

function PaySheet({
  amount,
  onPaid,
  onBack,
}: {
  amount: number
  onPaid(): void
  onBack(): void
}) {
  function openApp(app?: "gpay" | "phonepe" | "paytm") {
    window.location.href = upiLink(amount, app)
  }

  return (
    <div className="border border-zinc-800/60 rounded-[28px] p-5 shadow-2xl max-w-sm w-full flex flex-col gap-4 bg-zinc-950">

      {/* Header */}
      <div className="flex items-center gap-3 px-1 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
          aria-label="Back"
        >
          ←
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">UPI Payment</p>
          <p className="text-white text-lg font-light">
            Donating&nbsp;<span className="font-medium">₹{amount}</span>
          </p>
        </div>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 p-1">
          <img
            src={qrUrl(amount)}
            alt="UPI QR code"
            width={180}
            height={180}
            className="block rounded-xl"
          />
        </div>
        <p className="text-zinc-600 text-xs tracking-wide">Scan with any UPI app</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-700 text-xs tracking-widest uppercase">or open app</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* App buttons */}
      <div className="grid grid-cols-2 gap-2">
        {UPI_APPS.map(({ id, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => openApp(id)}
            className="border border-zinc-800 rounded-xl py-2.5 text-sm text-zinc-300 hover:border-zinc-600 hover:text-white hover:bg-zinc-900 transition-all duration-200 active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Confirm */}
      <button
        type="button"
        onClick={onPaid}
        className="rounded-full bg-white text-zinc-950 font-medium text-base w-full py-3 transition-all duration-300 hover:bg-zinc-100 active:scale-[0.97]"
      >
        I've paid ✓
      </button>

      <p className="text-zinc-700 text-xs text-center pb-1">
        UPI ID&nbsp;·&nbsp;{VPA || "Not Configured"}
      </p>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function DonationCard({ initialAmount }: { initialAmount?: number }) {
  const [stage,   setStage]   = React.useState<"select" | "pay" | "success">(initialAmount ? "pay" : "select")
  const [selected, setSelected] = React.useState(1)
  const [custom,   setCustom]   = React.useState("")
  const [amount,   setAmount]   = React.useState(initialAmount ?? 0)
  const [error,    setError]    = React.useState<string | null>(null)

  function handleDonate() {
    if (!VPA || !NAME) {
      setError("Payment configuration is missing. Please contact support.");
      return;
    }
    const val = custom.trim() ? parseFloat(custom) : tiers[selected].amount
    if (!val || isNaN(val) || val < 1) { setError("Minimum amount is ₹1"); return }
    setAmount(val)
    setStage("pay")
  }

  if (stage === "success") {
    return (
      <SuccessState
        amount={amount}
        onReset={() => { setStage("select"); setCustom(""); setAmount(0) }}
      />
    )
  }

  if (stage === "pay") {
    return (
      <PaySheet
        amount={amount}
        onPaid={async () => {
          try {
            await fetch('/api/donations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, vpa: VPA }),
            });
          } catch (e) {
            console.error("Failed to log donation", e);
          }
          setStage("success");
        }}
        onBack={() => setStage("select")}
      />
    )
  }

  return (
    <div className="border border-zinc-800/60 rounded-[28px] p-4 shadow-2xl max-w-sm w-full flex flex-col gap-3 bg-zinc-950">

      {/* Header */}
      <div className="px-1 pt-1 pb-0.5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-1">India · UPI</p>
        <p className="text-white text-xl font-light tracking-tight">Support clean water</p>
      </div>

      {/* Tier rows */}
      <div className="flex flex-col gap-2.5">
        {tiers.map((tier, i) => {
          const active = selected === i && !custom.trim()
          return (
            <div
              key={tier.name}
              onClick={() => { setSelected(i); setCustom(""); setError(null) }}
              className={`flex justify-between items-center cursor-pointer p-4 rounded-2xl transition-all duration-300 border ${active ? "border-white/70 bg-white/5 shadow-[0_0_24px_rgba(200,230,255,0.07)]" : "border-zinc-700/70 bg-transparent"}`}
            >
              <div className="flex flex-col gap-0.5">
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
                className={`flex-shrink-0 ml-3 size-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? "border-white" : "border-zinc-700"}`}
              >
                <div
                  className={`size-2.5 rounded-full bg-white transition-all duration-300 ${active ? "opacity-100 scale-100" : "opacity-0 scale-40"}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom amount */}
      <div
        className={`flex items-center gap-2 border rounded-2xl px-4 py-3 transition-all duration-300 ${custom.trim() ? "border-white/55 bg-white/5" : "border-zinc-700/70 bg-transparent"}`}
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

      {error && <p className="text-red-400/90 text-xs px-1">{error}</p>}

      {/* CTA */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-zinc-600 text-[10px] text-center uppercase tracking-widest">
          UPI ID: {VPA || "Not Configured"}
        </p>
        <button
          type="button"
          onClick={handleDonate}
          className="rounded-full bg-white text-zinc-950 font-medium text-base w-full py-3 transition-all duration-300 hover:bg-zinc-100 active:scale-[0.97]"
        >
          Pay with UPI
        </button>
      </div>


      {/* Method hints */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-1 pb-1">
        {["G Pay", "PhonePe", "Paytm", "BHIM", "Any UPI"].map((m) => (
          <span key={m} className="text-[10px] text-zinc-600 border border-zinc-800 rounded-md px-2 py-0.5 tracking-wide">
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}
