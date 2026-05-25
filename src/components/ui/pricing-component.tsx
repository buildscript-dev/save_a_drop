import { useState } from "react"
import { Heart, Globe } from "lucide-react"

const inter = "'Inter', system-ui, sans-serif"

// ── Icons — matching prompt's className-prop API, adapted for dark backgrounds ──

const LightCheckIcon = ({ className = "" }: { className?: string }) => (
    <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="8" cy="8" r="8" style={{ fill: "rgba(255,255,255,0.15)" }} />
        <path
            d="M5.5 8.5L7 10L11 6"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const DarkCheckIcon = ({ className = "" }: { className?: string }) => (
    <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="8" cy="8" r="7.5" style={{ stroke: "rgba(96,165,250,0.45)" }} />
        <path
            d="M5.5 8.5L7 10L11 6"
            stroke="rgb(147,197,253)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// ── Toggle — matching prompt's Tailwind ring-1 ring-inset approach ──

const ToggleSwitch = ({
    enabled,
    onChange,
    label,
}: {
    enabled: boolean
    onChange: (v: boolean) => void
    label: string
}) => (
    <div className="flex items-center gap-3">
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                "ring-1 ring-inset",
                enabled
                    ? "bg-neutral-100 ring-neutral-300"
                    : "bg-neutral-800 ring-neutral-700",
            ].join(" ")}
            aria-pressed={enabled}
            aria-label={label}
        >
            <span
                className={[
                    "inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                    enabled ? "translate-x-6 bg-neutral-900" : "translate-x-1 bg-neutral-500",
                ].join(" ")}
            />
        </button>
        <span className="text-sm text-neutral-400" style={{ fontFamily: inter }}>
            {label}
        </span>
    </div>
)

// ── Data ──────────────────────────────────────────────────────────────────────

const indiaFeatures = ["Clean water projects", "Transparent donations", "Local impact", "Community driven"]
const globalFeatures = ["Worldwide access", "Secure payments", "Carbon offsetting", "Trusted transparency"]

