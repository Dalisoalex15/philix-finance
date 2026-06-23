import { useEffect, useState, useCallback } from "react";
import { Activity, TrendingUp, CreditCard, Users, RefreshCw, Target, Plus, X } from "lucide-react";
import { useLoanApplicationStore } from "../store/loanApplicationStore";
import { formatKwacha } from "../lib/mock-data";

const API = "/api";
function getToken() { return localStorage.getItem("philix_staff_token") ?? ""; }
function authH() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

interface OfficerTarget {
  userId: string; name: string; role: string; branchId: string | null; month: string;
  disbursementTarget: number; collectionTarget: number; loansTarget: number;
  disbursementActual: number; collectionActual: number; loansActual: number;
  disbursementPct: number; collectionPct: number; loansPct: number;
  targetId: string | null;
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const capped = Math.min(100, pct);
  return (
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${capped}%` }} />
    </div>
  );
}

export default function PerformancePage() {
  const { applications, syncFromApi } = useLoanApplicationStore();
  useEffect(() => { syncFromApi(); }, []);

  const [targets, setTargets] = useState<OfficerTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [showSetTarget, setShowSetTarget] = useState<string | null>(null);
  const [targetForm, setTargetForm] = useState({ disbursementTarget: "", collectionTarget: "", loansTarget: "" });
  const [settingTarget, setSettingTarget] = useState(false);

  const fetchTargets = useCallback(async () => {
    setTargetsLoading(true);
    try {
      const r = await fetch(`${API}/admin/targets?month=${selectedMonth}`, { headers: authH() });
      if (r.ok) {
        const d = await r.json();
        setTargets(d.officers ?? []);
      }
    } finally { setTargetsLoading(false); }
  }, [selectedMonth]);

  useEffect(() => { fetchTargets(); }, [fetchTargets]);

  async function saveTarget(userId: string) {
    setSettingTarget(true);
    try {
      const r = await fetch(`${API}/admin/targets`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          userId, month: selectedMonth,
          disbursementTarget: parseFloat(targetForm.disbursementTarget) || 0,
          collectionTarget: parseFloat(targetForm.collectionTarget) || 0,
          loansTarget: parseInt(targetForm.loansTarget) || 0,
        }),
      });
      if (r.ok) { setShowSetTarget(null); await fetchTargets(); }
    } finally { setSettingTarget(false); }
  }

  // Summary stats derived from real portal applications
  const total = applications.length;
  const disbursed = applications.filter(a => a.status === "DISBURSED");
  const approved = applications.filter(a => a.status === "APPROVED");
  const pending = applications.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW");
  const rejected = applications.filter(a => a.status === "REJECTED");
  const totalDisbursedAmt = disbursed.reduce((s, a) => s + a.amount, 0);
  const totalInterest = disbursed.reduce((s, a) => s + (a.totalRepayable - a.amount), 0);
  const approvalRate = total > 0 ? Math.round(((disbursed.length + approved.length) / total) * 100) : 0;

  // Monthly breakdown
  const monthlyMap: Record<string, { count: number; total: number }> = {};
  disbursed.forEach(a => {
    const m = new Date(a.submittedAt).toLocaleString("en-GB", { month: "short", year: "2-digit" });
    if (!monthlyMap[m]) monthlyMap[m] = { count: 0, total: 0 };
    monthlyMap[m].count++;
    monthlyMap[m].total += a.amount;
  });

  const monthlyData = Object.entries(monthlyMap)
    .slice(-6)
    .map(([month, d]) => ({ month, ...d }));

  // Product breakdown
  const productMap: Record<string, number> = {};
  applications.forEach(a => {
    const name = a.productName || "Unknown";
    productMap[name] = (productMap[name] || 0) + 1;
  });
  const topProducts = Object.entries(productMap).sort(([, a], [, b]) => b - a).slice(0, 5);

  const stats = [
    { label: "Total Applications", value: total, icon: Activity, color: "indigo" },
    { label: "Disbursed Loans", value: disbursed.length, icon: CreditCard, color: "emerald" },
    { label: "Total Disbursed", value: formatKwacha(totalDisbursedAmt), icon: TrendingUp, color: "blue" },
    { label: "Interest Earned", value: formatKwacha(totalInterest), icon: Users, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Analytics</h1>
          <p className="page-subtitle">Portfolio performance metrics from real loan data</p>
        </div>
        <button onClick={() => syncFromApi()} className="btn-secondary text-xs py-1.5">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="philix-card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${s.color}-600/20 text-${s.color}-400`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Application Pipeline</h3>
          <div className="space-y-3">
            {[
              { label: "Disbursed", count: disbursed.length, total, color: "bg-emerald-500" },
              { label: "Approved", count: approved.length, total, color: "bg-indigo-500" },
              { label: "Under Review", count: pending.length, total, color: "bg-amber-500" },
              { label: "Rejected", count: rejected.length, total, color: "bg-red-500" },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-300 font-semibold">{row.count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${row.color} transition-all`}
                    style={{ width: total > 0 ? `${Math.round((row.count / total) * 100)}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Overall Approval Rate</span>
              <span className={`font-bold ${approvalRate >= 70 ? "text-emerald-400" : approvalRate >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {approvalRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Most Popular Products</h3>
          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-sm">
              No loan data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([name, count], i) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">
                      <span className="text-slate-600 mr-2">#{i + 1}</span>
                      {name}
                    </span>
                    <span className="text-slate-400">{count} app{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: total > 0 ? `${Math.round((count / total) * 100)}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly disbursements */}
      <div className="philix-card p-5">
        <h3 className="section-title mb-4">Monthly Disbursements (Last 6 Months)</h3>
        {monthlyData.length === 0 ? (
          <div className="py-10 text-center text-slate-600 text-sm">No disbursed loans yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Loans</th>
                  <th>Total Disbursed</th>
                  <th>Avg Loan Size</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(row => (
                  <tr key={row.month} className="table-row-hover">
                    <td className="font-medium text-slate-200">{row.month}</td>
                    <td className="text-slate-300">{row.count}</td>
                    <td className="text-indigo-400 font-medium">{formatKwacha(row.total)}</td>
                    <td className="text-slate-400">{formatKwacha(row.count > 0 ? row.total / row.count : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total === 0 && (
        <div className="philix-card p-12 text-center">
          <Activity size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No loan data yet</p>
          <p className="text-slate-700 text-sm mt-1">Performance metrics will appear here as clients submit loan applications</p>
        </div>
      )}

      {/* Loan Officer Targets */}
      <div className="philix-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title flex items-center gap-2"><Target size={16} className="text-orange-400" /> Loan Officer Targets</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly disbursement & collection targets with real-time progress</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
            <button onClick={fetchTargets} className="btn-secondary py-1.5 px-2.5 text-xs flex items-center gap-1">
              <RefreshCw size={12} className={targetsLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {targetsLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading targets…</div>
        ) : targets.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-sm">No officer data found for this month</div>
        ) : (
          <div className="space-y-4">
            {targets.map(officer => (
              <div key={officer.userId} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-200">{officer.name}</div>
                    <div className="text-xs text-slate-500">{officer.role.replace("_", " ")} {officer.branchId ? `· ${officer.branchId}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {officer.disbursementPct >= 100 && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-bold">TARGET MET ✓</span>}
                    <button onClick={() => { setShowSetTarget(showSetTarget === officer.userId ? null : officer.userId); setTargetForm({ disbursementTarget: String(officer.disbursementTarget), collectionTarget: String(officer.collectionTarget), loansTarget: String(officer.loansTarget) }); }}
                      className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-900/20 border border-indigo-800/40 px-2.5 py-1.5 rounded-lg hover:bg-indigo-900/40 transition-all">
                      {showSetTarget === officer.userId ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Set Target</>}
                    </button>
                  </div>
                </div>

                {showSetTarget === officer.userId && (
                  <div className="bg-slate-900/60 border border-slate-600 rounded-xl p-3 mb-3 space-y-3">
                    <div className="text-xs font-semibold text-slate-400">Set targets for {officer.name} — {selectedMonth}</div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { k: "disbursementTarget", l: "Disbursement (K)" },
                        { k: "collectionTarget", l: "Collection (K)" },
                        { k: "loansTarget", l: "No. of Loans" },
                      ].map(f => (
                        <div key={f.k}>
                          <label className="text-[10px] text-slate-500 mb-1 block">{f.l}</label>
                          <input type="number" value={(targetForm as Record<string,string>)[f.k]}
                            onChange={e => setTargetForm(p => ({ ...p, [f.k]: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => saveTarget(officer.userId)} disabled={settingTarget}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-all">
                      {settingTarget ? "Saving…" : "Save Targets"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Disbursement", actual: officer.disbursementActual, target: officer.disbursementTarget, pct: officer.disbursementPct, fmt: (v: number) => `K${v.toLocaleString()}` },
                    { label: "Collection", actual: officer.collectionActual, target: officer.collectionTarget, pct: officer.collectionPct, fmt: (v: number) => `K${v.toLocaleString()}` },
                    { label: "Loans", actual: officer.loansActual, target: officer.loansTarget, pct: officer.loansPct, fmt: (v: number) => String(v) },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-500">{m.label}</span>
                        <span className={`font-semibold ${m.pct >= 100 ? "text-emerald-400" : m.pct >= 70 ? "text-amber-400" : "text-slate-400"}`}>{m.pct}%</span>
                      </div>
                      <ProgressBar pct={m.pct} color={m.pct >= 100 ? "bg-emerald-500" : m.pct >= 70 ? "bg-amber-500" : "bg-indigo-500"} />
                      <div className="text-[10px] text-slate-600 mt-0.5">{m.fmt(m.actual)} / {m.target > 0 ? m.fmt(m.target) : "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
