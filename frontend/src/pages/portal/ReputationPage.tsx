import { useState, useEffect, useCallback } from "react";
import { Star, Award, Zap, CheckCircle, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientAuthStore } from "../../store/clientAuth";

const K = (n: number) => `K${(n ?? 0).toLocaleString("en-ZM", { maximumFractionDigits: 0 })}`;

const TIERS = [
  { name: "Bronze", min: 0, max: 1, color: "#CD7F32", bg: "from-amber-900/30 to-orange-900/20", border: "border-amber-800/40", benefits: ["Standard approval time","Regular interest rates","Up to K50,000 limit"] },
  { name: "Silver", min: 2, max: 3, color: "#C0C0C0", bg: "from-slate-700/30 to-slate-800/20", border: "border-slate-600/40", benefits: ["Priority processing (24h)","5% rate discount","Up to K100,000 limit"] },
  { name: "Gold",   min: 4, max: 6, color: "#FFD700", bg: "from-amber-600/20 to-yellow-900/20", border: "border-amber-600/40", benefits: ["Same-day approval","10% rate discount","Up to K200,000 limit","Dedicated officer"] },
  { name: "Platinum",min:7, max:999, color: "#E5E4E2", bg: "from-slate-400/10 to-slate-600/10", border: "border-slate-400/30", benefits: ["Instant approval","15% rate discount","Unlimited limit","Priority hotline","VIP lounge access"] },
];

interface LoanApp { id: string; status: string; amountRequested: number; createdAt: string; interestRate?: number; termMonths: number; }

export default function ReputationPage() {
  const client = useClientAuthStore(s => s.client);
  const token  = useClientAuthStore(s => s.accessToken);
  const [apps, setApps] = useState<LoanApp[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/applications", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setApps(await r.json());
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!client) return null;

  const repaidApps  = apps.filter(a => a.status === "REPAID");
  const activeLoans = apps.filter(a => a.status === "DISBURSED");
  const allLoans    = apps.filter(a => !["SUBMITTED","UNDER_REVIEW"].includes(a.status));
  const totalBorrowed = apps.reduce((s, a) => s + a.amountRequested, 0);
  const totalRepaid   = repaidApps.reduce((s, a) => s + a.amountRequested, 0);
  const yearsWithPhilix = apps.length > 0
    ? Math.max(0, Math.floor((Date.now() - new Date(apps[apps.length - 1].createdAt).getTime()) / (365.25 * 86400000)))
    : 0;

  const onTimeRate = allLoans.length > 0 ? Math.round((repaidApps.length / allLoans.length) * 100) : 100;

  const tierIdx   = TIERS.findIndex(t => repaidApps.length >= t.min && repaidApps.length <= t.max);
  const tier      = TIERS[tierIdx] ?? TIERS[0];
  const nextTier  = TIERS[tierIdx + 1];
  const pctToNext = nextTier
    ? Math.round(((repaidApps.length - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Hero */}
      <div className={`rounded-2xl p-6 bg-gradient-to-br ${tier.bg} border ${tier.border} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 80% 20%, ${tier.color}, transparent 60%)` }} />
        <div className="relative flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${tier.color}15`, border: `2px solid ${tier.color}40` }}>
            <Star size={28} style={{ color: tier.color }} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Your Reputation Tier</div>
            <div className="text-3xl font-black" style={{ color: tier.color }}>{tier.name}</div>
            <div className="text-slate-400 text-sm mt-1">{repaidApps.length} loan{repaidApps.length !== 1 ? "s" : ""} successfully repaid</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-500 mb-1">Credit Score</div>
            <div className="text-2xl font-black" style={{ color: tier.color }}>
              {Math.min(850, 500 + repaidApps.length * 50 + onTimeRate * 2)}
            </div>
            <div className="text-[10px] text-slate-600">/ 850</div>
          </div>
        </div>

        {nextTier && (
          <div className="mt-4 space-y-1.5 relative">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{tier.name}</span>
              <span className="font-semibold" style={{ color: TIERS[tierIdx+1].color }}>{nextTier.name} in {nextTier.min - repaidApps.length} more repaid loan{nextTier.min - repaidApps.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctToNext}%`, background: tier.color }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Loans Repaid",     value: repaidApps.length,       suffix: "loans",     color: "text-emerald-400" },
          { label: "On-Time Rate",     value: `${onTimeRate}%`,        suffix: "repayments",color: "text-indigo-400" },
          { label: "Total Borrowed",   value: K(totalBorrowed),        suffix: "total",     color: "text-amber-400" },
          { label: "Years with Philix",value: yearsWithPhilix || "<1", suffix: "years",     color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current tier benefits */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Award size={16} style={{ color: tier.color }} /> Your {tier.name} Benefits
        </h2>
        <div className="space-y-2">
          {tier.benefits.map(b => (
            <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> {b}
            </div>
          ))}
        </div>
      </div>

      {/* All tiers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-bold text-slate-200 mb-4 text-sm">All Reputation Tiers</h2>
        <div className="space-y-3">
          {TIERS.map((t, i) => {
            const unlocked = repaidApps.length >= t.min;
            const current  = t.name === tier.name;
            return (
              <div key={t.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${current ? `bg-gradient-to-r ${t.bg} ${t.border}` : unlocked ? "border-slate-700/40 bg-slate-800/20" : "border-slate-800 opacity-50"}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: unlocked ? `${t.color}15` : "#1e293b", border: `1px solid ${unlocked ? t.color + "40" : "#334155"}` }}>
                  {unlocked ? <Star size={14} style={{ color: t.color }} /> : <Lock size={12} className="text-slate-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: unlocked ? t.color : "#475569" }}>{t.name}</span>
                    {current && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${t.color}20`, color: t.color }}>CURRENT</span>}
                  </div>
                  <div className="text-[10px] text-slate-600">{t.min === 0 ? "Starting tier" : `${t.min}+ repaid loans required`}</div>
                </div>
                {!unlocked && nextTier?.name === t.name && (
                  <div className="text-[10px] text-slate-500">{t.min - repaidApps.length} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      {repaidApps.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-800/30 rounded-2xl p-5 text-center">
          <Zap size={24} className="text-indigo-400 mx-auto mb-2" />
          <div className="font-bold text-slate-200 mb-1">Start Building Your Reputation</div>
          <p className="text-slate-500 text-sm mb-4">Repay your first loan to unlock Silver tier and access better rates.</p>
          <Link to="/portal/apply" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Apply for a Loan <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-900/10 border border-emerald-800/20 rounded-2xl p-5 text-center">
          <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
          <div className="font-bold text-slate-200 mb-1">Great Reputation!</div>
          <p className="text-slate-500 text-sm mb-4">Keep repaying on time to unlock higher limits and better rates.</p>
          <Link to="/portal/loans" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            View My Loans <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
