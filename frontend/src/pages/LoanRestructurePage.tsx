import { useState } from "react";
import { RefreshCw, TrendingDown, CheckCircle } from "lucide-react";
import { mockLoanRestructures, formatKwacha, formatDate } from "../lib/mock-data";

export default function LoanRestructurePage() {
  const [tab, setTab] = useState<"list" | "new">("list");
  const [type, setType] = useState("ROLLOVER");
  const [saved, setSaved] = useState(false);

  const typeColors: Record<string, string> = {
    ROLLOVER: "badge-blue",
    RESTRUCTURE: "badge-yellow",
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Restructuring & Rollovers</h1>
          <p className="page-subtitle">Modify loan terms, extend repayment periods, reduce principals</p>
        </div>
        <button onClick={() => setTab("new")} className="btn-primary">
          <RefreshCw size={14} /> New Restructure
        </button>
      </div>

      <div className="flex gap-2">
        {["list", "new"].map(t => (
          <button key={t} onClick={() => setTab(t as "list" | "new")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${tab === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {t === "list" ? "Restructure History" : "New Restructure / Rollover"}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <div className="space-y-4">
          {mockLoanRestructures.map((rst) => (
            <div key={rst.id} className="philix-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-indigo-400">{rst.loan.loanNumber}</span>
                    <span className={typeColors[rst.type]}>{rst.type}</span>
                    <span className="text-slate-400 text-sm">{rst.loan.client.firstName} {rst.loan.client.lastName}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Approved: {formatDate(rst.approvedAt)}</div>
                  <div className="text-sm text-slate-400 mt-2 italic">"{rst.reason}"</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Old Principal", value: formatKwacha(rst.oldPrincipal), color: "text-slate-400" },
                  { label: "New Principal", value: formatKwacha(rst.newPrincipal), color: "text-slate-200" },
                  { label: "Old Rate", value: `${rst.oldRate}% p.a.`, color: "text-slate-400" },
                  { label: "New Rate", value: `${rst.newRate}% p.a.`, color: "text-amber-400" },
                  { label: "Old Maturity", value: formatDate(rst.oldMaturity), color: "text-red-400" },
                  { label: "New Maturity", value: formatDate(rst.newMaturity), color: "text-emerald-400" },
                  { label: "Additional Fee", value: formatKwacha(rst.additionalFee), color: "text-slate-300" },
                ].map(f => (
                  <div key={f.label} className="bg-slate-800/50 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500">{f.label}</div>
                    <div className={`text-sm font-semibold ${f.color} mt-0.5`}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "new" && (
        <div className="philix-card p-5">
          {saved ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-100">Restructure Applied</h3>
              <p className="text-slate-400 text-sm mt-1">Loan terms have been updated and audit log created.</p>
              <button onClick={() => { setSaved(false); setTab("list"); }} className="btn-secondary mt-4">View History</button>
            </div>
          ) : (
            <>
              <h3 className="section-title mb-5">New Loan Restructure / Rollover</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["ROLLOVER", "RESTRUCTURE"].map(t => (
                        <button key={t} onClick={() => setType(t)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${type === t ? "border-indigo-500 bg-indigo-600/20 text-indigo-300" : "border-slate-700 text-slate-400"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {type === "ROLLOVER" ? "Extend loan term with same or new rate. Additional fee charged." : "Reduce principal or rate. For genuine financial hardship cases."}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Select Loan *</label>
                    <select className="input-base">
                      <option>PHX-L-0005 — Emmanuel Zulu (OVERDUE, 47 days)</option>
                      <option>PHX-L-0003 — Miriam Sichone (DEFAULTED)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Reason *</label>
                    <textarea className="input-base" rows={3} placeholder="Explain why this loan is being restructured..." />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">New Principal (K)</label>
                      <input type="number" className="input-base" defaultValue={3200} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">New Interest Rate (%)</label>
                      <input type="number" className="input-base" defaultValue={24} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">New Maturity Date</label>
                      <input type="date" className="input-base" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Restructure Fee (K)</label>
                      <input type="number" className="input-base" defaultValue={64} />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-3">Summary of Changes</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Principal Change</span><span className="text-amber-400">K3,500 → K3,200 (-K300)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Rate Change</span><span className="text-amber-400">28% → 24%</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Extension</span><span className="text-emerald-400">+3 months</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Restructure Fee</span><span className="text-slate-200">K64</span></div>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300">
                    <TrendingDown size={12} className="inline mr-1" />
                    This action requires CEO/Manager approval. An audit log will be created.
                  </div>
                  <button onClick={() => setSaved(true)} className="btn-primary w-full">Apply Restructure</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
