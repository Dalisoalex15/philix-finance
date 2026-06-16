import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Users, UserCheck, AlertTriangle, XCircle } from "lucide-react";
import { mockClients, formatDate, getStatusColor } from "../lib/mock-data";

const CLIENT_TYPES = ["ALL", "STUDENT", "CIVIL_SERVANT", "BUSINESS_OWNER", "MARKET_TRADER", "ENTREPRENEUR"];
const RISK_FILTERS = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ClientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const filtered = mockClients.filter((c) => {
    const matchSearch = search === "" ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.clientNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchType = typeFilter === "ALL" || c.type === typeFilter;
    const matchRisk = riskFilter === "ALL" || c.riskRating === riskFilter;
    return matchSearch && matchType && matchRisk;
  });

  const stats = {
    total: mockClients.length,
    active: mockClients.filter(c => c.status === "ACTIVE").length,
    highRisk: mockClients.filter(c => c.riskRating === "HIGH" || c.riskRating === "CRITICAL").length,
    blacklisted: mockClients.filter(c => c.status === "BLACKLISTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Client CRM</h1>
          <p className="page-subtitle">Manage borrower profiles, documents, and risk assessments</p>
        </div>
        <button onClick={() => navigate("/clients/new")} className="btn-primary">
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: stats.total, icon: Users, color: "indigo" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "emerald" },
          { label: "High Risk", value: stats.highRisk, icon: AlertTriangle, color: "amber" },
          { label: "Blacklisted", value: stats.blacklisted, icon: XCircle, color: "red" },
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
              placeholder="Search by name, client number, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="input-base w-auto text-xs"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {CLIENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === "ALL" ? "All Types" : t.replace("_", " ")}</option>
              ))}
            </select>
            <select
              className="input-base w-auto text-xs"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              {RISK_FILTERS.map((r) => (
                <option key={r} value={r}>{r === "ALL" ? "All Risk" : r + " Risk"}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>ID / NRC</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Risk</th>
                <th>Score</th>
                <th>Loans</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="table-row-hover cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                        {client.firstName[0]}{client.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{client.firstName} {client.lastName}</div>
                        <div className="text-xs text-slate-500">{client.clientNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{client.clientNumber}</td>
                  <td>
                    <span className="badge-blue text-[10px]">{client.type.replace("_", " ")}</span>
                  </td>
                  <td>
                    <div className="text-xs text-slate-300">{client.phone}</div>
                    {client.email && <div className="text-xs text-slate-500 truncate max-w-32">{client.email}</div>}
                  </td>
                  <td>
                    <span className={getStatusColor(client.riskRating)}>
                      {client.riskRating}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full w-16">
                        <div
                          className={`h-full rounded-full ${
                            client.internalScore >= 70 ? "bg-emerald-500" :
                            client.internalScore >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${client.internalScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{client.internalScore}</span>
                    </div>
                  </td>
                  <td className="text-slate-300">{client._count.loans}</td>
                  <td>
                    <span className={getStatusColor(client.status)}>{client.status}</span>
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(client.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p>No clients match your search</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          Showing {filtered.length} of {mockClients.length} clients
        </div>
      </div>
    </div>
  );
}
