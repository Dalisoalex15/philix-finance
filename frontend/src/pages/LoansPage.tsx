import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { mockLoans, mockKPIs, formatKwacha, formatDate, getStatusColor } from "../lib/mock-data";

const STATUSES = ["ALL", "ACTIVE", "OVERDUE", "DEFAULTED", "PAID", "PENDING_APPROVAL"];

export default function LoansPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = mockLoans.filter((l) => {
    const matchSearch = search === "" ||
      l.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
      `${l.client.firstName} ${l.client.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loans</h1>
          <p className="page-subtitle">Loan origination, monitoring, and lifecycle management</p>
        </div>
        <button onClick={() => navigate("/loans/new")} className="btn-primary">
          <Plus size={16} />
          New Loan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Loans", value: mockKPIs.activeLoans, icon: CreditCard, color: "indigo" },
          { label: "Total Outstanding", value: formatKwacha(mockKPIs.totalOutstanding), icon: TrendingUp, color: "blue" },
          { label: "Overdue", value: mockKPIs.overdueLoans, icon: AlertTriangle, color: "amber" },
          { label: "Pending Approval", value: mockKPIs.pendingApprovals, icon: CheckCircle, color: "emerald" },
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

      {/* Filters */}
      <div className="philix-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-base pl-9"
              placeholder="Search by loan number or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {s === "ALL" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan #</th>
                <th>Client</th>
                <th>Collateral</th>
                <th>Principal</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Installment</th>
                <th>Days Late</th>
                <th>Status</th>
                <th>Disbursed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => (
                <tr
                  key={loan.id}
                  className="table-row-hover cursor-pointer"
                  onClick={() => navigate(`/loans/${loan.id}`)}
                >
                  <td className="font-mono text-xs text-indigo-400">{loan.loanNumber}</td>
                  <td>
                    <div className="font-medium text-slate-200">{loan.client.firstName} {loan.client.lastName}</div>
                    <div className="text-xs text-slate-500">{loan.client.phone}</div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-300">{loan.collateral?.brand} {loan.collateral?.model}</div>
                    <div className="text-xs text-slate-500">{loan.collateral?.vaultId}</div>
                  </td>
                  <td className="font-medium">{formatKwacha(loan.principal)}</td>
                  <td>{formatKwacha(loan.totalDue)}</td>
                  <td className="text-emerald-400">{formatKwacha(loan.totalPaid)}</td>
                  <td className="font-medium text-amber-400">{formatKwacha(loan.outstandingBalance)}</td>
                  <td>{formatKwacha(loan.installmentAmount)}</td>
                  <td>
                    {loan.daysLate > 0 ? (
                      <span className={`font-medium ${loan.daysLate > 30 ? "text-red-400" : "text-amber-400"}`}>
                        {loan.daysLate}d
                      </span>
                    ) : (
                      <span className="text-emerald-400">—</span>
                    )}
                  </td>
                  <td>
                    <span className={getStatusColor(loan.status)}>{loan.status.replace("_", " ")}</span>
                  </td>
                  <td className="text-slate-500 text-xs">
                    {loan.disbursementDate ? formatDate(loan.disbursementDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          Showing {filtered.length} of {mockLoans.length} loans
        </div>
      </div>
    </div>
  );
}
