import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, CheckCircle, Search } from "lucide-react";
import { useLoanApplicationStore } from "../store/loanApplicationStore";
import type { LoanApplication } from "../store/loanApplicationStore";

const K = (n: number) => `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 0 })}`;

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskEntry {
  id: string;
  clientName: string;
  clientNumber?: string;
  loanRef: string;
  product: string;
  outstanding: number;
  daysOverdue: number;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
}

function calcRisk(app: LoanApplication): RiskEntry {
  const termWeeks = app.termMonths ?? 1;
  const subMs = new Date(app.submittedAt).getTime();
  const dueMs = subMs + termWeeks * 7 * 86400000;
  const daysOverdue = Math.max(0, Math.ceil((Date.now() - dueMs) / 86400000));

  const factors: string[] = [];
  let score = 0;

  if (daysOverdue > 0) {
    score += Math.min(60, daysOverdue * 3);
    factors.push(`${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`);
  }
  if (!app.employer) {
    score += 15;
    factors.push("No employer on record");
  }
  if (!app.monthlyIncome || app.monthlyIncome < app.amount) {
    score += 15;
    factors.push("Income may be insufficient for loan amount");
  }
  if (app.collateralValue === 0 || !app.collateralType) {
    score += 10;
    factors.push("No collateral recorded");
  }
  if (score === 0) {
    factors.push("No outstanding risk indicators");
  }

  score = Math.min(100, score);
  const riskLevel: RiskLevel = score >= 70 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";

  return {
    id: app.id,
    clientName: app.clientName,
    clientNumber: app.clientNumber,
    loanRef: app.ref,
    product: app.productName,
    outstanding: app.totalRepayable,
    daysOverdue,
    riskScore: score,
    riskLevel,
    factors,
  };
}

const RISK_META: Record<RiskLevel, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { color: "text-red-700",     bg: "bg-red-100",     border: "border-red-200",     label: "Critical" },
  HIGH:     { color: "text-orange-700",  bg: "bg-orange-100",  border: "border-orange-200",  label: "High" },
  MEDIUM:   { color: "text-amber-700",   bg: "bg-amber-100",   border: "border-amber-200",   label: "Medium" },
  LOW:      { color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200", label: "Low" },
};

const SCORE_COLOR = (s: number) => s >= 70 ? "text-red-700" : s >= 50 ? "text-orange-700" : s >= 25 ? "text-amber-700" : "text-emerald-700";
const SCORE_BAR   = (s: number) => s >= 70 ? "bg-red-500" : s >= 50 ? "bg-orange-400" : s >= 25 ? "bg-amber-400" : "bg-emerald-500";

