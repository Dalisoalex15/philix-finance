import { Activity, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockPerformance, formatKwacha } from "../lib/mock-data";

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Performance</h1>
          <p className="page-subtitle">Track and compare loan officer and collections performance</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 philix-card overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="section-title">Performance Leaderboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Officer</th>
                  <th>Role</th>
                  <th>Loans Issued</th>
                  <th>Active</th>
                  <th>Defaults</th>
                  <th>Collection Rate</th>
                  <th>Disbursed</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {mockPerformance.map((p, i) => (
                  <tr key={p.id} className="table-row-hover">
                    <td>
                      <span className={`font-bold text-sm ${
                        i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-700" : "text-slate-600"
                      }`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="font-medium text-slate-200">{p.name}</td>
                    <td><span className="badge-blue text-[10px]">{p.role.replace("_", " ")}</span></td>
                    <td className="font-medium text-slate-200">{p.loansIssued}</td>
                    <td className="text-slate-300">{p.activeLoans}</td>
                    <td className={p.defaults > 3 ? "text-red-400" : "text-slate-300"}>{p.defaults}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full">
                          <div
                            className={`h-full rounded-full ${p.collectionRate > 90 ? "bg-emerald-500" : p.collectionRate > 80 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${p.collectionRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${p.collectionRate > 90 ? "text-emerald-400" : p.collectionRate > 80 ? "text-amber-400" : "text-red-400"}`}>
                          {p.collectionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="text-slate-300">{formatKwacha(p.totalDisbursed)}</td>
                    <td className="text-emerald-400">{formatKwacha(p.totalCollected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Collection Rate Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockPerformance} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="collectionRate" name="Collection Rate" fill="#6366f1" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mockPerformance.slice(0, 3).map((p, i) => (
          <div key={p.id} className="philix-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                i === 0 ? "bg-amber-400 text-amber-900" : i === 1 ? "bg-slate-500 text-slate-100" : "bg-orange-800 text-orange-100"
              }`}>
                #{i + 1}
              </div>
              <div>
                <div className="font-semibold text-slate-100">{p.name}</div>
                <div className="text-xs text-slate-500">{p.role.replace("_", " ")}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Loans Issued", value: p.loansIssued, icon: CreditCard },
                { label: "Collection Rate", value: `${p.collectionRate}%`, icon: TrendingUp },
                { label: "Active Loans", value: p.activeLoans, icon: Activity },
                { label: "Defaults", value: p.defaults, icon: AlertTriangle },
              ].map((m) => (
                <div key={m.label} className="bg-slate-800/50 rounded-lg p-2.5">
                  <div className="text-lg font-bold text-slate-100">{m.value}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <m.icon size={10} />
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Disbursed</span>
                <span className="text-slate-200 font-medium">{formatKwacha(p.totalDisbursed)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-400">Total Collected</span>
                <span className="text-emerald-400 font-medium">{formatKwacha(p.totalCollected)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