const impactStats = [
    { value: "2.1M+", label: "People served" },
    { value: "47", label: "Countries reached" },
    { value: "100%", label: "Direct to cause" },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingCards() {
    const [indiaMonthly, setIndiaMonthly] = useState(false)
    const [globalMonthly, setGlobalMonthly] = useState(false)

    return (
        <section
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
            style={{ padding: "6rem 1.5rem 5rem", pointerEvents: "auto" }}
        >
            {/* Ambient glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: "700px",
                    height: "700px",
                    borderRadius: "9999px",
                    background: "rgba(59,130,246,0.07)",
                    filter: "blur(160px)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* ── Header ── */}
            <div
                className="relative z-10 text-center"
                style={{ marginBottom: "5rem", maxWidth: "720px" }}
            >
                <h1
                    style={{
                        fontFamily: inter,
                        fontWeight: 200,
                        textTransform: "uppercase",
                        letterSpacing: "0.3em",
                        lineHeight: 1.05,
                        fontSize: "clamp(2.8rem, 9vw, 6rem)",
                        color: "white",
                        marginBottom: "1.5rem",
                    }}
                >
                    Save A Drop
                </h1>

                <div
                    style={{
                        width: "40px",
                        height: "1px",
                        background: "rgba(255,255,255,0.2)",
                        margin: "0 auto 1.5rem",
                    }}
                />

                <p
                    style={{
                        fontFamily: inter,
                        fontWeight: 300,
                        fontSize: "1.05rem",
                        lineHeight: 1.75,
                        color: "rgba(255,255,255,0.38)",
                        maxWidth: "460px",
                        margin: "0 auto",
                    }}
                >
                    Every contribution helps preserve clean water and support
                    future sustainability projects worldwide.
                </p>
            </div>

            {/* ── Cards ── */}
            <div
                className="relative z-10 grid grid-cols-1 md:grid-cols-2 w-full"
                style={{ maxWidth: "900px", gap: "2rem" }}
            >

                {/* ─ India card ─ */}
                <div
                    className="rounded-[33px] p-[1px]"
                    style={{
                        background: "linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)",
                    }}
                >
                    <div
                        className="rounded-3xl p-2"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        {/* Top panel — title + price + CTA */}
                        <div
                            className="rounded-2xl p-8 mb-2"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2
                                        className="text-3xl font-bold tracking-tight"
                                        style={{ fontFamily: inter, color: "white" }}
                                    >
                                        India
                                    </h2>
                                    <p
                                        className="text-base leading-relaxed mt-1"
                                        style={{ fontFamily: inter, color: "rgba(255,255,255,0.4)" }}
                                    >
                                        Support locally, starting from ₹1
                                    </p>
                                </div>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        borderRadius: "9999px",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        background: "rgba(255,255,255,0.06)",
                                        padding: "4px 12px",
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.55)",
                                        fontFamily: inter,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Most Friendly
                                </span>
                            </div>

                            <div className="flex items-baseline mb-8">
                                <span
                                    className="price-shimmer"
                                    style={{
                                        fontFamily: inter,
                                        fontSize: "3.5rem",
                                        fontWeight: 200,
                                        letterSpacing: "-0.04em",
                                        lineHeight: 1,
                                    }}
                                >
                                    ₹1
                                </span>
                                <span
                                    className="text-lg ml-1"
                                    style={{ fontFamily: inter, color: "rgba(255,255,255,0.35)" }}
                                >
                                    /minimum
                                </span>
                            </div>

                            <button
                                className={[
                                    "w-full rounded-xl font-semibold text-base py-4",
                                    "bg-neutral-900 text-white",
                                    "hover:opacity-95 transition-opacity duration-200",
                                    "flex items-center justify-center gap-2.5",
                                    "shadow-[0_4px_18px_-6px_rgba(0,0,0,0.4)]",
                                    "ring-1 ring-inset ring-neutral-900/10",
                                ].join(" ")}
                                style={{ fontFamily: inter, cursor: "pointer" }}
                            >
                                Donate Now
                                <Heart className="w-5 h-5 text-neutral-300" />
                            </button>
                        </div>

                        {/* Bottom panel — features + toggle */}
                        <div
                            className="px-6 pb-6 pt-4 rounded-2xl"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                {indiaFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <LightCheckIcon className="w-4 h-4 flex-shrink-0" />
                                        <span
                                            className="text-sm font-medium"
                                            style={{ fontFamily: inter, color: "rgba(255,255,255,0.65)" }}
                                        >
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <ToggleSwitch
                                    enabled={indiaMonthly}
                                    onChange={setIndiaMonthly}
                                    label="Monthly support"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─ Global card (featured + animated glow) ─ */}
                <div
                    className="card-glow rounded-[33px] p-[1px]"
                    style={{
                        background: "linear-gradient(160deg, rgba(96,165,250,0.55) 0%, rgba(96,165,250,0.05) 100%)",
                    }}
                >
                    <div
                        className="rounded-3xl p-2"
                        style={{
                            background: "rgba(11,18,32,0.82)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        {/* Top panel — title + price + CTA */}
                        <div
                            className="rounded-2xl p-8 mb-2"
                            style={{
                                background: "rgba(11,18,32,0.8)",
                                border: "1px solid rgba(96,165,250,0.15)",
                            }}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2
                                        className="text-3xl font-bold tracking-tight"
                                        style={{ fontFamily: inter, color: "white" }}
                                    >
                                        Global
                                    </h2>
                                    <p
                                        className="text-base leading-relaxed mt-1"
                                        style={{ fontFamily: inter, color: "rgba(255,255,255,0.38)" }}
                                    >
                                        International donations from $0.99
                                    </p>
                                </div>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        borderRadius: "9999px",
                                        border: "1px solid rgba(96,165,250,0.4)",
                                        background: "rgba(96,165,250,0.12)",
                                        padding: "4px 12px",
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        color: "rgba(147,197,253,0.9)",
                                        fontFamily: inter,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Best Impact
                                </span>
                            </div>

                            <div className="flex items-baseline mb-8">
                                <span
                                    className="price-shimmer"
                                    style={{
                                        fontFamily: inter,
                                        fontSize: "3.5rem",
                                        fontWeight: 200,
                                        letterSpacing: "-0.04em",
                                        lineHeight: 1,
                                    }}
                                >
                                    $0.99
                                </span>
                                <span
                                    className="text-lg ml-1"
                                    style={{ fontFamily: inter, color: "rgba(255,255,255,0.3)" }}
                                >
                                    /minimum
                                </span>
                            </div>

                            <button
                                className={[
                                    "w-full rounded-xl font-semibold text-base py-4",
                                    "bg-white text-neutral-900",
                                    "hover:opacity-95 transition-opacity duration-200",
                                    "flex items-center justify-center gap-2.5",
                                    "shadow-[0_4px_18px_-6px_rgba(255,255,255,0.35)]",
                                    "ring-1 ring-inset ring-white/30",
                                ].join(" ")}
                                style={{ fontFamily: inter, cursor: "pointer" }}
                            >
                                Support Water
                                <Globe className="w-5 h-5 text-neutral-600" />
                            </button>
                        </div>

                        {/* Bottom panel — features + toggle */}
                        <div
                            className="px-6 pb-6 pt-4 rounded-2xl"
                            style={{
                                background: "rgba(11,18,32,0.6)",
                                border: "1px solid rgba(96,165,250,0.1)",
                            }}
                        >
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                {globalFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <DarkCheckIcon className="w-4 h-4 flex-shrink-0" />
                                        <span
                                            className="text-sm font-medium"
                                            style={{ fontFamily: inter, color: "rgba(255,255,255,0.62)" }}
                                        >
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <ToggleSwitch
                                    enabled={globalMonthly}
                                    onChange={setGlobalMonthly}
                                    label="Recurring donation"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Impact stats ── */}
            <div
                className="relative z-10 w-full"
                style={{ maxWidth: "900px", marginTop: "4.5rem" }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "1px",
                        background:
                            "linear-gradient(to right, transparent, rgba(255,255,255,0.12) 30%, rgba(96,165,250,0.25) 50%, rgba(255,255,255,0.12) 70%, transparent)",
                        marginBottom: "2.5rem",
                    }}
                />

                <div className="grid grid-cols-3" style={{ gap: "1rem" }}>
                    {impactStats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="stat-rise text-center"
                            style={{ animationDelay: `${i * 0.12}s` }}
                        >
                            <p
                                style={{
                                    fontFamily: inter,
                                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                                    fontWeight: 200,
                                    letterSpacing: "-0.02em",
                                    color: "white",
                                    lineHeight: 1,
                                }}
                            >
                                {stat.value}
                            </p>
                            <p
                                style={{
                                    fontFamily: inter,
                                    fontSize: "9px",
                                    fontWeight: 500,
                                    letterSpacing: "0.28em",
                                    textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.28)",
                                    marginTop: "10px",
                                }}
                            >
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                <p
                    className="text-center"
                    style={{
                        fontFamily: inter,
                        fontSize: "10px",
                        fontWeight: 400,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.18)",
                        marginTop: "2.5rem",
                    }}
                >
                    100% of proceeds go directly to clean water initiatives worldwide.
                </p>
            </div>
        </section>
    )
}
