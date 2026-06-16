import { useState } from "react";
import { BarChart2, Download, FileText, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { mockMonthlyDisbursements, mockPAR, formatKwacha, formatDate } from "../lib/mock-data";
import { mockLoans, mockKPIs } from "../lib/mock-data";

const reports = [
  { id: "loans-issued", title: "Loans Issued", description: "All loans disbursed in period", icon: CreditCard, color: "indigo" },
  { id: "collections", title: "Collections Report", description: "Repayments received in period", icon: DollarSign, color: "emerald" },
  { id: "outstanding", title: "Outstanding Balance", description: "Current unpaid balances", icon: TrendingUp, color: "blue" },
  { id: "portfolio-at-risk", title: "Portfolio at Risk", description: "PAR 1, 7, 30, 60, 90", icon: AlertTriangle, color: "amber" },
  { id: "interest-revenue", title: "Interest Revenue", description: "Interest and fees collected", icon: DollarSign, color: "emerald" },
  { id: "collateral-inventory", title: "Collateral Inventory", description: "All assets in vault", icon: Package, color: "blue" },
  { id: "defaults", title: "Default Report", description: "Defaulted loans and recovery", icon: AlertTriangle, color: "red" },
  { id: "officer-performance", title: "Officer Performance", description: "Loan officer KPIs", icon: BarChart2, color: "indigo" },
];

import { CreditCard, Package } from "lucide-react";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [activeReport, setActiveReport] = useState("loans-issued");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate, view, and export business intelligence reports</p>
        </div>
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
        <div className="flex gap-2 mt-4">
          {["This Month", "Last Month", "Last 3 Months", "Year to Date"].map((p) => (
            <button key={p} className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
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
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-1 ${
                activeReport === r.id
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
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
          {activeReport === "loans-issued" && (
            <>
              <div className="philix-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">Loans Issued</h3>
                    <p className="text-xs text-slate-500">{formatDate(dateFrom)} — {formatDate(dateTo)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs py-1.5"><Download size={13} /> PDF</button>
                    <button className="btn-secondary text-xs py-1.5"><Download size={13} /> Excel</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Loans Issued</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">{mockKPIs.monthLoans}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Total Principal</div>
                    <div className="text-2xl font-bold text-indigo-400 mt-1">{formatKwacha(521000)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Avg. Loan Size</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">{formatKwacha(Math.round(521000 / mockKPIs.monthLoans))}</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockMonthlyDisbursements.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `K${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatKwacha(v)} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="philix-card overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h4 className="font-semibold text-slate-200">Loan Details</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Loan #</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Principal</th>
                        <th>Interest Rate</th>
                        <th>Status</th>
                        <th>Disbursed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLoans.filter(l => l.status !== "PENDING_APPROVAL").map((loan) => (
                        <tr key={loan.id} className="table-row-hover">
                          <td className="font-mono text-xs text-indigo-400">{loan.loanNumber}</td>
                          <td>{loan.client.firstName} {loan.client.lastName}</td>
                          <td className="text-xs text-slate-400">{loan.loanType}</td>
                          <td className="font-medium">{formatKwacha(loan.principal)}</td>
                          <td>{loan.interestRate}%</td>
                          <td><span className={`badge-${loan.status === "ACTIVE" ? "green" : loan.status === "OVERDUE" ? "yellow" : "red"}`}>{loan.status}</span></td>
                          <td className="text-xs text-slate-500">{loan.disbursementDate ? formatDate(loan.disbursementDate) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeReport === "portfolio-at-risk" && (
            <div className="philix-card p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="section-title">Portfolio at Risk Analysis</h3>
                  <p className="text-xs text-slate-500">PAR measures portfolio health — percentage of outstanding loans with payments overdue</p>
                </div>
                <button className="btn-secondary text-xs py-1.5"><Download size={13} /> Export</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {mockPAR.map((p) => (
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
                      Industry benchmark: {p.days <= 7 ? "< 15%" : p.days <= 30 ? "< 10%" : p.days <= 60 ? "< 7%" : "< 5%"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!["loans-issued", "portfolio-at-risk"].includes(activeReport) && (
            <div className="philix-card p-8 text-center">
              <FileText size={40} className="mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {reports.find(r => r.id === activeReport)?.title}
              </h3>
              <p className="text-slate-500 mb-4">
                This report will be generated for the selected date range.
              </p>
              <div className="flex gap-3 justify-center">
                <button className="btn-primary">
                  <FileText size={14} />
                  Generate Report
                </button>
                <button className="btn-secondary">
                  <Download size={14} />
                  Export PDF
                </button>
                <button className="btn-secondary">
                  <Download size={14} />
                  Export Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
