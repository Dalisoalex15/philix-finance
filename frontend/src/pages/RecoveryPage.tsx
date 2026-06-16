import { Wrench, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import { mockLoans, formatKwacha, formatDate } from "../lib/mock-data";

const defaultedLoans = mockLoans.filter(l => l.status === "DEFAULTED");

export default function RecoveryPage() {
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
          { label: "Default Cases", value: defaultedLoans.length, icon: AlertTriangle, color: "red" },
          { label: "Under Recovery", value: 1, icon: Wrench, color: "amber" },
          { label: "Auctioned Items", value: 1, icon: DollarSign, color: "blue" },
          { label: "Recovered Amount", value: formatKwacha(3200), icon: CheckCircle, color: "emerald" },
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
          <h3 className="section-title">Defaulted Loans — Recovery Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Loan #</th><th>Client</th><th>Principal</th><th>Outstanding</th><th>Days Late</th><th>Collateral</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {defaultedLoans.map((loan) => (
                <tr key={loan.id} className="table-row-hover">
                  <td className="font-mono text-xs text-red-400">{loan.loanNumber}</td>
                  <td>
                    <div className="font-medium text-slate-200">{loan.client.firstName} {loan.client.lastName}</div>
                    <div className="text-xs text-slate-500">{loan.client.phone}</div>
                  </td>
                  <td>{formatKwacha(loan.principal)}</td>
                  <td className="text-red-400 font-semibold">{formatKwacha(loan.outstandingBalance)}</td>
                  <td className="text-red-400 font-medium">{loan.daysLate}d</td>
                  <td>
                    {loan.collateral && (
                      <div>
                        <div className="text-xs text-slate-300">{loan.collateral.brand} {loan.collateral.model}</div>
                        <div className="text-xs text-slate-500">{loan.collateral.vaultId}</div>
                      </div>
                    )}
                  </td>
                  <td><span className="badge-red">DEFAULTED</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600/40">Repossess</button>
                      <button className="px-2 py-1 text-xs rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40">Auction</button>
                    </div>
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
