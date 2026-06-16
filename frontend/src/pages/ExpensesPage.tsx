import { useState } from "react";
import { Plus, DollarSign, CheckCircle, Clock } from "lucide-react";
import { mockExpenses, formatKwacha, formatDate } from "../lib/mock-data";

const CATEGORIES = [
  "SALARY", "RENT", "UTILITIES", "INTERNET", "AIRTIME",
  "FUEL", "TRANSPORT", "MARKETING", "STATIONERY", "MAINTENANCE", "INSURANCE", "OTHER"
];

const CAT_COLORS: Record<string, string> = {
  SALARY: "badge-blue", RENT: "badge-yellow", UTILITIES: "badge-gray",
  INTERNET: "badge-blue", AIRTIME: "badge-gray", FUEL: "badge-yellow",
  TRANSPORT: "badge-gray", MARKETING: "badge-green", STATIONERY: "badge-gray",
  MAINTENANCE: "badge-yellow", INSURANCE: "badge-blue", OTHER: "badge-gray",
};

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  vendorName?: string | null;
  submittedBy: { firstName: string; lastName: string };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses as Expense[]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ category: "FUEL", description: "", amount: "", date: new Date().toISOString().slice(0, 10), vendorName: "" });

  const total = expenses.filter(e => e.status === "APPROVED").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "PENDING").length;

  const addExpense = () => {
    if (!form.description || !form.amount) return;
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      status: "PENDING",
      vendorName: form.vendorName || null,
      submittedBy: { firstName: "Daliso", lastName: "Phiri" },
    };
    setExpenses((prev) => [expense, ...prev]);
    setForm({ category: "FUEL", description: "", amount: "", date: new Date().toISOString().slice(0, 10), vendorName: "" });
    setShowNew(false);
  };

  const approve = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "APPROVED" } : e));
  const reject = (id: string) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "REJECTED" } : e));

  const byCategory = CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat && e.status === "APPROVED").reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track, categorize, and approve operational expenses</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month (Approved)", value: formatKwacha(total), icon: DollarSign, color: "red" },
          { label: "Pending Approval", value: pending.toString(), icon: Clock, color: "amber" },
          { label: "Approved Entries", value: expenses.filter(e => e.status === "APPROVED").length.toString(), icon: CheckCircle, color: "emerald" },
          { label: "Largest Category", value: byCategory[0]?.category || "—", icon: DollarSign, color: "blue" },
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

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Breakdown by Category</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {byCategory.map((c) => (
              <div key={c.category} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm font-medium text-slate-300">{formatKwacha(c.total)}</div>
                <div className="text-xs text-slate-500 mt-0.5">{c.category}</div>
                <div className="mt-2 h-1 bg-slate-700 rounded-full">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.total / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Expense Form */}
      {showNew && (
        <div className="philix-card p-5 border-indigo-800/50 border animate-fade-in">
          <h3 className="section-title mb-4">Submit Expense</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select className="input-base" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount (K) *</label>
              <input type="number" className="input-base" placeholder="0.00" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input type="date" className="input-base" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Vendor / Supplier</label>
              <input className="input-base" placeholder="Optional" value={form.vendorName} onChange={(e) => setForm(p => ({ ...p, vendorName: e.target.value }))} />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Description *</label>
              <input className="input-base" placeholder="Brief description of the expense" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addExpense} className="btn-primary">Submit Expense</button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="table-row-hover">
                  <td className="text-xs text-slate-400">{formatDate(exp.date)}</td>
                  <td><span className={CAT_COLORS[exp.category] || "badge-gray"}>{exp.category}</span></td>
                  <td className="text-slate-200">{exp.description}</td>
                  <td className="text-slate-400 text-xs">{exp.vendorName || "—"}</td>
                  <td className={`font-medium ${exp.status === "APPROVED" ? "text-red-400" : "text-slate-300"}`}>
                    {formatKwacha(exp.amount)}
                  </td>
                  <td className="text-slate-400 text-xs">{exp.submittedBy.firstName} {exp.submittedBy.lastName}</td>
                  <td>
                    <span className={exp.status === "APPROVED" ? "badge-green" : exp.status === "REJECTED" ? "badge-red" : "badge-yellow"}>
                      {exp.status}
                    </span>
                  </td>
                  <td>
                    {exp.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => approve(exp.id)} className="px-2 py-0.5 text-xs rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40">
                          Approve
                        </button>
                        <button onClick={() => reject(exp.id)} className="px-2 py-0.5 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/40">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
