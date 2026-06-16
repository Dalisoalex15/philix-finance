import { useState } from "react";
import { Mail, CheckCircle, XCircle, Clock, RefreshCw, Send } from "lucide-react";
import { mockEmailLogs, formatDate } from "../lib/mock-data";

const statusIcons: Record<string, React.ElementType> = {
  SENT: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
  QUEUED: Clock,
};

const statusColors: Record<string, string> = {
  SENT: "text-emerald-400",
  FAILED: "text-red-400",
  PENDING: "text-amber-400",
  QUEUED: "text-blue-400",
};

const triggerColors: Record<string, string> = {
  PAYMENT_REMINDER: "badge-yellow",
  PAYMENT_OVERDUE: "badge-red",
  LOAN_APPROVED: "badge-green",
  LOAN_DISBURSED: "badge-green",
  LOAN_REJECTED: "badge-red",
  KYC_REQUEST: "badge-blue",
  DOCUMENT_EXPIRY: "badge-yellow",
  WELCOME: "badge-blue",
};

export default function EmailLogsPage() {
  const [logs] = useState(mockEmailLogs);
  const [filter, setFilter] = useState("ALL");

  const sent = logs.filter(l => l.status === "SENT").length;
  const failed = logs.filter(l => l.status === "FAILED").length;
  const deliveryRate = logs.length > 0 ? Math.round((sent / logs.length) * 100) : 0;

  const filtered = filter === "ALL" ? logs : logs.filter(l => l.status === filter || l.trigger === filter);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Automation Logs</h1>
          <p className="page-subtitle">SMTP-triggered email log — payment reminders, approvals, overdue alerts</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs py-1.5"><RefreshCw size={12} /> Retry Failed</button>
          <button className="btn-primary text-xs py-1.5"><Send size={12} /> Test Email</button>
        </div>
      </div>

      {/* SMTP Config Banner */}
      <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
        <Mail size={18} className="text-indigo-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-200">SMTP Configuration</div>
          <div className="text-xs text-slate-500">Gmail Workspace · noreply@philixfinance.com · TLS 587</div>
        </div>
        <span className="badge-green text-xs">CONNECTED</span>
        <button className="btn-secondary text-xs py-1">Configure</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Emails Sent", value: sent, color: "text-emerald-400", icon: CheckCircle },
          { label: "Failed", value: failed, color: "text-red-400", icon: XCircle },
          { label: "Total Logged", value: logs.length, color: "text-blue-400", icon: Mail },
          { label: "Delivery Rate", value: `${deliveryRate}%`, color: deliveryRate >= 95 ? "text-emerald-400" : "text-amber-400", icon: Send },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "SENT", "FAILED", "PENDING", "PAYMENT_REMINDER", "LOAN_APPROVED", "PAYMENT_OVERDUE"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="philix-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr><th>Trigger</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Sent At</th><th>Error</th></tr>
          </thead>
          <tbody>
            {filtered.map(log => {
              const Icon = statusIcons[log.status] || Clock;
              return (
                <tr key={log.id} className="table-row-hover">
                  <td><span className={triggerColors[log.trigger] || "badge-gray"}>{log.trigger.replace(/_/g," ")}</span></td>
                  <td>
                    <div className="text-sm text-slate-200">{log.recipientName}</div>
                    <div className="text-xs text-slate-500">{log.recipientEmail}</div>
                  </td>
                  <td className="text-xs text-slate-300 max-w-xs truncate">{log.subject}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Icon size={12} className={statusColors[log.status]} />
                      <span className={`text-xs font-semibold ${statusColors[log.status]}`}>{log.status}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">{log.sentAt ? formatDate(log.sentAt) : "—"}</td>
                  <td className="text-xs text-red-400 max-w-xs truncate">{log.errorMessage || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-sm">No email logs match filter</div>
        )}
      </div>
    </div>
  );
}
