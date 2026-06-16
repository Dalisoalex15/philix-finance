import { useState } from "react";
import { TrendingUp, DollarSign, PieChart, Filter } from "lucide-react";
import { mockPortfolioProfitability, formatKwacha, getStatusColor } from "../lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PortfolioProfitabilityPage() {
  const [sortBy, setSortBy] = useState<"netProfit" | "roi" | "principal">("netProfit");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...mockPortfolioProfitability].sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);

  const totalRevenue = mockPortfolioProfitability.reduce((s, p) => s + p.totalRevenue, 0);
  const totalCost = mockPortfolioProfitability.reduce((s, p) => s + p.totalCost, 0);
  const totalProfit = mockPortfolioProfitability.reduce((s, p) => s + p.netProfit, 0);
  const avgROI = mockPortfolioProfitability.length > 0
    ? (mockPortfolioProfitability.reduce((s, p) => s + p.roi, 0) / mockPortfolioProfitability.length)
    : 0;

  const chartData = sorted.slice(0, 10).map(p => ({
    loan: p.loan.loanNumber,
    Revenue: p.totalRevenue,
    Cost: p.totalCost,
    Profit: p.netProfit,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Portfolio Profitability</h1>
          <p className="page-subtitle">Loan-level revenue, cost of funds, and net profit analysis</p>
        </div>
        <button className="btn-secondary text-xs py-1.5"><Filter size={12} /> Filter Period</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatKwacha(totalRevenue), color: "text-emerald-400", icon: TrendingUp },
          { label: "Total Cost of Funds", value: formatKwacha(totalCost), color: "text-red-400", icon: DollarSign },
          { label: "Net Profit", value: formatKwacha(totalProfit), color: totalProfit >= 0 ? "text-emerald-400" : "text-red-400", icon: PieChart },
          { label: "Avg ROI", value: `${avgROI.toFixed(1)}%`, color: "text-blue-400", icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="philix-card p-5">
        <h3 className="section-title mb-4">Top 10 Loans by Net Profit</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="loan" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="Revenue" fill="#10b981" radius={[3,3,0,0]} />
            <Bar dataKey="Cost" fill="#f43f5e" radius={[3,3,0,0]} />
            <Bar dataKey="Profit" fill="#6366f1" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="philix-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <h3 className="section-title flex-1">Loan Profitability Ledger</h3>
          <span className="text-xs text-slate-500">Sort by:</span>
          {(["netProfit", "roi", "principal"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-1 text-xs rounded ${sortBy === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              {s === "netProfit" ? "Net Profit" : s === "roi" ? "ROI" : "Principal"}
            </button>
          ))}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Loan</th>
              <th>Client</th>
              <th>Status</th>
              <th>Principal</th>
              <th>Revenue</th>
              <th>Cost of Funds</th>
              <th>Net Profit</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id} className="table-row-hover">
                <td className="font-mono text-xs text-indigo-400">{p.loan.loanNumber}</td>
                <td className="text-sm text-slate-200">{p.loan.client?.firstName} {p.loan.client?.lastName}</td>
                <td><span className={`text-xs font-semibold ${getStatusColor(p.loan.status)}`}>{p.loan.status}</span></td>
                <td className="text-slate-300">{formatKwacha(p.principal)}</td>
                <td className="text-emerald-400">{formatKwacha(p.totalRevenue)}</td>
                <td className="text-red-400">{formatKwacha(p.totalCost)}</td>
                <td className={`font-bold ${p.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatKwacha(p.netProfit)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${p.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p.roi.toFixed(1)}%</span>
                    <div className="w-12 bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${p.roi >= 0 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${Math.min(Math.abs(p.roi), 100)}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
