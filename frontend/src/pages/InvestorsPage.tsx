import { useState } from "react";
import { Plus, TrendingUp, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { mockInvestors, formatKwacha, formatDate } from "../lib/mock-data";

export default function InvestorsPage() {
  const [showNew, setShowNew] = useState(false);

  const totalInvested = mockInvestors.reduce((s, i) => s + i.totalInvested, 0);
  const totalBalance = mockInvestors.reduce((s, i) => s + i.currentBalance, 0);
  const avgReturn = mockInvestors.reduce((s, i) => s + i.returnRate, 0) / mockInvestors.length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investor Management</h1>
          <p className="page-subtitle">Track capital, returns, payouts, and investor statements</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          Add Investor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Capital Invested", value: formatKwacha(totalInvested), icon: DollarSign, color: "indigo" },
          { label: "Current Portfolio Value", value: formatKwacha(totalBalance), icon: TrendingUp, color: "emerald" },
          { label: "Active Investors", value: mockInvestors.length.toString(), icon: Users, color: "blue" },
          { label: "Avg. Return Rate", value: `${avgReturn.toFixed(1)}%`, icon: ArrowUpRight, color: "amber" },
        ].map((s) => (
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

      {/* Investor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockInvestors.map((investor) => {
          const growth = investor.currentBalance - investor.totalInvested;
          const growthPct = ((growth / investor.totalInvested) * 100).toFixed(1);
          const monthlyReturn = (investor.totalInvested * investor.returnRate) / 100 / 12;

          return (
            <div key={investor.id} className="philix-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {investor.fullName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{investor.fullName}</div>
                      <div className="text-xs text-slate-500">{investor.investorNumber}</div>
                    </div>
                  </div>
                </div>
                <span className="badge-green">{investor.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Total Invested</div>
                  <div className="text-lg font-bold text-slate-100">{formatKwacha(investor.totalInvested)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Current Balance</div>
                  <div className="text-lg font-bold text-emerald-400">{formatKwacha(investor.currentBalance)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <div>
                  <span className="text-slate-400">Return Rate: </span>
                  <span className="font-semibold text-indigo-400">{investor.returnRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-slate-400">Monthly: </span>
                  <span className="font-semibold text-emerald-400">{formatKwacha(monthlyReturn)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
                <span>Since {formatDate(investor.contractStart)}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ArrowUpRight size={11} />
                  +{growthPct}% growth
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="btn-secondary text-xs py-1.5 flex-1">View Statement</button>
                <button className="btn-success text-xs py-1.5 px-3">Record Payout</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
