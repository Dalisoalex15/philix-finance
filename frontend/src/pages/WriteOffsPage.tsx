import { useState } from "react";
import { XCircle, AlertTriangle, CheckCircle, Slash } from "lucide-react";
import { mockWriteOffs, mockPenalties, formatKwacha, formatDate } from "../lib/mock-data";

export default function WriteOffsPage() {
  const [tab, setTab] = useState<"writeoffs" | "penalties">("writeoffs");
  const [showForm, setShowForm] = useState(false);

  const totalWrittenOff = mockWriteOffs.reduce((s, w) => s + w.amount, 0);
  const totalPenalties = mockPenalties.filter(p => !p.waived).reduce((s, p) => s + p.amount, 0);
  const waivedPenalties = mockPenalties.filter(p => p.waived).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Write-offs & Penalty Management</h1>
          <p className="page-subtitle">Bad debt write-offs · Penalty accruals · Waiver approvals</p>
        </div>
        {tab === "writeoffs" && <button onClick={() => setShowForm(true)} className="btn-danger"><Slash size={14} /> Record Write-off</button>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <XCircle size={20} className="text-red-400 mb-2" />
          <div className="text-xl font-bold text-red-400">{formatKwacha(totalWrittenOff)}</div>
          <div className="text-xs text-slate-400 mt-1">Total Written Off</div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={20} className="text-amber-400 mb-2" />
          <div className="text-xl font-bold text-amber-400">{formatKwacha(totalPenalties)}</div>
          <div className="text-xs text-slate-400 mt-1">Outstanding Penalties</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={20} className="text-slate-400 mb-2" />
          <div className="text-xl font-bold text-slate-400">{formatKwacha(waivedPenalties)}</div>
          <div className="text-xs text-slate-400 mt-1">Penalties Waived</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["writeoffs", "penalties"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${tab === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {t === "writeoffs" ? "Write-offs" : "Penalty Ledger"}
          </button>
        ))}
      </div>

      {showForm && tab === "writeoffs" && (
        <div className="philix-card p-5 border-red-800/50 border animate-fade-in">
          <h3 className="section-title mb-4 text-red-400">Record Loan Write-off</h3>
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-4 text-xs text-red-300">
            <AlertTriangle size={12} className="inline mr-1" />
            Write-offs are irreversible. This requires CEO approval and creates an audit entry. The loan balance moves to bad debt expense.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Select Loan (Defaulted) *</label>
              <select className="input-base">
                <option>PHX-L-0003 — Miriam Sichone — K5,200</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Write-off Amount (K)</label>
              <input type="number" className="input-base" defaultValue={5200} />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Reason / Justification *</label>
              <textarea className="input-base" rows={3} placeholder="Why is this loan being written off? All recovery efforts exhausted?" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-danger">Confirm Write-off</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {tab === "writeoffs" && (
        <div className="philix-card overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="section-title">Write-off Register</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Loan</th><th>Client</th><th>Amount Written Off</th><th>Reason</th><th>Approved By</th><th>Date</th></tr>
            </thead>
            <tbody>
              {mockWriteOffs.map(wo => (
                <tr key={wo.id} className="table-row-hover">
                  <td className="font-mono text-xs text-indigo-400">{wo.loan.loanNumber}</td>
                  <td className="font-medium text-slate-200">{wo.loan.client.firstName} {wo.loan.client.lastName}</td>
                  <td className="font-bold text-red-400">{formatKwacha(wo.amount)}</td>
                  <td className="text-xs text-slate-400 max-w-xs truncate">{wo.reason}</td>
                  <td className="text-sm text-slate-300">{wo.approvedBy.firstName} {wo.approvedBy.lastName}</td>
                  <td className="text-xs text-slate-500">{formatDate(wo.approvedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "penalties" && (
        <div className="philix-card overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="section-title">Penalty Ledger</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Loan</th><th>Client</th><th>Days Late</th><th>Penalty Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {mockPenalties.map(pen => (
                <tr key={pen.id} className="table-row-hover">
                  <td className="font-mono text-xs text-indigo-400">{pen.loan.loanNumber}</td>
                  <td className="font-medium text-slate-200">{pen.loan.client.firstName} {pen.loan.client.lastName}</td>
                  <td>
                    <span className={`text-sm font-bold ${pen.daysLate > 90 ? "text-red-400" : pen.daysLate > 30 ? "text-amber-400" : "text-yellow-400"}`}>
                      {pen.daysLate} days
                    </span>
                  </td>
                  <td className={`font-bold ${pen.waived ? "text-slate-500 line-through" : "text-red-400"}`}>
                    {formatKwacha(pen.amount)}
                  </td>
                  <td>
                    {pen.waived
                      ? <span className="badge-gray text-xs">WAIVED — {pen.waivedReason}</span>
                      : <div className="flex items-center gap-2">
                          <span className="badge-red text-xs">OUTSTANDING</span>
                          <button className="text-xs text-slate-500 hover:text-slate-300 underline">Waive</button>
                        </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
