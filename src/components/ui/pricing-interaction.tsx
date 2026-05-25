import NumberFlow from "@number-flow/react"
import React from "react"

const tiers = [
  { name: "A Droplet", amount: 1,   label: "₹1",   description: "Clean water for one day" },
  { name: "A Stream",  amount: 25,  label: "₹25",  description: "Household filter — one week", popular: true },
  { name: "An Ocean",  amount: 100, label: "₹100", description: "Community well contribution" },
]

const quickPicks = ["1", "5", "25", "100"]

// Row height must match the h-[88px] indicator.
// text-xl line-height = 1.75rem = 28px
// text-base line-height = 1.5rem = 24px
// p-4 vertical = 32px   border-2 vertical = 4px
// total = 28 + 24 + 32 + 4 = 88px ✓
const ROW_H  = 88
const ROW_GAP = 12 // gap-3

export function PricingInteraction() {
  const [tab,      setTab]      = React.useState(0)   // 0 = ₹ Donate  1 = $ Custom
  const [selected, setSelected] = React.useState(1)   // active rupee tier index
  const [custom,   setCustom]   = React.useState("")  // free-input dollar amount

  return (
    <div className="border-2 border-zinc-800 rounded-[32px] p-3 shadow-2xl max-w-sm w-full flex flex-col items-center gap-3 bg-zinc-950">

      {/* ── Period toggle ── */}
      <div className="rounded-full relative w-full bg-zinc-900 p-1.5 flex items-center">
        <button
          type="button"
          className="font-semibold rounded-full w-full p-1.5 text-zinc-200 z-20 relative"
          onClick={() => setTab(0)}
        >
          ₹&nbsp;Donate
        </button>
        <button
          type="button"
          className="font-semibold rounded-full w-full p-1.5 text-zinc-200 z-20 relative"
          onClick={() => setTab(1)}
        >
          $&nbsp;Custom
        </button>

        {/* Sliding pill */}
        <div
          className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10 pointer-events-none"
          style={{ transform: `translateX(${tab * 100}%)`, transition: "transform 0.3s" }}
        >
          <div className="bg-zinc-700 shadow-sm rounded-full w-full h-full" />
        </div>
      </div>

      {/* ── Rupee tiers ── */}
      {tab === 0 && (
        <div className="w-full relative flex flex-col items-center justify-center gap-3">

          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className="w-full flex justify-between items-center cursor-pointer border-2 border-zinc-700 p-4 rounded-2xl"
              onClick={() => setSelected(i)}
            >
              <div className="flex flex-col items-start">
                {/* title row — must stay single line, same height as original */}
                <p className="font-semibold text-xl flex items-center gap-2 text-white leading-[1.75rem]">
                  {tier.name}
                  {tier.popular && (
                    <span className="py-1 px-2 inline-block rounded-lg bg-yellow-400/15 text-yellow-400 text-sm leading-5">
                      Popular
                    </span>
                  )}
                </p>
                {/* price row */}
                <p className="text-zinc-400 leading-[1.5rem]">
                  <span className="text-white font-medium">{tier.label}</span>
                  {" · "}
                  {tier.description}
                </p>
              </div>

              {/* Radio dot */}
              <div
                className="border-2 size-6 rounded-full ml-3 p-1 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selected === i ? "#ffffff" : "#52525b",
                  transition: "border-color 0.3s",
                }}
              >
                <div
                  className="size-3 bg-white rounded-full"
                  style={{ opacity: selected === i ? 1 : 0, transition: "opacity 0.3s" }}
                />
              </div>
            </div>
          ))}

          {/* Sliding highlight border */}
          <div
            className="w-full h-[88px] absolute top-0 border-[3px] border-white rounded-2xl pointer-events-none"
            style={{
              transform: `translateY(${selected * ROW_H + ROW_GAP * selected}px)`,
              transition: "transform 0.3s",
            }}
          />
        </div>
      )}

      {/* ── Custom dollar amount ── */}
      {tab === 1 && (
        <div className="w-full flex flex-col gap-3">
          {/* Input */}
          <div className="w-full border-2 border-zinc-700 rounded-2xl p-4 focus-within:border-zinc-500 transition-colors">
            <p className="text-zinc-500 text-xs mb-2 uppercase tracking-widest">Your amount</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-3xl font-light select-none">$</span>
              <input
                type="number"
                min="0.99"
                step="0.01"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-white text-3xl font-light w-full outline-none placeholder:text-zinc-700"
              />
            </div>
            <p className="text-zinc-700 text-xs mt-2">Minimum $0.99 · Any currency accepted</p>
          </div>

          {/* Quick-pick buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickPicks.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCustom(amt)}
                className={[
                  "border rounded-xl py-2 text-sm font-medium transition-colors duration-200",
                  custom === amt
                    ? "border-white text-white bg-zinc-800"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
                ].join(" ")}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <button
        type="button"
        className="rounded-full bg-white text-black font-semibold text-lg w-full p-3 active:scale-95 transition-transform duration-300 hover:bg-zinc-100"
      >
        Donate Now
      </button>
    </div>
  )
}
