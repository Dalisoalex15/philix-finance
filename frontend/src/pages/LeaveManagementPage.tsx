import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { mockLeaveRequests, formatDate } from "../lib/mock-data";

const statusColors: Record<string, string> = {
  PENDING: "badge-yellow",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
  CANCELLED: "badge-gray",
};

const leaveTypeColors: Record<string, string> = {
  ANNUAL: "text-blue-400",
  SICK: "text-red-400",
  MATERNITY: "text-pink-400",
  PATERNITY: "text-indigo-400",
  UNPAID: "text-amber-400",
  STUDY: "text-purple-400",
  EMERGENCY: "text-orange-400",
};

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [showForm, setShowForm] = useState(false);

  const pending = requests.filter(r => r.status === "PENDING").length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const totalDays = requests.filter(r => r.status === "APPROVED").reduce((s, r) => s + r.daysRequested, 0);

  const approve = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
  const reject = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Leave Management</h1>
          <p className="page-subtitle">Leave requests, approvals, and staff availability tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1.5">
          <Plus size={12} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Approval", value: pending, color: "text-amber-400", icon: Clock },
          { label: "Approved This Month", value: approved, color: "text-emerald-400", icon: CheckCircle },
          { label: "Total Days Approved", value: totalDays, color: "text-blue-400", icon: Calendar },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="philix-card p-5 animate-fade-in">
          <h3 className="section-title mb-4">New Leave Request</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Staff Member</label>
              <select className="input-base">
                <option>Daliso Phiri (CEO)</option>
                <option>Chileshe Mutale (Manager)</option>
                <option>Patricia Mwanza (Loan Officer)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Leave Type</label>
              <select className="input-base">
                {["ANNUAL","SICK","MATERNITY","PATERNITY","STUDY","EMERGENCY","UNPAID"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Number of Days</label>
              <input type="number" className="input-base" defaultValue={5} min={1} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
              <input type="date" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Date</label>
              <input type="date" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reason</label>
              <input className="input-base" placeholder="Brief reason..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-primary">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="philix-card overflow-hidden">
        <div className="p-4 border-b border-slate-800"><h3 className="section-title">Leave Requests</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Staff Member</th><th>Type</th><th>Days</th><th>Start</th><th>End</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="table-row-hover">
                <td>
                  <div className="font-medium text-slate-200 text-sm">{req.staff.firstName} {req.staff.lastName}</div>
                  <div className="text-xs text-slate-500">{req.staff.role}</div>
                </td>
                <td><span className={`text-xs font-semibold ${leaveTypeColors[req.leaveType] || "text-slate-400"}`}>{req.leaveType}</span></td>
                <td className="font-bold text-slate-200">{req.daysRequested}</td>
                <td className="text-xs text-slate-400">{formatDate(req.startDate)}</td>
                <td className="text-xs text-slate-400">{formatDate(req.endDate)}</td>
                <td className="text-xs text-slate-400 max-w-xs truncate">{req.reason || "—"}</td>
                <td><span className={statusColors[req.status]}>{req.status}</span></td>
                <td>
                  {req.status === "PENDING" && (
                    <div className="flex gap-1">
                      <button onClick={() => approve(req.id)} className="text-emerald-400 hover:text-emerald-300" title="Approve">
                        <CheckCircle size={14} />
                      </button>
                      <button onClick={() => reject(req.id)} className="text-red-400 hover:text-red-300" title="Reject">
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