export default function DefaultRiskPage() {
  const { applications, syncFromApi } = useLoanApplicationStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "ALL">("ALL");
  const [selected, setSelected] = useState<RiskEntry | null>(null);

  useEffect(() => { syncFromApi(); }, []);

  // Only analyse active (disbursed/approved) loans
  const riskEntries = applications
    .filter(a => a.status === "DISBURSED" || a.status === "APPROVED")
    .map(calcRisk)
    .sort((a, b) => b.riskScore - a.riskScore);

  useEffect(() => {
    if (riskEntries.length > 0 && !selected) setSelected(riskEntries[0]);
  }, [riskEntries.length]);

  const filtered = riskEntries
    .filter(r => filter === "ALL" || r.riskLevel === filter)
    .filter(r => !search || r.clientName.toLowerCase().includes(search.toLowerCase()) || r.loanRef.includes(search));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Predictive Default Risk</h1>
          <p className="page-subtitle">Active loans ranked by probability of default based on real data</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-base pl-9 py-1.5 w-52 text-sm" placeholder="Search clients..." />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map(lvl => {
          const m = RISK_META[lvl];
          const count = riskEntries.filter(r => r.riskLevel === lvl).length;
          return (
            <div key={lvl} className={`philix-card p-4 border cursor-pointer ${m.bg} ${m.border}`}
              onClick={() => setFilter(filter === lvl ? "ALL" : lvl)}>
              <div className={`text-3xl font-bold ${m.color} mb-1`}>{count}</div>
              <div className="text-xs text-navy-600 font-medium">{m.label} Risk</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${filter === f ? "bg-navy-900 border-navy-900 text-white" : "border-warm-300 text-navy-600 hover:text-navy-900 bg-white"}`}>
            {f === "ALL" ? "All Loans" : RISK_META[f as RiskLevel].label}
          </button>
        ))}
        <span className="text-xs text-navy-500 ml-2">{filtered.length} loan{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {riskEntries.length === 0 ? (
        <div className="philix-card p-12 text-center">
          <CheckCircle size={36} className="text-emerald-600 mx-auto mb-3" />
          <p className="text-navy-600 font-semibold text-lg">No active loans to analyse</p>
          <p className="text-navy-500 text-sm mt-1">Risk analysis will appear here once loans are disbursed or approved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {filtered.map(r => {
              const m = RISK_META[r.riskLevel];
              return (
                <button key={r.loanRef} onClick={() => setSelected(r)}
                  className={`w-full text-left philix-card p-4 transition-all hover:border-navy-300 ${selected?.loanRef === r.loanRef ? "border-2 border-navy-600" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.bg} ${m.border} border ${m.color}`}>
                      {r.riskScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-900 text-sm">{r.clientName}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${m.bg} ${m.border} ${m.color}`}>{m.label}</span>
                      </div>
                      <div className="text-xs text-navy-600 mt-0.5">{r.loanRef} · {r.product}</div>
                      <div className="h-1.5 bg-warm-200 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${SCORE_BAR(r.riskScore)}`} style={{ width: `${r.riskScore}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-navy-900">{K(r.outstanding)}</div>
                      {r.daysOverdue > 0 && <div className="text-xs text-red-700">{r.daysOverdue}d overdue</div>}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="philix-card p-10 text-center">
                <CheckCircle size={32} className="text-emerald-700 mx-auto mb-3" />
                <p className="text-navy-600 font-semibold">No loans in this risk band</p>
              </div>
            )}
          </div>

          {selected && (() => {
            const m = RISK_META[selected.riskLevel];
            return (
              <div className="philix-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy-900 text-lg">{selected.clientName}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m.bg} ${m.border} ${m.color}`}>{m.label} Risk</span>
                    </div>
                    <div className="text-xs text-navy-600 font-mono">{selected.loanRef}{selected.clientNumber ? ` · ${selected.clientNumber}` : ""}</div>
                  </div>
                  <div className={`text-4xl font-bold ${SCORE_COLOR(selected.riskScore)}`}>{selected.riskScore}</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-navy-600 mb-1">
                    <span>Default Risk Score</span>
                    <span className="font-semibold">{selected.riskScore}/100 — {m.label}</span>
                  </div>
                  <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SCORE_BAR(selected.riskScore)} transition-all`} style={{ width: `${selected.riskScore}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-navy-500 mt-1">
                    <span>Low Risk (0)</span><span>Critical (100)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Outstanding",  value: K(selected.outstanding) },
                    { label: "Days Overdue", value: selected.daysOverdue === 0 ? "Current" : `${selected.daysOverdue} days` },
                    { label: "Product",      value: selected.product },
                    { label: "Loan Ref",     value: selected.loanRef },
                  ].map(f => (
                    <div key={f.label} className="bg-warm-50 border border-warm-200 rounded-lg p-3">
                      <div className="text-xs text-navy-500 mb-0.5">{f.label}</div>
                      <div className="font-semibold text-navy-800 text-sm">{f.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold text-navy-700 mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-700" /> Risk Factors
                  </div>
                  <div className="space-y-1.5">
                    {selected.factors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <TrendingDown size={13} className={`flex-shrink-0 mt-0.5 ${selected.riskLevel === "LOW" ? "text-emerald-700" : "text-red-700"}`} />
                        <span className="text-navy-700">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-warm-200 flex gap-2">
                  {(selected.riskLevel === "CRITICAL" || selected.riskLevel === "HIGH") ? (
                    <>
                      <button className="btn-danger text-xs flex-1">Flag for Review</button>
                      <button className="btn-secondary text-xs flex-1">Contact Client</button>
                    </>
                  ) : (
                    <button className="btn-secondary text-xs flex-1">View Loan</button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
