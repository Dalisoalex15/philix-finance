import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Building2, BookOpen, CreditCard } from "lucide-react";
import { mockClients, mockLoans, formatKwacha, formatDate, getStatusColor } from "../lib/mock-data";

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = mockClients.find((c) => c.id === id);
  const clientLoans = mockLoans.filter((l) => l.clientId === id);

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Client not found</p>
        <button onClick={() => navigate("/clients")} className="btn-secondary mt-4">Back to Clients</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/clients")} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title">{client.firstName} {client.lastName}</h1>
          <p className="page-subtitle">{client.clientNumber} · {client.type.replace("_", " ")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="philix-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600/30 flex items-center justify-center text-2xl font-bold text-indigo-400">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <div className="font-semibold text-slate-100 text-lg">{client.firstName} {client.lastName}</div>
              <div className="text-sm text-slate-400">{client.clientNumber}</div>
              <div className="flex gap-2 mt-1">
                <span className={getStatusColor(client.status)}>{client.status}</span>
                <span className={getStatusColor(client.riskRating)}>{client.riskRating} RISK</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Phone size={13} className="text-slate-600 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={13} className="text-slate-600 flex-shrink-0" />
                <span>{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={13} className="text-slate-600 flex-shrink-0" />
              <span>{client.city}</span>
            </div>
            {client.university && (
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen size={13} className="text-slate-600 flex-shrink-0" />
                <span>{client.university}</span>
              </div>
            )}
            {(client as any).businessName && (
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 size={13} className="text-slate-600 flex-shrink-0" />
                <span>{(client as any).businessName}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2">Risk Score</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-800 rounded-full">
                <div
                  className={`h-full rounded-full ${client.internalScore >= 70 ? "bg-emerald-500" : client.internalScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${client.internalScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-200">{client.internalScore}/100</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Registered: {formatDate(client.createdAt)}
          </div>
        </div>

        {/* Loans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="philix-card overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="section-title">Loan History</h3>
              <button onClick={() => navigate("/loans/new")} className="btn-primary text-xs py-1.5">
                <CreditCard size={12} /> New Loan
              </button>
            </div>
            {clientLoans.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Loan #</th><th>Principal</th><th>Outstanding</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {clientLoans.map((loan) => (
                    <tr key={loan.id} className="table-row-hover cursor-pointer" onClick={() => navigate(`/loans/${loan.id}`)}>
                      <td className="font-mono text-xs text-indigo-400">{loan.loanNumber}</td>
                      <td>{formatKwacha(loan.principal)}</td>
                      <td className="text-amber-400">{formatKwacha(loan.outstandingBalance)}</td>
                      <td><span className={getStatusColor(loan.status)}>{loan.status}</span></td>
                      <td className="text-xs text-slate-500">{loan.disbursementDate ? formatDate(loan.disbursementDate) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">No loans yet</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Loans", value: client._count.loans },
              { label: "Defaults", value: (client as any).defaultCount || 0 },
              { label: "Reliability", value: `${(client as any).reliabilityScore || 50}%` },
            ].map((s) => (
              <div key={s.label} className="philix-card p-4 text-center">
                <div className="text-2xl font-bold text-slate-100">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
