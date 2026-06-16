import { useState } from "react";
import { ShoppingBag, CheckCircle, XCircle, Clock, Plus, AlertCircle } from "lucide-react";
import { mockProcurement, formatKwacha, formatDate } from "../lib/mock-data";

const statusColors: Record<string, string> = {
  DRAFT: "badge-gray",
  PENDING_APPROVAL: "badge-yellow",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
  ORDERED: "badge-blue",
  RECEIVED: "badge-green",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-blue-400",
  HIGH: "text-amber-400",
  URGENT: "text-red-400",
};

export default function ProcurementPage() {
  const [requests, setRequests] = useState(mockProcurement);
  const [showForm, setShowForm] = useState(false);

  const totalValue = requests.filter(r => r.status !== "REJECTED").reduce((s, r) => s + r.estimatedCost, 0);
  const pending = requests.filter(r => r.status === "PENDING_APPROVAL").length;
  const approved = requests.filter(r => r.status === "APPROVED" || r.status === "ORDERED" || r.status === "RECEIVED").length;

  const approve = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
  const reject = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Procurement</h1>
          <p className="page-subtitle">Purchase requests, vendor approvals, and spending controls</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1.5">
          <Plus size={12} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Approval", value: pending, color: "text-amber-400", icon: Clock },
          { label: "Approved / In Progress", value: approved, color: "text-emerald-400", icon: CheckCircle },
          { label: "Total Committed Value", value: formatKwacha(totalValue), color: "text-blue-400", icon: ShoppingBag },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="philix-card p-5 animate-fade-in">
          <h3 className="section-title mb-4">New Purchase Request</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Item / Service *</label>
              <input className="input-base" placeholder="What needs to be purchased?" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Vendor / Supplier</label>
              <input className="input-base" placeholder="Supplier name" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Estimated Cost (K)</label>
              <input type="number" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Priority</label>
              <select className="input-base">
                {["LOW","MEDIUM","HIGH","URGENT"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select className="input-base">
                {["OFFICE_SUPPLIES","IT_EQUIPMENT","FURNITURE","SERVICES","MARKETING","OTHER"].map(c => (
                  <option key={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Needed By</label>
              <input type="date" className="input-base" />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Justification *</label>
              <textarea className="input-base" rows={2} placeholder="Why is this purchase needed?" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-primary">Submit for Approval</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="philix-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200">{req.itemName}</span>
                  <span className={statusColors[req.status] || "badge-gray"}>{req.status.replace("_", " ")}</span>
                  <span className={`text-xs font-semibold ${priorityColors[req.priority] || "text-slate-400"}`}>{req.priority}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{req.category?.replace("_"," ")} · Vendor: {req.vendorName || "TBD"}</div>
                {req.justification && <div className="text-xs text-slate-500 mt-1 italic">"{req.justification}"</div>}
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Requested by: <span className="text-slate-300">{req.requestedBy.firstName} {req.requestedBy.lastName}</span></span>
                  <span>Date: <span className="text-slate-300">{formatDate(req.requestedAt)}</span></span>
                  {req.neededBy && <span>Needed by: <span className="text-amber-400">{formatDate(req.neededBy)}</span></span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-slate-100">{formatKwacha(req.estimatedCost)}</div>
                {req.status === "PENDING_APPROVAL" && (
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => approve(req.id)} className="p-1 text-emerald-400 hover:text-emerald-300" title="Approve">
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => reject(req.id)} className="p-1 text-red-400 hover:text-red-300" title="Reject">
                      <XCircle size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
