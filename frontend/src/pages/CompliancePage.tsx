import { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, XCircle, Clock, Plus } from "lucide-react";
import { mockCompliance, formatDate } from "../lib/mock-data";

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  COMPLIANT: { color: "text-emerald-400", icon: CheckCircle },
  NON_COMPLIANT: { color: "text-red-400", icon: XCircle },
  UNDER_REVIEW: { color: "text-amber-400", icon: AlertTriangle },
  PENDING: { color: "text-slate-400", icon: Clock },
};

const categoryColors: Record<string, string> = {
  REGULATORY: "badge-red",
  INTERNAL_POLICY: "badge-blue",
  AML: "badge-purple",
  CREDIT_RISK: "badge-yellow",
  DATA_PROTECTION: "badge-gray",
  LICENSING: "badge-green",
};

export default function CompliancePage() {
  const [records] = useState(mockCompliance);
  const [showForm, setShowForm] = useState(false);

  const compliant = records.filter(r => r.status === "COMPLIANT").length;
  const nonCompliant = records.filter(r => r.status === "NON_COMPLIANT").length;
  const underReview = records.filter(r => r.status === "UNDER_REVIEW").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Center</h1>
          <p className="page-subtitle">Regulatory compliance, internal policies, AML/KYC and licensing tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-1.5">
          <Plus size={12} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Compliant", value: compliant, color: "text-emerald-400", icon: CheckCircle },
          { label: "Non-Compliant", value: nonCompliant, color: "text-red-400", icon: XCircle },
          { label: "Under Review", value: underReview, color: "text-amber-400", icon: AlertTriangle },
          { label: "Compliance Rate", value: `${records.length > 0 ? Math.round((compliant / records.length) * 100) : 0}%`, color: compliant / records.length >= 0.9 ? "text-emerald-400" : "text-amber-400", icon: Shield },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {nonCompliant > 0 && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-red-300">Compliance Breaches Detected</div>
            <div className="text-xs text-red-400">{nonCompliant} item(s) marked non-compliant. Immediate remediation required.</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="philix-card p-5 animate-fade-in">
          <h3 className="section-title mb-4">Add Compliance Item</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Requirement Name *</label>
              <input className="input-base" placeholder="e.g. BoZ Prudential Returns Q2 2025" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select className="input-base">
                {Object.keys(categoryColors).map(c => <option key={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
              <input type="date" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Responsible Person</label>
              <select className="input-base">
                <option>Daliso Phiri</option>
                <option>Chileshe Mutale</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Notes</label>
              <textarea className="input-base" rows={2} placeholder="Details, regulatory reference, remediation plan..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-primary">Save Item</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {records.map(item => {
          const cfg = statusConfig[item.status] || statusConfig.PENDING;
          return (
            <div key={item.id} className={`philix-card p-4 border-l-4 ${item.status === "NON_COMPLIANT" ? "border-l-red-500" : item.status === "COMPLIANT" ? "border-l-emerald-500" : "border-l-amber-500"}`}>
              <div className="flex items-start gap-3">
                <cfg.icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{item.requirementName}</span>
                    <span className={categoryColors[item.category] || "badge-gray"}>{item.category.replace("_", " ")}</span>
                    <span className={`text-xs font-bold ${cfg.color}`}>{item.status.replace("_", " ")}</span>
                  </div>
                  {item.notes && <div className="text-xs text-slate-400 mt-1">{item.notes}</div>}
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    {item.dueDate && <span>Due: <span className="text-slate-300">{formatDate(item.dueDate)}</span></span>}
                    {item.reviewedAt && <span>Reviewed: <span className="text-slate-300">{formatDate(item.reviewedAt)}</span></span>}
                    {item.responsiblePerson && <span>Owner: <span className="text-slate-300">{item.responsiblePerson.firstName} {item.responsiblePerson.lastName}</span></span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button className="btn-secondary text-xs py-1">Update</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
