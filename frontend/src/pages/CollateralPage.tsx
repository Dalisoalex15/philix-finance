import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Package, Lock, Unlock, Gavel } from "lucide-react";
import { mockCollateral, formatKwacha, formatDate, getStatusColor } from "../lib/mock-data";

const STATUSES = ["ALL", "HELD", "RELEASED", "AUCTIONED"];
const TYPES = ["ALL", "LAPTOP", "SMARTPHONE", "TABLET", "GAMING_CONSOLE", "TELEVISION", "OTHER_ELECTRONICS"];

export default function CollateralPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = mockCollateral.filter((c) => {
    const matchSearch = search === "" ||
      c.vaultId.toLowerCase().includes(search.toLowerCase()) ||
      `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.serialNumber?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchType = typeFilter === "ALL" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    held: mockCollateral.filter(c => c.status === "HELD").length,
    released: mockCollateral.filter(c => c.status === "RELEASED").length,
    auctioned: mockCollateral.filter(c => c.status === "AUCTIONED").length,
    totalValue: mockCollateral.filter(c => c.status === "HELD").reduce((s, c) => s + c.marketValue, 0),
  };

  const conditionColors: Record<string, string> = {
    EXCELLENT: "text-emerald-400", GOOD: "text-blue-400",
    FAIR: "text-amber-400", POOR: "text-red-400", DAMAGED: "text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collateral Vault</h1>
          <p className="page-subtitle">Secure asset tracking, assessment, and chain of custody</p>
        </div>
        <button onClick={() => navigate("/collateral/new")} className="btn-primary">
          <Plus size={16} />
          Add Collateral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Items Held", value: stats.held, icon: Lock, color: "indigo" },
          { label: "Released", value: stats.released, icon: Unlock, color: "emerald" },
          { label: "Auctioned", value: stats.auctioned, icon: Gavel, color: "red" },
          { label: "Total Market Value", value: formatKwacha(stats.totalValue), icon: Package, color: "blue" },
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
              placeholder="Search by vault ID, brand, model, serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-base w-auto text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
          </select>
          <select className="input-base w-auto text-xs" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t === "ALL" ? "All Types" : t.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vault ID</th>
                <th>Asset</th>
                <th>Owner</th>
                <th>Condition</th>
                <th>Market Value</th>
                <th>Forced Sale</th>
                <th>Max Loan</th>
                <th>Location</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="table-row-hover cursor-pointer"
                  onClick={() => navigate(`/collateral/${item.id}`)}
                >
                  <td className="font-mono text-xs text-indigo-400">{item.vaultId}</td>
                  <td>
                    <div className="font-medium text-slate-200">{item.brand} {item.model}</div>
                    <div className="text-xs text-slate-500">{item.type.replace("_", " ")} · {item.color}</div>
                  </td>
                  <td>
                    <div className="text-sm text-slate-300">{item.client.firstName} {item.client.lastName}</div>
                    <div className="text-xs text-slate-500">{item.client.clientNumber}</div>
                  </td>
                  <td>
                    <span className={`text-xs font-medium ${conditionColors[item.condition] || "text-slate-400"}`}>
                      {item.condition}
                    </span>
                    {item.batteryHealth && (
                      <div className="text-xs text-slate-500">Battery: {item.batteryHealth}%</div>
                    )}
                  </td>
                  <td className="font-medium text-slate-200">{formatKwacha(item.marketValue)}</td>
                  <td className="text-amber-400">{formatKwacha(item.forcedSaleValue)}</td>
                  <td className="text-emerald-400">{formatKwacha(item.maxLoanAmount)}</td>
                  <td>
                    <div className="text-xs text-slate-400">{item.vaultPosition || "—"}</div>
                    <div className="text-xs text-slate-600">{item.shelfNumber || ""}</div>
                  </td>
                  <td>
                    <span className={getStatusColor(item.status)}>{item.status}</span>
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(item.receivedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          Showing {filtered.length} of {mockCollateral.length} items
        </div>
      </div>
    </div>
  );
}
