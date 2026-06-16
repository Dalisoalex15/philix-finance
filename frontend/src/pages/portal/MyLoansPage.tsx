import { useState } from "react";
import { ChevronDown, ChevronUp, CreditCard, CheckCircle, Clock, AlertCircle, Calendar, Receipt } from "lucide-react";

const mockLoans = [
  {
    id: "loan-001", loanNumber: "PHX-L-2024-0034", product: "Salary Advance",
    principal: 5000, outstanding: 2160, totalRepayable: 6300, interestRate: 5,
    termMonths: 5, monthsPaid: 3, disbursedAt: "2025-04-01",
    status: "ACTIVE", nextPaymentDate: "2025-07-25", nextPaymentAmount: 1080,
    payments: [
      { id: "p1", date: "2025-06-15", amount: 1080, method: "Cash", reference: "RCP-20250615-001", status: "PAID" },
      { id: "p2", date: "2025-05-15", amount: 1080, method: "Mobile Money", reference: "RCP-20250515-001", status: "PAID" },
      { id: "p3", date: "2025-04-15", amount: 1080, method: "Cash", reference: "RCP-20250415-001", status: "PAID" },
    ],
    schedule: [
      { month: 1, dueDate: "2025-04-15", amount: 1080, status: "PAID" },
      { month: 2, dueDate: "2025-05-15", amount: 1080, status: "PAID" },
      { month: 3, dueDate: "2025-06-15", amount: 1080, status: "PAID" },
      { month: 4, dueDate: "2025-07-25", amount: 1080, status: "UPCOMING" },
      { month: 5, dueDate: "2025-08-25", amount: 900, status: "UPCOMING" },
    ],
  },
  {
    id: "loan-002", loanNumber: "PHX-L-2023-0015", product: "Micro Loan",
    principal: 1500, outstanding: 0, totalRepayable: 1800, interestRate: 6,
    termMonths: 2, monthsPaid: 2, disbursedAt: "2023-09-01",
    status: "CLOSED", nextPaymentDate: null, nextPaymentAmount: 0,
    payments: [
      { id: "p3", date: "2023-11-01", amount: 900, method: "Cash", reference: "RCP-20231101-001", status: "PAID" },
      { id: "p4", date: "2023-10-01", amount: 900, method: "Cash", reference: "RCP-20231001-001", status: "PAID" },
    ],
    schedule: [
      { month: 1, dueDate: "2023-10-01", amount: 900, status: "PAID" },
      { month: 2, dueDate: "2023-11-01", amount: 900, status: "PAID" },
    ],
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
  CLOSED: "bg-slate-800 text-slate-500 border-slate-700",
  OVERDUE: "bg-red-900/30 text-red-400 border-red-800/40",
  APPROVED: "bg-blue-900/30 text-blue-400 border-blue-800/40",
};

const scheduleStatusIcon = (s: string) => {
  if (s === "PAID") return <CheckCircle size={13} className="text-emerald-400" />;
  if (s === "OVERDUE") return <AlertCircle size={13} className="text-red-400" />;
  return <Clock size={13} className="text-slate-500" />;
};

export default function MyLoansPage() {
  const [expanded, setExpanded] = useState<string | null>("loan-001");
  const [tab, setTab] = useState<Record<string, "history" | "schedule">>({});

  const getTab = (id: string) => tab[id] ?? "history";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Loans</h1>
        <p className="text-slate-500 text-sm mt-1">Your loan history and repayment records</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Loans", value: "1", color: "text-emerald-400" },
          { label: "Total Borrowed", value: "K6,500", color: "text-slate-200" },
          { label: "Outstanding", value: "K2,160", color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loan list */}
      <div className="space-y-4">
        {mockLoans.map(loan => {
          const isOpen = expanded === loan.id;
          const pct = Math.round(((loan.principal - loan.outstanding) / loan.principal) * 100);
          const currentTab = getTab(loan.id);

          return (
            <div key={loan.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Header */}
              <button onClick={() => setExpanded(isOpen ? null : loan.id)}
                className="w-full text-left p-5 flex items-start gap-4 hover:bg-slate-800/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-200">{loan.product}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[loan.status] ?? statusColors.ACTIVE}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">{loan.loanNumber}</div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div><span className="text-slate-500 text-xs">Principal: </span><span className="text-slate-300 font-medium">K{loan.principal.toLocaleString()}</span></div>
                    {loan.outstanding > 0
                      ? <div><span className="text-slate-500 text-xs">Outstanding: </span><span className="text-amber-400 font-medium">K{loan.outstanding.toLocaleString()}</span></div>
                      : <div><span className="text-emerald-400 font-medium text-xs">Fully Repaid ✓</span></div>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-slate-600">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-slate-800">
                  {/* Progress bar */}
                  <div className="px-5 pt-4 pb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{loan.monthsPaid} / {loan.termMonths} payments made</span>
                      <span className="text-emerald-400 font-semibold">{pct}% repaid</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="px-5 py-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {[
                      { l: "Interest Rate", v: `${loan.interestRate}% / month` },
                      { l: "Term", v: `${loan.termMonths} months` },
                      { l: "Total Repayable", v: `K${loan.totalRepayable.toLocaleString()}` },
                      { l: "Disbursed", v: new Date(loan.disbursedAt).toLocaleDateString("en-GB") },
                      ...(loan.nextPaymentDate ? [
                        { l: "Next Payment", v: `K${loan.nextPaymentAmount.toLocaleString()}` },
                        { l: "Due Date", v: new Date(loan.nextPaymentDate).toLocaleDateString("en-GB") },
                      ] : []),
                    ].map(r => (
                      <div key={r.l} className="flex justify-between border-b border-slate-800/50 pb-1.5">
                        <span className="text-slate-500">{r.l}</span>
                        <span className="text-slate-300 font-medium">{r.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Next payment callout (active loans) */}
                  {loan.status === "ACTIVE" && loan.nextPaymentDate && (
                    <div className="mx-5 mb-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-400" />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">Next Payment Due</div>
                          <div className="text-xs text-slate-500">
                            {new Date(loan.nextPaymentDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-indigo-300">K{loan.nextPaymentAmount.toLocaleString()}</div>
                    </div>
                  )}

                  {/* Tab switcher */}
                  <div className="px-5 pb-1">
                    <div className="flex border-b border-slate-800">
                      {(["history", "schedule"] as const).map(t => (
                        <button key={t} onClick={() => setTab(prev => ({ ...prev, [loan.id]: t }))}
                          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${currentTab === t ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-600 hover:text-slate-400"}`}>
                          {t === "history" ? <Receipt size={12} /> : <Calendar size={12} />}
                          {t === "history" ? "Payment History" : "Repayment Schedule"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="p-5 pt-3 space-y-2">
                    {currentTab === "history" && (
                      <>
                        {loan.payments.length === 0
                          ? <div className="text-center text-sm text-slate-600 py-6">No payments recorded yet</div>
                          : loan.payments.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-slate-800/40 rounded-xl px-4 py-3">
                              <div className="flex items-center gap-3">
                                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                                <div>
                                  <div className="text-sm text-slate-300 font-medium">K{p.amount.toLocaleString()}</div>
                                  <div className="text-xs text-slate-600 mt-0.5">{new Date(p.date).toLocaleDateString("en-GB")} · {p.method}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full">{p.status}</span>
                                <div className="text-xs text-slate-600 mt-0.5 font-mono truncate max-w-[120px]">{p.reference}</div>
                              </div>
                            </div>
                          ))}
                      </>
                    )}

                    {currentTab === "schedule" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-800">
                              <th className="text-left text-slate-600 font-semibold py-2 pr-4">#</th>
                              <th className="text-left text-slate-600 font-semibold py-2 pr-4">Due Date</th>
                              <th className="text-right text-slate-600 font-semibold py-2 pr-4">Amount</th>
                              <th className="text-right text-slate-600 font-semibold py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loan.schedule.map(s => (
                              <tr key={s.month} className={`border-b border-slate-800/40 ${s.status === "UPCOMING" ? "opacity-60" : ""}`}>
                                <td className="py-2.5 pr-4 text-slate-500">{s.month}</td>
                                <td className="py-2.5 pr-4 text-slate-300">
                                  {new Date(s.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td className="py-2.5 pr-4 text-right font-semibold text-slate-200">K{s.amount.toLocaleString()}</td>
                                <td className="py-2.5 text-right">
                                  <span className="flex items-center gap-1 justify-end">
                                    {scheduleStatusIcon(s.status)}
                                    <span className={s.status === "PAID" ? "text-emerald-400" : s.status === "OVERDUE" ? "text-red-400" : "text-slate-500"}>
                                      {s.status === "UPCOMING" ? "Upcoming" : s.status}
                                    </span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-slate-700">
                              <td colSpan={2} className="py-2.5 text-slate-500 font-semibold">Total</td>
                              <td className="py-2.5 text-right font-bold text-slate-200">K{loan.schedule.reduce((a, s) => a + s.amount, 0).toLocaleString()}</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
        <div className="font-semibold text-slate-300 mb-1">Need help with a loan?</div>
        <div className="text-xs text-slate-500 mb-3">Contact our support team for repayment assistance or loan restructuring</div>
        <a href="tel:+260211000000" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">📞 +260 211 XXX XXX</a>
      </div>
    </div>
  );
}
