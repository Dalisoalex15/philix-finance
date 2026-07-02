import { useState, useEffect, useCallback } from "react";
import {
  Shield, Phone, RefreshCw,
  Plus, CheckCircle,
} from "lucide-react";

const API = "/api";
const K = (n: number) => `K${(n ?? 0).toLocaleString("en-ZM", { maximumFractionDigits: 0 })}`;
const token = () => localStorage.getItem("philix_staff_token") ?? "";

interface OverdueLoan {
  id: string; reference: string; productType: string;
  amountRequested: number; interestRate: number; termMonths: number;
  status: string; reviewedAt: string;
  account: { firstName: string; lastName: string; clientNumber: string; email: string; phone?: string };
  paymentSubmissions: { amount: number | null; status: string }[];
  employer?: string; employmentType?: string;
  collateralType?: string; collateralValue?: number;
  guarantorName?: string; guarantorPhone?: string;
  physicalAddress?: string;
  daysOverdue: number; amountPaid: number; amountDue: number; outstanding: number;
  recoveryScore: number; strategy: string; strategyColor: string;
}

function recoveryScore(loan: Omit<OverdueLoan,"daysOverdue"|"amountPaid"|"amountDue"|"outstanding"|"recoveryScore"|"strategy"|"strategyColor">, daysOverdue: number, outstanding: number): number {
  const base = Math.max(5, 100 - daysOverdue * 1.8);
  const colFactor = loan.collateralValue && outstanding > 0
    ? Math.min(1.35, 1 + (loan.collateralValue / outstanding) * 0.3)
    : 0.7;
  const empFactor = loan.employmentType === "PERMANENT" ? 1.15 : loan.employmentType === "CONTRACT" ? 1.05 : 0.9;
  const gFactor = loan.guarantorName ? 1.12 : 0.92;
  return Math.min(95, Math.max(5, Math.round(base * colFactor * empFactor * gFactor)));
}

