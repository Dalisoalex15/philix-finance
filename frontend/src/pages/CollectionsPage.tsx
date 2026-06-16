import { useState } from "react";
import { Phone, MessageCircle, Mail, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { mockLoans, mockCollectionsDashboard, formatKwacha, formatDate } from "../lib/mock-data";

const overdueLoans = mockLoans.filter((l) => l.status === "OVERDUE" || l.status === "DEFAULTED");

const categoryConfig: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  CURRENT: { label: "Current", color: "text-emerald-400", bg: "bg-emerald-900/30", ring: "border-emerald-800/50" },
  AT_RISK: { label: "At Risk", color: "text-yellow-400", bg: "bg-yellow-900/20", ring: "border-yellow-800/50" },
  DAYS_30: { label: "30+ Days", color: "text-orange-400", bg: "bg-orange-900/20", ring: "border-orange-800/50" },
  DAYS_60: { label: "60+ Days", color: "text-red-400", bg: "bg-red-900/20", ring: "border-red-800/50" },
  DEFAULT: { label: "Default", color: "text-red-600", bg: "bg-red-900/30", ring: "border-red-900/50" },
};

type LogType = { type: string; notes: string; outcome?: string; promiseAmount?: number; promiseDate?: string };

export default function CollectionsPage() {
  const [selectedLoan, setSelectedLoan] = useState<typeof overdueLoans[0] | null>(null);
  const [logType, setLogType] = useState("CALL");
  const [notes, setNotes] = useState("");
  const [promiseAmount, setPromiseAmount] = useState("");
  const [promiseDate, setPromiseDate] = useState("");
  const [logs, setLogs] = useState<Record<string, LogType[]>>({});

  const handleLog = () => {
    if (!selectedLoan || !notes) return;
    const log: LogType = { type: logType, notes, outcome: "Contacted", promiseAmount: promiseAmount ? parseFloat(promiseAmount) : undefined, promiseDate: promiseDate || undefined };
    setLogs((prev) => ({ ...prev, [selectedLoan.id]: [...(prev[selectedLoan.id] || []), log] }));
    setNotes("");
    setPromiseAmount("");
    setPromiseDate("");
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collections Center</h1>
          <p className="page-subtitle">Manage overdue accounts, contact logs, and recovery</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { key: "CURRENT", count: mockCollectionsDashboard.current },
          { key: "AT_RISK", count: mockCollectionsDashboard.atRisk },
          { key: "DAYS_30", count: mockCollectionsDashboard.days30 },
          { key: "DAYS_60", count: mockCollectionsDashboard.days60 },
          { key: "DAYS_90", count: mockCollectionsDashboard.days90 },
          { key: "DEFAULT", count: mockCollectionsDashboard.defaulted },
        ].map(({ key, count }) => {
          const cfg = categoryConfig[key] || categoryConfig.CURRENT;
          return (
            <div key={key} className={`philix-card p-4 border ${cfg.ring}`}>
              <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
              <div className={`text-xs font-medium mt-1 ${cfg.color}`}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Overdue Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="philix-card p-4 flex items-center gap-4">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-red-400">{formatKwacha(mockCollectionsDashboard.totalOverdueAmount)}</div>
            <div className="text-sm text-slate-400">Total Overdue Balance</div>
          </div>
        </div>
        <div className="philix-card p-4 flex items-center gap-4">
          <FileText size={24} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-2xl font-bold text-amber-400">{formatKwacha(mockCollectionsDashboard.totalPenalties)}</div>
            <div className="text-sm text-slate-400">Total Penalties Accrued</div>
          </div>
        </div>
      </div>

      {/* Main Collections View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Overdue Loans List */}
        <div className="lg:col-span-3 philix-card overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="section-title">Overdue & Default Loans</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {overdueLoans.map((loan) => (
              <div
                key={loan.id}
                className={`p-4 cursor-pointer transition-colors ${selectedLoan?.id === loan.id ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
                onClick={() => setSelectedLoan(loan)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400">{loan.loanNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        loan.status === "DEFAULTED" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
                      }`}>
                        {loan.status === "DEFAULTED" ? "DEFAULT" : `${loan.daysLate}D LATE`}
                      </span>
                    </div>
                    <div className="font-medium text-slate-200 mt-1">
                      {loan.client.firstName} {loan.client.lastName}
                    </div>
                    <div className="text-xs text-slate-500">{loan.client.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">{formatKwacha(loan.outstandingBalance)}</div>
                    <div className="text-xs text-slate-500">Outstanding</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Collateral:</span>
                  <span className="text-slate-400">{loan.collateral?.brand} {loan.collateral?.model}</span>
                  <span className="ml-auto text-slate-500">{loan.collateral?.vaultId}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedLoan(loan); setLogType("CALL"); }}
                  >
                    <Phone size={11} /> Call
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedLoan(loan); setLogType("WHATSAPP"); }}
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedLoan(loan); setLogType("EMAIL"); }}
                  >
                    <Mail size={11} /> Email
                  </button>
                </div>
              </div>
            ))}
            {overdueLoans.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle size={32} className="mx-auto mb-3 text-emerald-500 opacity-50" />
                <p>No overdue loans — great job!</p>
              </div>
            )}
          </div>
        </div>

        {/* Collection Log Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedLoan ? (
            <>
              <div className="philix-card p-4">
                <h3 className="section-title mb-3">Log Contact</h3>
                <div className="font-medium text-slate-200 mb-1">{selectedLoan.client.firstName} {selectedLoan.client.lastName}</div>
                <div className="text-xs text-slate-500 mb-4">{selectedLoan.loanNumber} · {formatKwacha(selectedLoan.outstandingBalance)} outstanding</div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Contact Type</label>
                    <select className="input-base text-sm" value={logType} onChange={(e) => setLogType(e.target.value)}>
                      {["CALL", "SMS", "EMAIL", "WHATSAPP", "VISIT", "PROMISE"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {logType === "PROMISE" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Promise Amount (K)</label>
                        <input className="input-base text-sm" type="number" value={promiseAmount}
                          onChange={(e) => setPromiseAmount(e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Promise Date</label>
                        <input className="input-base text-sm" type="date" value={promiseDate}
                          onChange={(e) => setPromiseDate(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Notes *</label>
                    <textarea
                      className="input-base text-sm resize-none"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What was discussed? What was the client's response?"
                    />
                  </div>

                  <button onClick={handleLog} className="btn-primary w-full" disabled={!notes}>
                    <FileText size={14} />
                    Log Contact
                  </button>
                </div>
              </div>

              {/* Existing logs */}
              {(logs[selectedLoan.id] || []).length > 0 && (
                <div className="philix-card p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Contact History</h4>
                  <div className="space-y-3">
                    {(logs[selectedLoan.id] || []).map((log, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="badge-blue text-[10px]">{log.type}</span>
                          <span className="text-xs text-slate-600">Just now</span>
                        </div>
                        <p className="text-xs text-slate-300">{log.notes}</p>
                        {log.promiseAmount && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Promise: {formatKwacha(log.promiseAmount)} by {log.promiseDate || "TBD"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="philix-card p-8 text-center text-slate-500">
              <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a loan to log contact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
