import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mockBranchProfitability, formatKwacha } from "../lib/mock-data";

export default function BranchProfitabilityPage() {
  const branch = mockBranchProfitability[0];

  const revenueItems = [
    { label: "Interest Income", value: branch.interestIncome },
    { label: "Processing Fees", value: branch.processingFees },
    { label: "Penalty Income", value: branch.penaltyIncome },
  ];

  const expenseItems = [
    { label: "Staff Salaries", value: branch.salaries },
    { label: "Office Rent", value: branch.rent },
    { label: "Utilities", value: branch.utilities },
    { label: "Transport & Fuel", value: branch.transport },
    { label: "Marketing", value: branch.marketing },
    { label: "Investor Interest", value: branch.investorInterest },
    { label: "Loan Provisions", value: branch.provisions },
    { label: "Other", value: branch.other },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 88000, expenses: 76000, profit: 12000 },
    { month: "Feb", revenue: 94000, expenses: 78000, profit: 16000 },
    { month: "Mar", revenue: 102000, expenses: 81000, profit: 21000 },
    { month: "Apr", revenue: 98000, expenses: 79000, profit: 19000 },
    { month: "May", revenue: 107000, expenses: 82000, profit: 25000 },
    { month: "Jun", revenue: branch.totalRevenue, expenses: branch.totalExpenses, profit: branch.netProfit },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Profitability</h1>
          <p className="page-subtitle">Revenue vs expenses · Net profit per branch per month</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatKwacha(branch.totalRevenue), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Expenses", value: formatKwacha(branch.totalExpenses), icon: TrendingDown, color: "text-red-400" },
          { label: "Net Profit", value: formatKwacha(branch.netProfit), icon: DollarSign, color: "text-indigo-400" },
          { label: "Profit Margin", value: `${branch.profitMargin}%`, icon: BarChart2, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label} — June 2025</div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="philix-card p-5">
        <h3 className="section-title mb-5">6-Month P&L Trend — Lusaka Main</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `K${(v / 1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatKwacha(v)} contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Net Profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="philix-card p-5">
          <h3 className="section-title mb-4 text-emerald-400">Revenue Breakdown</h3>
          <div className="space-y-3">
            {revenueItems.map((item) => {
              const pct = (item.value / branch.totalRevenue) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-bold text-emerald-400">{formatKwacha(item.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 border-t border-slate-700 font-bold">
              <span className="text-slate-200">TOTAL REVENUE</span>
              <span className="text-emerald-400">{formatKwacha(branch.totalRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="philix-card p-5">
          <h3 className="section-title mb-4 text-red-400">Expense Breakdown</h3>
          <div className="space-y-3">
            {expenseItems.map((item) => {
              const pct = (item.value / branch.totalExpenses) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-bold text-red-400">{formatKwacha(item.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 border-t border-slate-700 font-bold">
              <span className="text-slate-200">TOTAL EXPENSES</span>
              <span className="text-red-400">{formatKwacha(branch.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Profit Summary */}
      <div className="philix-card p-5 text-center border-indigo-800/30 border">
        <div className="text-xs text-slate-500 mb-1">Net Profit — June 2025 · Lusaka Main Branch</div>
        <div className="text-4xl font-bold text-indigo-400">{formatKwacha(branch.netProfit)}</div>
        <div className="text-sm text-slate-400 mt-2">Profit Margin: <span className="text-indigo-400 font-semibold">{branch.profitMargin}%</span></div>
        <div className="text-xs text-slate-500 mt-1">{branch.loanCount} loans in portfolio this month</div>
      </div>
    </div>
  );
}
