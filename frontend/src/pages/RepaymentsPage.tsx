import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, RefreshCw } from "lucide-react";
import { formatKwacha, formatDate } from "../lib/mock-data";

interface PaymentSubmission {
  id: string;
  applicationId: string;
  accountId: string;
  amount: number | null;
  paymentMethod: string | null;
  provider: string | null;
  reference: string | null;
  notes: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  application?: {
    reference: string;
    productType: string;
    amountRequested: number;
    account?: { firstName: string; lastName: string; clientNumber: string; email: string };
  };
}

export default function RepaymentsPage() {
  const [payments, setPayments]   = useState<PaymentSubmission[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [actionId, setActionId]   = useState<string | null>(null);
  const [toast, setToast]         = useState("");

  const token = localStorage.getItem("philix_staff_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/payment-submissions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      const r = await fetch(`/api/admin/payment-submissions/${id}`, {
        method: "PATCH", headers, body: JSON.stringify({ status: "APPROVED" }),
      });
      if (r.ok) { setToast("Payment approved successfully"); load(); }
    } catch { /* ignore */ } finally {
      setActionId(null);
      setTimeout(() => setToast(""), 4000);
    }
  };

  const reject = async (id: string) => {
    setActionId(id);
    try {
      const r = await fetch(`/api/admin/payment-submissions/${id}`, {
        method: "PATCH", headers, body: JSON.stringify({ status: "REJECTED" }),
      });
      if (r.ok) { setToast("Payment rejected"); load(); }
    } catch { /* ignore */ } finally {
      setActionId(null);
      setTimeout(() => setToast(""), 4000);
    }
  };

  const filtered = filter === "ALL" ? payments : payments.filter(p => p.status === filter);

  const totalApproved = payments.filter(p => p.status === "APPROVED").reduce((s, p) => s + (p.amount ?? 0), 0);
  const pending       = payments.filter(p => p.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repayments</h1>
          <p className="page-subtitle">Review and approve client payment submissions</p>
        </div>
        <button onClick={load} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg text-emerald-400">
          <CheckCircle size={16} />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400"><DollarSign size={18} /></div>
          <div>
            <div className="text-xl font-bold text-emerald-400">{formatKwacha(totalApproved)}</div>
            <div className="text-xs text-slate-400">Total Approved</div>
          </div>
        </div>
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400"><DollarSign size={18} /></div>
          <div>
            <div className="text-xl font-bold text-amber-400">{pending}</div>
            <div className="text-xs text-slate-400">Awaiting Review</div>
          </div>
        </div>
        <div className="philix-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400"><CheckCircle size={18} /></div>
          <div>
            <div className="text-xl font-bold text-slate-100">{payments.length}</div>
            <div className="text-xs text-slate-400">Total Submissions</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}>
            {f === "ALL" ? `All (${payments.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${payments.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="philix-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-600">
            <RefreshCw size={18} className="animate-spin mr-2" /> Loading payments…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-sm">
            {filter === "ALL" ? "No payment submissions yet" : `No ${filter.toLowerCase()} payments`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Loan Ref</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const clientName = p.application?.account
                    ? `${p.application.account.firstName} ${p.application.account.lastName}`
                    : "Unknown";
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="text-xs text-slate-400">{formatDate(p.createdAt.slice(0, 10))}</td>
                      <td className="font-mono text-xs text-indigo-400">{p.application?.reference ?? "—"}</td>
                      <td className="font-medium text-slate-200">{clientName}</td>
                      <td className="text-emerald-400 font-semibold">{p.amount != null ? formatKwacha(p.amount) : "—"}</td>
                      <td className="text-xs text-slate-400">{p.paymentMethod?.replace(/_/g, " ") ?? "—"}</td>
                      <td className="text-xs text-slate-500 font-mono">{p.reference || "—"}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          p.status === "APPROVED" ? "bg-emerald-900/40 text-emerald-300" :
                          p.status === "REJECTED" ? "bg-red-900/40 text-red-300" :
                          "bg-amber-900/40 text-amber-300"
                        }`}>{p.status}</span>
                      </td>
                      <td>
                        {p.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => approve(p.id)} disabled={actionId === p.id}
                              className="px-2 py-1 text-xs rounded bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 transition-colors disabled:opacity-50">
                              Approve
                            </button>
                            <button onClick={() => reject(p.id)} disabled={actionId === p.id}
                              className="px-2 py-1 text-xs rounded bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors disabled:opacity-50">
                              Reject
                            </button>
                          </div>
                        )}
                        {p.status !== "PENDING" && (
                          <span className="text-xs text-slate-600">{p.reviewedBy ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
