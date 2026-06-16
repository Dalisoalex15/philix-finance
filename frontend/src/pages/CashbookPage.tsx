import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, DollarSign, TrendingUp, PlusCircle } from "lucide-react";
import { mockCashbook, formatKwacha, formatDate } from "../lib/mock-data";

export default function CashbookPage() {
  const [filter, setFilter] = useState<"ALL" | "RECEIPT" | "PAYMENT">("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "RECEIPT", category: "LOAN_REPAYMENT", description: "", amount: "", reference: "" });

  const entries = filter === "ALL" ? mockCashbook : mockCashbook.filter(e => e.type === filter);
  const totalReceipts = mockCashbook.filter(e => e.type === "RECEIPT").reduce((s, e) => s + e.amount, 0);
  const totalPayments = mockCashbook.filter(e => e.type === "PAYMENT").reduce((s, e) => s + e.amount, 0);
  const openingBalance = 248750;
  const closingBalance = openingBalance + totalReceipts - totalPayments;

  const categories: Record<string, string> = {
    LOAN_REPAYMENT: "Loan Repayment", LOAN_DISBURSEMENT: "Loan Disbursement",
    PROCESSING_FEE: "Processing Fee", SALARY: "Salary", FUEL: "Fuel",
    RENT: "Rent", UTILITIES: "Utilities", MARKETING: "Marketing",
    PENALTY: "Penalty Income", INVESTOR: "Investor Payment", OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Cashbook</h1>
          <p className="page-subtitle">Cash receipts and payments · Real-time vault balance</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <PlusCircle size={14} /> Record Transaction
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Opening Balance", value: formatKwacha(openingBalance), color: "text-slate-200", icon: DollarSign },
          { label: "Total Receipts", value: formatKwacha(totalReceipts), color: "text-emerald-400", icon: ArrowDownLeft },
          { label: "Total Payments", value: formatKwacha(totalPayments), color: "text-red-400", icon: ArrowUpRight },
          { label: "Closing Balance", value: formatKwacha(closingBalance), color: "text-indigo-400", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="philix-card p-5 border-indigo-800/50 border animate-fade-in">
          <h3 className="section-title mb-4">Record Cash Transaction</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select className="input-base" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="RECEIPT">Receipt (Cash In)</option>
                <option value="PAYMENT">Payment (Cash Out)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select className="input-base" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount (ZMW)</label>
              <input type="number" className="input-base" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Description *</label>
              <input className="input-base" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Mwansa Tembo — installment 4" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reference No.</label>
              <input className="input-base" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Receipt/cheque no." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-success">Save Transaction</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["ALL", "RECEIPT", "PAYMENT"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>
            {f === "ALL" ? "All Transactions" : f === "RECEIPT" ? "Receipts Only" : "Payments Only"}
          </button>
        ))}
      </div>

      {/* Cashbook Table */}
      <div className="philix-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th className="text-right">Amount</th><th className="text-right">Balance</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="table-row-hover">
                <td className="text-xs text-slate-400 whitespace-nowrap">{formatDate(e.date)}</td>
                <td className="text-slate-300 max-w-xs truncate">{e.description}</td>
                <td className="text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                    {categories[e.category] || e.category}
                  </span>
                </td>
                <td>
                  {e.type === "RECEIPT"
                    ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><ArrowDownLeft size={12} />IN</span>
                    : <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><ArrowUpRight size={12} />OUT</span>}
                </td>
                <td className={`text-right font-bold font-mono ${e.type === "RECEIPT" ? "text-emerald-400" : "text-red-400"}`}>
                  {e.type === "RECEIPT" ? "+" : "-"}{formatKwacha(e.amount)}
                </td>
                <td className="text-right font-mono text-sm text-slate-300">{formatKwacha(e.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700">
              <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-slate-300">CLOSING BALANCE (Today)</td>
              <td colSpan={2} className="text-right px-4 py-3 font-bold font-mono text-indigo-400 text-lg">{formatKwacha(closingBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
