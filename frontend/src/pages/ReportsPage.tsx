import { useState, useEffect } from "react";
import { BarChart2, Download, FileText, TrendingUp, AlertTriangle, DollarSign, CreditCard, Package, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatKwacha, formatDate } from "../lib/mock-data";
import { useLoanApplicationStore } from "../store/loanApplicationStore";

const TERM_RATES: Record<string, Record<number, number>> = {
  "prod-001": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-002": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-003": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-004": { 1: 10, 2: 20, 3: 30, 4: 35 },
  "prod-005": { 1:  8, 2: 16, 3: 24, 4: 30 },
  "prod-006": { 1:  7, 2: 14, 3: 21, 4: 28 },
};

const reports = [
  { id: "loans-issued",       title: "Loans Issued",         description: "All loans disbursed in period",            icon: CreditCard,    color: "indigo" },
  { id: "collections",        title: "Collections Report",   description: "Repayments received in period",            icon: DollarSign,    color: "emerald" },
  { id: "outstanding",        title: "Outstanding Balance",  description: "Current unpaid balances",                  icon: TrendingUp,    color: "blue" },
  { id: "portfolio-at-risk",  title: "Portfolio at Risk",    description: "PAR 1, 7, 30, 60, 90",                    icon: AlertTriangle, color: "amber" },
  { id: "interest-revenue",   title: "Interest Revenue",     description: "Interest and fees collected",              icon: DollarSign,    color: "emerald" },
  { id: "collateral-inventory",title:"Collateral Inventory", description: "All assets in vault",                      icon: Package,       color: "blue" },
  { id: "defaults",           title: "Default Report",       description: "Defaulted loans and recovery",             icon: AlertTriangle, color: "red" },
  { id: "officer-performance",title: "Officer Performance",  description: "Loan officer KPIs",                        icon: BarChart2,     color: "indigo" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING:      "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED:     "Approved",
  DISBURSED:    "Active",
  REJECTED:     "Rejected",
};

export default function ReportsPage() {
  const { applications, syncFromApi } = useLoanApplicationStore();
  const [loading, setLoading]   = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo]         = useState(new Date().toISOString().slice(0, 10));
  const [activeReport, setActiveReport] = useState("loans-issued");

  useEffect(() => {
    setLoading(true);
    syncFromApi().finally(() => setLoading(false));
  }, []);

  // Filter to date range
  const inRange = applications.filter(a => {
    const d = a.submittedAt.slice(0, 10);
    return d >= dateFrom && d <= dateTo;
  });

  // Disbursed/approved loans
  const disbursed   = inRange.filter(a => a.status === "DISBURSED");
  const approved    = inRange.filter(a => a.status === "APPROVED" || a.status === "DISBURSED");
  const totalPrincipal = disbursed.reduce((s, a) => s + a.amount, 0);
  const avgLoanSize    = disbursed.length > 0 ? totalPrincipal / disbursed.length : 0;

  const totalInterest  = disbursed.reduce((s, a) => s + (a.totalRepayable - a.amount), 0);
  const totalRepayable = totalPrincipal + totalInterest;

  // Outstanding = approved + disbursed (not fully repaid)
  const outstanding = applications
    .filter(a => a.status === "APPROVED" || a.status === "DISBURSED")
    .reduce((s, a) => s + a.amount, 0);

  // Build monthly chart data from all time (last 6 months)
  const monthlyMap: Record<string, number> = {};
  applications.filter(a => a.status === "DISBURSED" || a.status === "APPROVED").forEach(a => {
    const key = a.submittedAt.slice(0, 7); // YYYY-MM
    monthlyMap[key] = (monthlyMap[key] ?? 0) + a.amount;
  });
  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      amount,
    }));

  // PAR — days overdue buckets (only DISBURSED loans)
  const now = Date.now();
  function daysOverdue(app: typeof applications[0]) {
    const termWeeks = app.termMonths ?? 1;
    const sub = new Date(app.submittedAt).getTime();
    const due = sub + termWeeks * 7 * 86400000;
    return Math.max(0, Math.ceil((now - due) / 86400000));
  }
  const disbursedAll = applications.filter(a => a.status === "DISBURSED");
  const parBuckets = [1, 7, 30, 60, 90].map(days => {
    const overdue = disbursedAll.filter(a => daysOverdue(a) >= days);
    const amount  = overdue.reduce((s, a) => s + a.totalRepayable, 0);
    const totalBook = disbursedAll.reduce((s, a) => s + a.totalRepayable, 0);
    const pct = totalBook > 0 ? parseFloat(((amount / totalBook) * 100).toFixed(1)) : 0;
    return { days, count: overdue.length, amount, percentage: pct };
  });

  const setPreset = (label: string) => {
    const d = new Date();
    if (label === "This Month") {
      setDateFrom(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10));
      setDateTo(d.toISOString().slice(0, 10));
    } else if (label === "Last Month") {
      const first = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const last  = new Date(d.getFullYear(), d.getMonth(), 0);
      setDateFrom(first.toISOString().slice(0, 10));
      setDateTo(last.toISOString().slice(0, 10));
    } else if (label === "Last 3 Months") {
      const from = new Date(d.getFullYear(), d.getMonth() - 3, 1);
      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(d.toISOString().slice(0, 10));
    } else if (label === "Year to Date") {
      setDateFrom(new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10));
      setDateTo(d.toISOString().slice(0, 10));
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Reference", "Client", "Product", "Principal", "Interest Rate", "Total Due", "Term (wks)", "Status", "Submitted"],
      ...inRange.map(a => [
        a.ref,
        a.clientName,
        a.productName,
        a.amount,
        `${a.interestRate}%`,
        a.totalRepayable,
        a.termMonths ?? 1,
        a.status,
        a.submittedAt.slice(0, 10),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement("a");
    el.href = url; el.download = `philix-report-${dateFrom}-${dateTo}.csv`; el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate, view, and export business intelligence reports</p>
        </div>
        {loading && <RefreshCw size={16} className="animate-spin text-slate-500" />}
      </div>

      {/* Date Range */}
      <div className="philix-card p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-slate-400 block mb-1">From</label>
          <input type="date" className="input-base text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">To</label>
          <input type="date" className="input-base text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {["This Month", "Last Month", "Last 3 Months", "Year to Date"].map((p) => (
            <button key={p} onClick={() => setPreset(p)}
              className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Menu */}
        <div className="philix-card p-3 h-fit">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Available Reports</div>
          {reports.map((r) => (
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-1 ${
                activeReport === r.id ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}>
              <r.icon size={14} className="flex-shrink-0" />
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-slate-500">{r.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── LOANS ISSUED ────────────────────────────────────────────── */}
          {activeReport === "loans-issued" && (
            <>
              <div className="philix-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">Loans Issued</h3>
                    <p className="text-xs text-slate-500">{formatDate(dateFrom)} — {formatDate(dateTo)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={exportCSV} className="btn-secondary text-xs py-1.5"><Download size={13} /> CSV</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Loans Disbursed</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">{disbursed.length}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{approved.length} approved total</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Total Principal</div>
                    <div className="text-2xl font-bold text-indigo-400 mt-1">{formatKwacha(totalPrincipal)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">+ {formatKwacha(totalInterest)} interest</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Avg. Loan Size</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">
                      {disbursed.length > 0 ? formatKwacha(avgLoanSize) : "—"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Total repayable: {formatKwacha(totalRepayable)}</div>
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `K${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatKwacha(v)} />
                      <Bar dataKey="amount" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">
                    No disbursement data yet
                  </div>
                )}
              </div>

              <div className="philix-card overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200">Loan Details</h4>
                  <span className="text-xs text-slate-500">{inRange.length} applications in range</span>
                </div>
                {inRange.length === 0 ? (
                  <div className="p-8 text-center text-slate-600 text-sm">
                    No applications found for the selected date range
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Client</th>
                          <th>Product</th>
                          <th>Principal</th>
                          <th>Rate</th>
                          <th>Total Due</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inRange.map((app) => (
                          <tr key={app.id} className="table-row-hover">
                            <td className="font-mono text-xs text-indigo-400">{app.ref}</td>
                            <td>{app.clientName}</td>
                            <td className="text-xs text-slate-400">{app.productName}</td>
                            <td className="font-medium">{formatKwacha(app.amount)}</td>
                            <td>{app.interestRate}%</td>
                            <td className="font-medium text-emerald-400">{formatKwacha(app.totalRepayable)}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                app.status === "DISBURSED"    ? "bg-indigo-900/40 text-indigo-300" :
                                app.status === "APPROVED"     ? "bg-emerald-900/40 text-emerald-300" :
                                app.status === "REJECTED"     ? "bg-red-900/40 text-red-300" :
                                app.status === "UNDER_REVIEW" ? "bg-blue-900/40 text-blue-300" :
                                "bg-amber-900/40 text-amber-300"
                              }`}>{STATUS_LABEL[app.status] ?? app.status}</span>
                            </td>
                            <td className="text-xs text-slate-500">{formatDate(app.submittedAt.slice(0, 10))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── OUTSTANDING BALANCE ─────────────────────────────────────── */}
          {activeReport === "outstanding" && (
            <div className="philix-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Outstanding Balance</h3>
                <button onClick={exportCSV} className="btn-secondary text-xs py-1.5"><Download size={13} /> CSV</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Active Loans (Approved + Disbursed)</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">
                    {applications.filter(a => a.status === "APPROVED" || a.status === "DISBURSED").length}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Total Outstanding Principal</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">{formatKwacha(outstanding)}</div>
                </div>
              </div>
              {applications.filter(a => a.status === "APPROVED" || a.status === "DISBURSED").length === 0 ? (
                <div className="text-center text-slate-600 text-sm py-8">No active loans at this time</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>Reference</th><th>Client</th><th>Principal</th><th>Total Due</th><th>Term</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {applications.filter(a => a.status === "APPROVED" || a.status === "DISBURSED").map(a => (
                        <tr key={a.id} className="table-row-hover">
                          <td className="font-mono text-xs text-indigo-400">{a.ref}</td>
                          <td>{a.clientName}</td>
                          <td className="font-medium">{formatKwacha(a.amount)}</td>
                          <td className="font-medium text-emerald-400">{formatKwacha(a.totalRepayable)}</td>
                          <td className="text-xs text-slate-400">{a.termMonths ?? 1} wk{(a.termMonths ?? 1) > 1 ? "s" : ""}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              a.status === "DISBURSED" ? "bg-indigo-900/40 text-indigo-300" : "bg-emerald-900/40 text-emerald-300"
                            }`}>{STATUS_LABEL[a.status]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── INTEREST REVENUE ────────────────────────────────────────── */}
          {activeReport === "interest-revenue" && (
            <div className="philix-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="section-title">Interest Revenue</h3>
                  <p className="text-xs text-slate-500">{formatDate(dateFrom)} — {formatDate(dateTo)}</p>
                </div>
                <button onClick={exportCSV} className="btn-secondary text-xs py-1.5"><Download size={13} /> CSV</button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Disbursed Loans</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">{disbursed.length}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Total Interest Earned</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{formatKwacha(totalInterest)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Total Repayable</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{formatKwacha(totalRepayable)}</div>
                </div>
              </div>
              {disbursed.length === 0 ? (
                <div className="text-center text-slate-600 text-sm py-8">No disbursed loans in the selected period</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>Reference</th><th>Client</th><th>Principal</th><th>Rate</th><th>Interest</th><th>Total Due</th></tr>
                    </thead>
                    <tbody>
                      {disbursed.map(a => (
                        <tr key={a.id} className="table-row-hover">
                          <td className="font-mono text-xs text-indigo-400">{a.ref}</td>
                          <td>{a.clientName}</td>
                          <td>{formatKwacha(a.amount)}</td>
                          <td>{a.interestRate}%</td>
                          <td className="text-amber-400 font-medium">{formatKwacha(a.totalRepayable - a.amount)}</td>
                          <td className="font-medium text-emerald-400">{formatKwacha(a.totalRepayable)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PORTFOLIO AT RISK ────────────────────────────────────────── */}
          {activeReport === "portfolio-at-risk" && (
            <div className="philix-card p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="section-title">Portfolio at Risk Analysis</h3>
                  <p className="text-xs text-slate-500">Percentage of outstanding loans with payments overdue</p>
                </div>
              </div>
              {disbursedAll.length === 0 ? (
                <div className="text-center text-slate-600 text-sm py-8">No disbursed loans to analyse</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {parBuckets.map((p) => (
                    <div key={p.days} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-lg font-bold text-slate-100">PAR {p.days}+</span>
                          <span className="text-xs text-slate-500 ml-2">{p.count} loans · {p.days}+ days overdue</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${p.percentage > 10 ? "text-red-400" : p.percentage > 5 ? "text-amber-400" : "text-emerald-400"}`}>
                            {p.percentage}%
                          </div>
                          <div className="text-xs text-slate-400">{formatKwacha(p.amount)}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${p.percentage > 10 ? "bg-red-500" : p.percentage > 5 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, p.percentage * 4)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Benchmark: {p.days <= 7 ? "< 15%" : p.days <= 30 ? "< 10%" : p.days <= 60 ? "< 7%" : "< 5%"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── OTHER REPORTS — placeholder ─────────────────────────────── */}
          {!["loans-issued", "portfolio-at-risk", "outstanding", "interest-revenue"].includes(activeReport) && (
            <div className="philix-card p-8 text-center">
              <FileText size={40} className="mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {reports.find(r => r.id === activeReport)?.title}
              </h3>
              <p className="text-slate-500 mb-4">
                This report will be generated for the selected date range.
              </p>
              <div className="flex gap-3 justify-center">
                <button className="btn-primary"><FileText size={14} /> Generate Report</button>
                <button className="btn-secondary"><Download size={14} /> Export PDF</button>
                <button className="btn-secondary"><Download size={14} /> Export Excel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
