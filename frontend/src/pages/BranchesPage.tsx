import { Building2, Plus } from "lucide-react";

const branches = [
  { id: "br-001", name: "Lusaka Main", code: "LUS-MAIN", city: "Lusaka", address: "Plot 1234, Cairo Road, Lusaka", phone: "+260 211 234567", isActive: true, users: 7, clients: 312, loans: 287 },
];

export default function BranchesPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Network</h1>
          <p className="page-subtitle">Manage office locations and branch operations</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> Add Branch</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div key={b.id} className="philix-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{b.name}</div>
                  <div className="text-xs text-slate-500">{b.code}</div>
                </div>
              </div>
              <span className={b.isActive ? "badge-green" : "badge-red"}>{b.isActive ? "ACTIVE" : "INACTIVE"}</span>
            </div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex gap-2"><span className="text-slate-500 w-20">Address:</span><span className="text-slate-300">{b.address}</span></div>
              <div className="flex gap-2"><span className="text-slate-500 w-20">Phone:</span><span className="text-slate-300">{b.phone}</span></div>
              <div className="flex gap-2"><span className="text-slate-500 w-20">City:</span><span className="text-slate-300">{b.city}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
              {[{ label: "Staff", value: b.users }, { label: "Clients", value: b.clients }, { label: "Active Loans", value: b.loans }].map((s) => (
                <div key={s.label} className="text-center bg-slate-800/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-slate-100">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-amber-400 bg-amber-900/20 px-3 py-1.5 rounded-md inline-block">
                Future-ready: Additional branches can be added as Philix Finance expands
              </div>
            </div>
          </div>
        ))}

        <div className="philix-card p-5 border-dashed border-slate-700 flex flex-col items-center justify-center gap-3 min-h-48 cursor-pointer hover:border-indigo-600 hover:bg-indigo-900/10 transition-colors">
          <div className="p-3 rounded-full bg-slate-800">
            <Plus size={24} className="text-slate-500" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-400">Add New Branch</div>
            <div className="text-xs text-slate-600 mt-1">Expand Philix Finance to new locations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
