import { useState } from "react";
import { TrendingUp, DollarSign, Users, ChevronDown, ChevronUp, Download } from "lucide-react";
import { mockInvestorStatements, formatKwacha, formatDate } from "../lib/mock-data";

export default function InvestorStatementsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const totalCapital = mockInvestorStatements.reduce((s, i) => s + i.capitalAmount, 0);
  const totalPaid = mockInvestorStatements.reduce((s, i) => s + i.totalPaid, 0);
  const totalPending = mockInvestorStatements.reduce((s, i) => s + i.pendingReturns, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investor Statements</h1>
          <p className="page-subtitle">Capital accounts, return history, and investor portfolio statements</p>
        </div>
        <button className="btn-secondary text-xs py-1.5"><Download size={12} /> Export All Statements</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Investor Capital", value: formatKwacha(totalCapital), color: "text-blue-400", icon: DollarSign },
          { label: "Total Returns Paid", value: formatKwacha(totalPaid), color: "text-emerald-400", icon: TrendingUp },
          { label: "Pending Returns", value: formatKwacha(totalPending), color: "text-amber-400", icon: Users },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {mockInvestorStatements.map(inv => (
          <div key={inv.id} className="philix-card overflow-hidden">
            <button onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 text-sm flex-shrink-0">
                {inv.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-slate-200">{inv.fullName}</div>
                <div className="text-xs text-slate-500">{inv.investorType} · Since {formatDate(inv.contractStart)}</div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-right">
                <div>
                  <div className="text-xs text-slate-500">Capital</div>
                  <div className="font-bold text-slate-200">{formatKwacha(inv.capitalAmount)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Return Rate</div>
                  <div className="font-bold text-blue-400">{inv.returnRate}% p.a.</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Paid</div>
                  <div className="font-bold text-emerald-400">{formatKwacha(inv.totalPaid)}</div>
                </div>
              </div>
              {expanded === inv.id
                ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" />
                : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
            </button>

            {expanded === inv.id && (
              <div className="border-t border-slate-800 p-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Contract Start", value: formatDate(inv.contractStart) },
                    { label: "Contract End", value: inv.contractEnd ? formatDate(inv.contractEnd) : "Open" },
                    { label: "Phone", value: inv.phone },
                    { label: "Email", value: inv.email || "—" },
                    { label: "Annual Return", value: formatKwacha(inv.capitalAmount * inv.returnRate / 100) },
                    { label: "Monthly Return", value: formatKwacha(inv.capitalAmount * inv.returnRate / 100 / 12) },
                    { label: "Total Paid to Date", value: formatKwacha(inv.totalPaid) },
                    { label: "Pending Returns", value: formatKwacha(inv.pendingReturns) },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-800/50 rounded p-2.5">
                      <div className="text-xs text-slate-500">{f.label}</div>
                      <div className="text-sm font-medium text-slate-200 mt-0.5">{f.value}</div>
                    </div>
                  ))}
                </div>

                {inv.transactions && inv.transactions.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Transaction History</div>
                    <table className="data-table">
                      <thead>
                        <tr><th>Date</th><th>Type</th><th>Amount</th><th>Reference</th><th>Notes</th></tr>
                      </thead>
                      <tbody>
                        {inv.transactions.map((tx: { id: string; date: string; type: string; amount: number; reference?: string; notes?: string }) => (
                          <tr key={tx.id} className="table-row-hover">
                            <td className="text-xs text-slate-400">{formatDate(tx.date)}</td>
                            <td><span className={`text-xs font-semibold ${tx.type === "RETURN_PAYMENT" ? "text-emerald-400" : tx.type === "CAPITAL_IN" ? "text-blue-400" : "text-amber-400"}`}>{tx.type.replace("_", " ")}</span></td>
                            <td className={`font-bold ${tx.type === "CAPITAL_IN" ? "text-blue-400" : "text-emerald-400"}`}>{formatKwacha(tx.amount)}</td>
                            <td className="text-xs text-slate-400">{tx.reference || "—"}</td>
                            <td className="text-xs text-slate-500">{tx.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn-primary text-xs py-1.5"><Download size={11} /> Generate Statement</button>
                  <button className="btn-secondary text-xs py-1.5">Record Payment</button>
                  <button className="btn-secondary text-xs py-1.5">Send Statement by Email</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
