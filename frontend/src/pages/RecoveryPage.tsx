import { Wrench, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import { useLoanApplicationStore } from "../store/loanApplicationStore";
import { formatKwacha } from "../lib/mock-data";
import { useEffect } from "react";

export default function RecoveryPage() {
  const { applications, syncFromApi } = useLoanApplicationStore();

  useEffect(() => { syncFromApi(); }, []);

  // REJECTED loans are the closest to "defaulted" in the portal system
  const rejectedLoans = applications.filter(a => a.status === "REJECTED");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recovery & Repossession</h1>
          <p className="page-subtitle">Manage defaulted loan recovery, repossessions, and auction tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Rejected Cases",   value: rejectedLoans.length, icon: AlertTriangle, color: "red" },
          { label: "Under Recovery",   value: 0,                    icon: Wrench,        color: "amber" },
          { label: "Auctioned Items",  value: 0,                    icon: DollarSign,    color: "blue" },
          { label: "Recovered Amount", value: formatKwacha(0),      icon: CheckCircle,   color: "emerald" },
        ].map((s) => (
          <div key={s.label} className="philix-card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${s.color}-600/20 text-${s.color}-400`}><s.icon size={18} /></div>
            <div>
              <div className="text-xl font-bold text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="philix-card overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="section-title">Rejected Applications — Recovery Cases</h3>
        </div>
        {rejectedLoans.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-sm">No recovery cases at this time</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Reference</th><th>Client</th><th>Principal</th><th>Product</th><th>Submitted</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rejectedLoans.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td className="font-mono text-xs text-red-400">{a.ref}</td>
                    <td>
                      <div className="font-medium text-slate-200">{a.clientName}</div>
                      <div className="text-xs text-slate-500">{a.clientEmail}</div>
                    </td>
                    <td>{formatKwacha(a.amount)}</td>
                    <td className="text-xs text-slate-400">{a.productName}</td>
                    <td className="text-xs text-slate-500">{a.submittedAt.slice(0, 10)}</td>
                    <td><span className="badge-red">REJECTED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
