import { useState } from "react";
import { DollarSign, Plus, CheckCircle } from "lucide-react";
import { mockLoans, formatKwacha, formatDate } from "../lib/mock-data";

interface Payment {
  id: string;
  loanId: string;
  loanNumber: string;
  clientName: string;
  amount: number;
  method: string;
  reference?: string;
  paymentDate: string;
  type: string;
}

export default function RepaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([
    { id: "pay-001", loanId: "loan-001", loanNumber: "PF-2024-1001", clientName: "Mwansa Tembo", amount: 2450, method: "CASH", paymentDate: new Date(Date.now() - 86400000).toISOString(), type: "INSTALLMENT" },
    { id: "pay-002", loanId: "loan-002", loanNumber: "PF-2024-1002", clientName: "Grace Mwale", amount: 1475, method: "MOBILE_MONEY", reference: "MTN-8827391", paymentDate: new Date(Date.now() - 2 * 86400000).toISOString(), type: "INSTALLMENT" },
    { id: "pay-003", loanId: "loan-001", loanNumber: "PF-2024-1001", clientName: "Mwansa Tembo", amount: 2450, method: "BANK_TRANSFER", reference: "ZNB-001-2024", paymentDate: new Date(Date.now() - 30 * 86400000).toISOString(), type: "INSTALLMENT" },
    { id: "pay-004", loanId: "loan-004", loanNumber: "PF-2024-1004", clientName: "Namukolo Phiri", amount: 1950, method: "CASH", paymentDate: new Date(Date.now() - 45 * 86400000).toISOString(), type: "INSTALLMENT" },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ loanId: "", amount: "", method: "CASH", reference: "", notes: "", paymentDate: new Date().toISOString().slice(0, 10) });
  const [success, setSuccess] = useState("");

  const activeLoans = mockLoans.filter(l => l.status === "ACTIVE" || l.status === "OVERDUE");

  const recordPayment = () => {
    if (!form.loanId || !form.amount) return;
    const loan = activeLoans.find(l => l.id === form.loanId);
    if (!loan) return;
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      loanId: form.loanId,
      loanNumber: loan.loanNumber,
      clientName: `${loan.client.firstName} ${loan.client.lastName}`,
      amount: parseFloat(form.amount),
      method: form.method,
      reference: form.reference || undefined,
      paymentDate: form.paymentDate,
      type: "INSTALLMENT",
    };
    setPayments(prev => [payment, ...prev]);
    setSuccess(`Payment of ${formatKwacha(payment.amount)} recorded successfully for ${payment.clientName}`);
    setForm({ loanId: "", amount: "", method: "CASH", reference: "", notes: "", paymentDate: new Date().toISOString().slice(0, 10) });
    setShowNew(false);
    setTimeout(() => setSuccess(""), 4000);
  };

  const totalToday = payments.filter(p => {
    const pDate = new Date(p.paymentDate);
    const today = new Date();
    return pDate.toDateString() === today.toDateString();
  }).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repayments</h1>
          <p className="page-subtitle">Record and track loan repayments</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} />
          Record Payment
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg text-emerald-400 animate-fade-in">
          <CheckCircle size={16} />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">{formatKwacha(totalToday)}</div>
            <div className="text-xs text-slate-400">Collected Today</div>
          </div>
        </div>
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{payments.length}</div>
            <div className="text-xs text-slate-400">Total Payments</div>
          </div>
        </div>
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
            <DollarSign size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{formatKwacha(payments.reduce((s, p) => s + p.amount, 0))}</div>
            <div className="text-xs text-slate-400">Total Collected</div>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="philix-card p-5 border-indigo-800/50 border animate-fade-in">
          <h3 className="section-title mb-4">Record Payment</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Select Loan *</label>
              <select className="input-base" value={form.loanId} onChange={(e) => setForm(p => ({ ...p, loanId: e.target.value }))}>
                <option value="">Choose a loan...</option>
                {activeLoans.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.loanNumber} — {l.client.firstName} {l.client.lastName} (Outstanding: {formatKwacha(l.outstandingBalance)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount (K) *</label>
              <input type="number" className="input-base" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Payment Method</label>
              <select className="input-base" value={form.method} onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}>
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money (MTN/Airtel)</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reference / Receipt #</label>
              <input className="input-base" placeholder="Optional" value={form.reference} onChange={(e) => setForm(p => ({ ...p, reference: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Payment Date</label>
              <input type="date" className="input-base" value={form.paymentDate} onChange={(e) => setForm(p => ({ ...p, paymentDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={recordPayment} className="btn-success" disabled={!form.loanId || !form.amount}>Record Payment</button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Loan #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="table-row-hover">
                  <td className="text-xs text-slate-400">{formatDate(p.paymentDate)}</td>
                  <td className="font-mono text-xs text-indigo-400">{p.loanNumber}</td>
                  <td className="font-medium text-slate-200">{p.clientName}</td>
                  <td className="text-emerald-400 font-semibold">{formatKwacha(p.amount)}</td>
                  <td className="text-xs text-slate-400">{p.method.replace("_", " ")}</td>
                  <td className="text-xs text-slate-500 font-mono">{p.reference || "—"}</td>
                  <td><span className="badge-blue text-[10px]">{p.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