function getStrategy(score: number): { label: string; color: string; badge: string } {
  if (score >= 75) return { label: "Friendly Reminder Call", color: "emerald", badge: "bg-emerald-900/40 text-emerald-300 border-emerald-800/40" };
  if (score >= 55) return { label: "In-Person Visit", color: "amber", badge: "bg-amber-900/40 text-amber-300 border-amber-800/40" };
  if (score >= 35) return { label: "Guarantor Contact + Restructure", color: "orange", badge: "bg-orange-900/40 text-orange-300 border-orange-800/40" };
  if (score >= 20) return { label: "Legal Notice", color: "red", badge: "bg-red-900/40 text-red-300 border-red-800/40" };
  return { label: "Collateral Repossession", color: "rose", badge: "bg-rose-900/50 text-rose-300 border-rose-800/50" };
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : score >= 35 ? "#f97316" : score >= 20 ? "#ef4444" : "#e11d48";
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-slate-500">Recovery Probability</span>
        <span className="font-bold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function CollectionBattlefieldPage() {
  const [loans, setLoans] = useState<OverdueLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL"|"HIGH"|"MEDIUM"|"LOW"|"CRITICAL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFU, setShowFU] = useState<OverdueLoan | null>(null);
  const [fuAssign, setFuAssign] = useState("");
  const [fuDone, setFuDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/portal/applications/staff/all`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!r.ok) return;
      const all = await r.json();
      const now = Date.now();

      const overdue: OverdueLoan[] = all
        .filter((a: any) => a.status === "DISBURSED" && a.reviewedAt)
        .map((a: any) => {
          const dueDate = new Date(a.reviewedAt).getTime() + a.termMonths * 7 * 86400000;
          if (dueDate >= now) return null;
          const daysOverdue = Math.floor((now - dueDate) / 86400000);
          const amountDue = Math.ceil(a.amountRequested * (1 + (a.interestRate ?? 20) / 100));
          const amountPaid = (a.paymentSubmissions ?? [])
            .filter((p: any) => p.status === "APPROVED")
            .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
          const outstanding = Math.max(0, amountDue - amountPaid);
          const score = recoveryScore(a, daysOverdue, outstanding);
          const strategy = getStrategy(score);
          return {
            ...a,
            daysOverdue, amountPaid, amountDue, outstanding,
            recoveryScore: score,
            strategy: strategy.label,
            strategyColor: strategy.badge,
          };
        })
        .filter(Boolean)
        .sort((a: OverdueLoan, b: OverdueLoan) => a.recoveryScore - b.recoveryScore);

      setLoans(overdue);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createFollowUp(loan: OverdueLoan) {
    if (!fuAssign.trim()) return;
    await fetch(`${API}/follow-ups`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        portalClientId: loan.id,
        clientName: `${loan.account.firstName} ${loan.account.lastName}`,
        clientPhone: loan.account.phone,
        loanRef: loan.reference,
        amountDue: loan.outstanding,
        daysOverdue: loan.daysOverdue,
        assignedTo: fuAssign,
        followUpType: loan.recoveryScore >= 55 ? "CALL" : loan.recoveryScore >= 35 ? "VISIT" : "LEGAL",
        priority: loan.recoveryScore < 30 ? "URGENT" : loan.daysOverdue > 14 ? "HIGH" : "MEDIUM",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        notes: `${loan.strategy}. ${loan.daysOverdue} days overdue. Outstanding: ${K(loan.outstanding)}.`,
      }),
    });
    setFuDone(true);
    setTimeout(() => { setShowFU(null); setFuDone(false); setFuAssign(""); }, 1500);
  }

  const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);
  const avgDays = loans.length ? Math.round(loans.reduce((s, l) => s + l.daysOverdue, 0) / loans.length) : 0;
  const criticalCount = loans.filter(l => l.recoveryScore < 30).length;

  const RISK_BUCKETS = [
    { key: "ALL",      label: "All Overdue",  count: loans.length },
    { key: "HIGH",     label: "Recoverable",  count: loans.filter(l => l.recoveryScore >= 60).length },
    { key: "MEDIUM",   label: "At Risk",      count: loans.filter(l => l.recoveryScore >= 30 && l.recoveryScore < 60).length },
    { key: "CRITICAL", label: "Critical",     count: criticalCount },
  ] as const;

  const filtered = loans.filter(l =>
    filter === "ALL" ? true :
    filter === "HIGH" ? l.recoveryScore >= 60 :
    filter === "MEDIUM" ? l.recoveryScore >= 30 && l.recoveryScore < 60 :
    filter === "CRITICAL" ? l.recoveryScore < 30 : true
  );

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-red-400" /> Collection Battlefield
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Data-driven collection prioritisation for overdue portal loans</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/5 px-3 py-2 rounded-xl hover:bg-white/[0.07] transition-all">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Command stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Overdue",      value: loans.length,           color: "text-red-400",    sub: "loans" },
          { label: "Total Outstanding",  value: K(totalOutstanding),    color: "text-amber-400",  sub: "ZMW at risk" },
          { label: "Avg Days Overdue",   value: `${avgDays}d`,          color: "text-orange-400", sub: "average" },
          { label: "Critical Cases",     value: criticalCount,          color: "text-rose-400",   sub: "need action now" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            <div className="text-[9px] text-slate-700 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl w-fit">
        {RISK_BUCKETS.map(b => (
          <button key={b.key} onClick={() => setFilter(b.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === b.key ? "bg-red-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
            {b.label}
            {b.count > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${filter === b.key ? "bg-white/20" : "bg-white/5"}`}>{b.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loans grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-600"><RefreshCw size={20} className="animate-spin mx-auto mb-2" /> Analysing portfolio…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle size={32} className="text-emerald-700 mx-auto mb-3" />
          <div className="text-slate-500 font-semibold">No overdue loans in this view</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(loan => {
            const isOpen = expanded === loan.id;
            const strat = getStrategy(loan.recoveryScore);
            return (
              <div key={loan.id}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  loan.recoveryScore < 20 ? "border-rose-800/40 bg-rose-950/10" :
                  loan.recoveryScore < 40 ? "border-red-800/30 bg-red-950/5" :
                  loan.recoveryScore < 60 ? "border-amber-800/20 bg-amber-950/5" :
                  "border-white/5 bg-white/[0.02]"
                }`}>
                <button onClick={() => setExpanded(isOpen ? null : loan.id)} className="w-full text-left p-4 hover:bg-white/[0.015] transition-all">
                  <div className="flex items-center gap-4">
                    {/* Score circle */}
                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-2 ${
                      loan.recoveryScore >= 60 ? "border-emerald-600 bg-emerald-900/20" :
                      loan.recoveryScore >= 40 ? "border-amber-600 bg-amber-900/20" :
                      loan.recoveryScore >= 20 ? "border-red-600 bg-red-900/20" :
                      "border-rose-500 bg-rose-900/30"
                    }`}>
                      <div className={`text-sm font-black ${
                        loan.recoveryScore >= 60 ? "text-emerald-400" :
                        loan.recoveryScore >= 40 ? "text-amber-400" :
                        loan.recoveryScore >= 20 ? "text-red-400" : "text-rose-400"
                      }`}>{loan.recoveryScore}%</div>
                      <div className="text-[8px] text-slate-600 -mt-0.5">prob</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{loan.account.firstName} {loan.account.lastName}</span>
                        <span className="font-mono text-xs text-slate-500">{loan.reference}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${loan.strategyColor}`}>
                          {loan.strategy}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs flex-wrap">
                        <span className="text-red-400 font-bold">{loan.daysOverdue}d overdue</span>
                        <span className="text-amber-400 font-semibold">Outstanding: {K(loan.outstanding)}</span>
                        <span className="text-slate-500">Loan: {K(loan.amountRequested)}</span>
                        <span className="text-slate-500">{loan.account.clientNumber}</span>
                      </div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setShowFU(loan); }}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 bg-indigo-600/20 border border-indigo-600/30 text-indigo-400 rounded-xl hover:bg-indigo-600/30 transition-all font-semibold flex-shrink-0">
                      <Plus size={11} /> Follow-Up
                    </button>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-4 py-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <ScoreBar score={loan.recoveryScore} />

                    <div className="space-y-2">
                      <div className="text-slate-500 font-bold text-[10px] uppercase">Loan Details</div>
                      {[
                        ["Principal", K(loan.amountRequested)],
                        ["Interest Rate", `${loan.interestRate}%`],
                        ["Total Due", K(loan.amountDue)],
                        ["Paid", K(loan.amountPaid)],
                        ["Outstanding", K(loan.outstanding)],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-slate-600">{l}</span>
                          <span className="text-slate-300 font-semibold">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-slate-500 font-bold text-[10px] uppercase">Client Profile</div>
                      {[
                        ["Employment", loan.employmentType || "—"],
                        ["Employer", loan.employer || "—"],
                        ["Collateral", loan.collateralType || "—"],
                        ["Collateral Value", loan.collateralValue ? K(loan.collateralValue) : "—"],
                        ["Guarantor", loan.guarantorName || "None"],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-slate-600">{l}</span>
                          <span className="text-slate-300 font-semibold">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-full flex items-center gap-2 mt-2">
                      <a href={`tel:${loan.account.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/20 transition-all font-semibold text-xs">
                        <Phone size={11} /> Call Client
                      </a>
                      {loan.guarantorPhone && (
                        <a href={`tel:${loan.guarantorPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 border border-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/20 transition-all font-semibold text-xs">
                          <Phone size={11} /> Call Guarantor
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Follow-Up quick modal */}
      {showFU && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B1F3A] border border-white/10 rounded-2xl shadow-2xl p-6">
            {fuDone ? (
              <div className="py-8 text-center">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                <div className="text-white font-bold">Follow-up created!</div>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-white mb-1">Assign Follow-Up</h3>
                <p className="text-slate-500 text-xs mb-4">{showFU.account.firstName} {showFU.account.lastName} · {showFU.reference}</p>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Strategy</span><span className="text-slate-300 font-semibold">{showFU.strategy}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Days Overdue</span><span className="text-red-400 font-bold">{showFU.daysOverdue}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Outstanding</span><span className="text-amber-400 font-bold">{K(showFU.outstanding)}</span></div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-slate-400 mb-1 block">Assign to (name or email)</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={fuAssign} onChange={e => setFuAssign(e.target.value)}
                    placeholder="Officer name or email" autoFocus />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowFU(null); setFuAssign(""); }} className="flex-1 py-2.5 border border-white/10 text-slate-400 rounded-xl text-sm">Cancel</button>
                  <button onClick={() => createFollowUp(showFU)} disabled={!fuAssign.trim()}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all">
                    Create
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
