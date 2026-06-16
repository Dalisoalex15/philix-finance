import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertCircle, Clock, Eye, Upload } from "lucide-react";
import { mockKYCRecords, formatDate, getStatusColor } from "../lib/mock-data";

const statusIcons: Record<string, React.ElementType> = {
  PENDING: Clock,
  IN_REVIEW: Eye,
  VERIFIED: CheckCircle,
  REJECTED: XCircle,
  EXPIRED: AlertCircle,
};

const checks = [
  { key: "nrcVerified", label: "NRC / National ID" },
  { key: "phoneVerified", label: "Phone Number" },
  { key: "addressVerified", label: "Physical Address" },
  { key: "employmentVerified", label: "Employment / Income" },
  { key: "photoIdVerified", label: "Photo ID Match" },
];

export default function KYCPage() {
  const [records, setRecords] = useState(mockKYCRecords);
  const [selected, setSelected] = useState<typeof mockKYCRecords[0] | null>(null);

  const counts: Record<string, number> = {};
  records.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const approve = (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRecords((prev: any[]) => prev.map(r => r.id === id ? { ...r, status: "VERIFIED", verifiedAt: new Date().toISOString() } : r));
    if (selected?.id === id) setSelected((s: any) => s ? { ...s, status: "VERIFIED" } : null);
  };
  const reject = (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRecords((prev: any[]) => prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r));
    if (selected?.id === id) setSelected((s: any) => s ? { ...s, status: "REJECTED" } : null);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">KYC Verification Center</h1>
          <p className="page-subtitle">Know Your Customer — identity verification and compliance checks</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs py-1.5"><Upload size={12} /> Bulk Upload</button>
        </div>
      </div>

      {/* Status Tiles */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusIcons).map(([status, Icon]) => (
          <div key={status} className="philix-card p-3 text-center">
            <Icon size={16} className={`mx-auto mb-1 ${status === "VERIFIED" ? "text-emerald-400" : status === "REJECTED" ? "text-red-400" : status === "IN_REVIEW" ? "text-blue-400" : status === "EXPIRED" ? "text-orange-400" : "text-slate-400"}`} />
            <div className="text-lg font-bold text-slate-200">{counts[status] || 0}</div>
            <div className="text-xs text-slate-500">{status.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records List */}
        <div className="space-y-2">
          {records.map(r => {
            const Icon = statusIcons[r.status];
            const colored = r.status === "VERIFIED" ? "text-emerald-400" : r.status === "REJECTED" ? "text-red-400" : r.status === "IN_REVIEW" ? "text-blue-400" : r.status === "EXPIRED" ? "text-orange-400" : "text-slate-400";
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className={`w-full text-left philix-card p-4 transition-all hover:border-indigo-700 ${selected?.id === r.id ? "border-indigo-600 border" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className={colored} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-200 text-sm">{r.client.firstName} {r.client.lastName}</div>
                    <div className="text-xs text-slate-500">NRC: {r.client.nrcNumber}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getStatusColor(r.status)}`}>{r.status}</span>
                    {r.riskScore && <div className={`text-xs mt-0.5 font-bold ${r.riskScore < 30 ? "text-emerald-400" : r.riskScore < 60 ? "text-amber-400" : "text-red-400"}`}>Risk: {r.riskScore}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="philix-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100 text-lg">{selected.client.firstName} {selected.client.lastName}</div>
                <div className="text-xs text-slate-500">NRC: {selected.client.nrcNumber}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(selected.status)}`}>{selected.status}</span>
            </div>

            {selected.riskScore !== undefined && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Risk Score</span>
                  <span className={`text-lg font-bold ${selected.riskScore < 30 ? "text-emerald-400" : selected.riskScore < 60 ? "text-amber-400" : "text-red-400"}`}>{selected.riskScore}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${selected.riskScore < 30 ? "bg-emerald-500" : selected.riskScore < 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${selected.riskScore}%` }} />
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Verification Checks</div>
              <div className="space-y-2">
                {checks.map(chk => {
                  const passed = (selected as Record<string, unknown>)[chk.key] === true;
                  return (
                    <div key={chk.key} className="flex items-center gap-3">
                      {passed
                        ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                        : <XCircle size={14} className="text-slate-600 flex-shrink-0" />}
                      <span className={`text-sm ${passed ? "text-slate-200" : "text-slate-500"}`}>{chk.label}</span>
                      {!passed && <button className="ml-auto text-xs text-indigo-400 hover:underline">Verify</button>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {selected.submittedAt && (
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500">Submitted</div>
                  <div className="text-slate-300">{formatDate(selected.submittedAt)}</div>
                </div>
              )}
              {selected.verifiedAt && (
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500">Verified</div>
                  <div className="text-emerald-400">{formatDate(selected.verifiedAt)}</div>
                </div>
              )}
              {selected.expiresAt && (
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500">Expires</div>
                  <div className="text-amber-400">{formatDate(selected.expiresAt)}</div>
                </div>
              )}
              {selected.reviewedBy && (
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-slate-500">Reviewed By</div>
                  <div className="text-slate-300">{selected.reviewedBy.firstName} {selected.reviewedBy.lastName}</div>
                </div>
              )}
            </div>

            {selected.notes && (
              <div className="bg-amber-900/20 border border-amber-800/40 rounded p-3 text-xs text-amber-300">{selected.notes}</div>
            )}

            {(selected.status === "PENDING" || selected.status === "IN_REVIEW") && (
              <div className="flex gap-2">
                <button onClick={() => approve(selected.id)} className="btn-success flex-1"><CheckCircle size={13} /> Verify</button>
                <button onClick={() => reject(selected.id)} className="btn-danger flex-1"><XCircle size={13} /> Reject</button>
              </div>
            )}
          </div>
        ) : (
          <div className="philix-card flex items-center justify-center text-slate-500 text-sm" style={{ minHeight: 300 }}>
            Select a KYC record to review
          </div>
        )}
      </div>
    </div>
  );
}
