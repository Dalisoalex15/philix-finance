import { useState } from "react";
import { Shield, Search } from "lucide-react";
import { mockAuditLogs, formatDate } from "../lib/mock-data";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "badge-green", UPDATE: "badge-blue", DELETE: "badge-red",
  LOGIN: "badge-gray", LOGOUT: "badge-gray", APPROVE: "badge-green",
  REJECT: "badge-red", DISBURSE: "badge-green", PAYMENT: "badge-green",
  RELEASE_COLLATERAL: "badge-blue", REPOSSESS: "badge-red",
  EXPORT: "badge-gray", VIEW_SENSITIVE: "badge-yellow",
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const actions = ["ALL", "CREATE", "UPDATE", "DELETE", "LOGIN", "APPROVE", "REJECT", "DISBURSE", "PAYMENT", "RELEASE_COLLATERAL"];

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch = search === "" ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "ALL" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete, tamper-proof record of every system action</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-800/50">
          <Shield size={12} />
          All actions are logged
        </div>
      </div>

      {/* Filters */}
      <div className="philix-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-base pl-9"
              placeholder="Search descriptions, users, entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {actions.map((a) => (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  actionFilter === a ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {a === "ALL" ? "All" : a.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="philix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="table-row-hover">
                  <td className="text-xs font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-ZM", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </td>
                  <td>
                    <div className="font-medium text-slate-200">{log.user?.firstName} {log.user?.lastName}</div>
                    <div className="text-xs text-slate-500">{log.user?.role?.replace("_", " ")}</div>
                  </td>
                  <td>
                    <span className={ACTION_COLORS[log.action] || "badge-gray"}>
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">{log.entity}</td>
                  <td className="max-w-xs">
                    <p className="text-sm text-slate-300 truncate">{log.description}</p>
                  </td>
                  <td className="font-mono text-xs text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
          <span>Showing {filtered.length} of {mockAuditLogs.length} log entries</span>
          <span className="text-slate-600">Logs are retained for 7 years</span>
        </div>
      </div>
    </div>
  );
}
