import { useState } from "react";
import { FileText, AlertTriangle, Clock, CheckCircle, XCircle, Bell } from "lucide-react";
import { mockDocumentExpiry, formatDate } from "../lib/mock-data";

export default function DocumentExpiryPage() {
  const [filter, setFilter] = useState<"ALL" | "EXPIRED" | "EXPIRING_SOON" | "VALID">("ALL");

  const today = new Date();
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);
  const in7 = new Date(today); in7.setDate(today.getDate() + 7);

  const withStatus = mockDocumentExpiry.map(d => {
    const exp = new Date(d.expiresAt);
    const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    let status: "EXPIRED" | "CRITICAL" | "EXPIRING_SOON" | "VALID";
    if (daysLeft < 0) status = "EXPIRED";
    else if (daysLeft <= 7) status = "CRITICAL";
    else if (daysLeft <= 30) status = "EXPIRING_SOON";
    else status = "VALID";
    return { ...d, daysLeft, status };
  });

  const counts = {
    EXPIRED: withStatus.filter(d => d.status === "EXPIRED").length,
    CRITICAL: withStatus.filter(d => d.status === "CRITICAL").length,
    EXPIRING_SOON: withStatus.filter(d => d.status === "EXPIRING_SOON").length,
    VALID: withStatus.filter(d => d.status === "VALID").length,
  };

  const filtered = withStatus.filter(d =>
    filter === "ALL" ? true :
    filter === "EXPIRED" ? d.status === "EXPIRED" :
    filter === "EXPIRING_SOON" ? (d.status === "EXPIRING_SOON" || d.status === "CRITICAL") :
    d.status === "VALID"
  ).sort((a, b) => a.daysLeft - b.daysLeft);

  const statusBadge = (status: string, daysLeft: number) => {
    if (status === "EXPIRED") return <span className="badge-red text-xs">EXPIRED</span>;
    if (status === "CRITICAL") return <span className="badge-red text-xs">CRITICAL · {daysLeft}d</span>;
    if (status === "EXPIRING_SOON") return <span className="badge-yellow text-xs">EXPIRING · {daysLeft}d</span>;
    return <span className="badge-green text-xs">VALID · {daysLeft}d</span>;
  };

  const docIcon = (type: string) => {
    if (type.includes("NRC") || type.includes("ID")) return "🪪";
    if (type.includes("Insurance")) return "🛡️";
    if (type.includes("License")) return "📋";
    if (type.includes("Business")) return "🏢";
    return "📄";
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Expiry Tracker</h1>
          <p className="page-subtitle">Monitor client and collateral documents — NRC, insurance, licenses, business permits</p>
        </div>
        <button className="btn-secondary text-xs py-1.5"><Bell size={12} /> Send Reminders</button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Expired", count: counts.EXPIRED, color: "text-red-400", icon: XCircle, bg: "bg-red-900/20" },
          { label: "Critical (≤7d)", count: counts.CRITICAL, color: "text-red-400", icon: AlertTriangle, bg: "bg-red-900/10" },
          { label: "Expiring Soon (≤30d)", count: counts.EXPIRING_SOON, color: "text-amber-400", icon: Clock, bg: "bg-amber-900/20" },
          { label: "Valid", count: counts.VALID, color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-900/10" },
        ].map(s => (
          <div key={s.label} className={`philix-card p-4 ${s.count > 0 && s.label !== "Valid" ? s.bg : ""}`}>
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {(counts.EXPIRED > 0 || counts.CRITICAL > 0) && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-red-300">Immediate Action Required</div>
            <div className="text-xs text-red-400 mt-0.5">
              {counts.EXPIRED} document(s) expired · {counts.CRITICAL} document(s) expiring within 7 days.
              Loans with expired documents may need to be flagged for review.
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["ALL", "EXPIRED", "EXPIRING_SOON", "VALID"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {f.replace("_", " ")} {f !== "ALL" ? `(${f === "EXPIRING_SOON" ? counts.EXPIRING_SOON + counts.CRITICAL : counts[f]})` : ""}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="philix-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Client</th>
              <th>Linked Loan</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => (
              <tr key={doc.id} className={`table-row-hover ${doc.status === "EXPIRED" ? "bg-red-950/20" : doc.status === "CRITICAL" ? "bg-red-950/10" : ""}`}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{docIcon(doc.documentType)}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{doc.documentType}</div>
                      {doc.documentNumber && <div className="text-xs text-slate-500">{doc.documentNumber}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-medium text-slate-200 text-sm">{doc.client.firstName} {doc.client.lastName}</div>
                  <div className="text-xs text-slate-500">{doc.client.clientRef}</div>
                </td>
                <td className="font-mono text-xs text-indigo-400">{doc.loan?.loanNumber || "—"}</td>
                <td className="text-xs text-slate-400">{doc.issuedAt ? formatDate(doc.issuedAt) : "—"}</td>
                <td className={`text-sm font-semibold ${doc.daysLeft < 0 ? "text-red-400" : doc.daysLeft <= 7 ? "text-red-400" : doc.daysLeft <= 30 ? "text-amber-400" : "text-slate-300"}`}>
                  {formatDate(doc.expiresAt)}
                </td>
                <td>{statusBadge(doc.status, doc.daysLeft)}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="text-xs text-indigo-400 hover:underline">Update</button>
                    <span className="text-slate-700">·</span>
                    <button className="text-xs text-slate-500 hover:text-slate-300">Remind</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">No documents matching filter</div>
        )}
      </div>
    </div>
  );
}
