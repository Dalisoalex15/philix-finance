import { useState } from "react";
import { CheckCircle, AlertTriangle, Building2 } from "lucide-react";
import { mockBankReconciliation, formatKwacha, formatDate } from "../lib/mock-data";

export default function BankReconciliationPage() {
  const [recon, setRecon] = useState(mockBankReconciliation[0]);
  const [status, setStatus] = useState(recon.status);

  const isBalanced = Math.abs(recon.difference) < 0.01;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Reconciliation</h1>
          <p className="page-subtitle">Match bank statements with internal cashbook records</p>
        </div>
        <button className="btn-primary">+ New Reconciliation</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reconciliation Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="philix-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-indigo-400" />
              <h3 className="section-title">Zanaco Bank — June 2025</h3>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${status === "RECONCILED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Bank Name</label>
                <input className="input-base" defaultValue={recon.bankName} readOnly />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Account Number</label>
                <input className="input-base" defaultValue={recon.accountNumber} readOnly />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Statement Date</label>
                <input type="date" className="input-base" defaultValue={new Date(recon.statementDate).toISOString().split("T")[0]} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="philix-card p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Bank Statement Balance</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Closing Balance per Bank</span>
                  <span className="font-bold text-blue-400">{formatKwacha(recon.statementBalance)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Add: Deposits in Transit</span>
                  <span className="text-slate-300">K 0.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Less: Outstanding Cheques</span>
                  <span className="text-red-400">-{formatKwacha(1500)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-slate-200">Adjusted Bank Balance</span>
                  <span className="text-emerald-400">{formatKwacha(recon.statementBalance - 1500)}</span>
                </div>
              </div>
            </div>

            <div className="philix-card p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Book (Cashbook) Balance</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Closing Balance per Books</span>
                  <span className="font-bold text-blue-400">{formatKwacha(recon.bookBalance)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Add: Bank Interest Earned</span>
                  <span className="text-emerald-400">+K 0.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Less: Bank Charges</span>
                  <span className="text-red-400">-K 0.00</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-slate-200">Adjusted Book Balance</span>
                  <span className="text-emerald-400">{formatKwacha(recon.bookBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difference */}
          <div className={`philix-card p-5 border ${isBalanced ? "border-emerald-800/50" : "border-amber-800/50"}`}>
            <div className="flex items-center gap-3">
              {isBalanced
                ? <CheckCircle size={20} className="text-emerald-400" />
                : <AlertTriangle size={20} className="text-amber-400" />}
              <div className="flex-1">
                <div className={`text-sm font-semibold ${isBalanced ? "text-emerald-400" : "text-amber-400"}`}>
                  {isBalanced ? "Balances Match — Reconciled" : `Difference of ${formatKwacha(Math.abs(recon.difference))} found`}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{recon.notes}</div>
              </div>
              <div className={`text-xl font-bold font-mono ${isBalanced ? "text-emerald-400" : "text-amber-400"}`}>
                {formatKwacha(Math.abs(recon.difference))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStatus("RECONCILED")} className="btn-success" disabled={!isBalanced && status !== "RECONCILED"}>
              <CheckCircle size={14} /> Mark as Reconciled
            </button>
            <button className="btn-secondary">Save Draft</button>
          </div>
        </div>

        {/* History */}
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Reconciliation History</h3>
          <div className="space-y-3">
            {[
              { month: "May 2025", status: "RECONCILED", difference: 0 },
              { month: "Apr 2025", status: "RECONCILED", difference: 0 },
              { month: "Mar 2025", status: "RECONCILED", difference: 0 },
              { month: "Jun 2025", status: recon.status, difference: recon.difference },
            ].reverse().map((h) => (
              <div key={h.month} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <div className="text-sm text-slate-200">{h.month}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${h.status === "RECONCILED" ? "text-emerald-400" : "text-amber-400"}`}>{h.status}</div>
                </div>
                {h.status === "RECONCILED"
                  ? <CheckCircle size={14} className="text-emerald-400" />
                  : <span className="text-xs text-amber-400">{formatKwacha(Math.abs(h.difference))}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
