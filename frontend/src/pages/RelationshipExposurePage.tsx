import { useState, useEffect, useCallback } from "react";
import { Network, Users, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Phone, Building2, MapPin, Shield } from "lucide-react";

const API = "/api";
const K = (n: number) => `K${(n ?? 0).toLocaleString("en-ZM", { maximumFractionDigits: 0 })}`;
const token = () => localStorage.getItem("philix_staff_token") ?? "";

interface ExposureGroup {
  type: "PHONE" | "GUARANTOR" | "EMPLOYER" | "ADDRESS";
  key: string;
  members: {
    accountId: string; clientNumber: string; name: string; phone: string;
    email: string; loanRef?: string; outstanding?: number; status: string;
  }[];
  totalExposure: number;
  activeLoans: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PHONE:     { label: "Same Phone Number",  icon: <Phone size={14} />,     color: "text-blue-400 bg-blue-900/20 border-blue-800/30" },
  GUARANTOR: { label: "Shared Guarantor",   icon: <Shield size={14} />,    color: "text-purple-400 bg-purple-900/20 border-purple-800/30" },
  EMPLOYER:  { label: "Same Employer",      icon: <Building2 size={14} />, color: "text-amber-400 bg-amber-900/20 border-amber-800/30" },
  ADDRESS:   { label: "Same Address",       icon: <MapPin size={14} />,    color: "text-emerald-400 bg-emerald-900/20 border-emerald-800/30" },
};

const RISK_COLOR: Record<string, string> = {
  LOW:      "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
  MEDIUM:   "bg-amber-900/30 text-amber-400 border-amber-800/40",
  HIGH:     "bg-orange-900/30 text-orange-400 border-orange-800/40",
  CRITICAL: "bg-red-900/40 text-red-300 border-red-800/50",
};

function riskFromExposure(totalExposure: number, memberCount: number): "LOW"|"MEDIUM"|"HIGH"|"CRITICAL" {
  if (totalExposure > 100000 || memberCount >= 5) return "CRITICAL";
  if (totalExposure > 50000 || memberCount >= 4)  return "HIGH";
  if (totalExposure > 20000 || memberCount >= 3)  return "MEDIUM";
  return "LOW";
}

export default function RelationshipExposurePage() {
  const [groups, setGroups] = useState<ExposureGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL"|"PHONE"|"GUARANTOR"|"EMPLOYER"|"ADDRESS">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/relationship-exposure`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (r.ok) setGroups(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalExposure = groups.reduce((s, g) => s + g.totalExposure, 0);
  const criticalCount = groups.filter(g => g.riskLevel === "CRITICAL" || g.riskLevel === "HIGH").length;

  const filtered = groups.filter(g => filter === "ALL" || g.type === filter);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network size={22} className="text-purple-400" /> Relationship Exposure Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Detect connected borrowers who may represent hidden risk concentration</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/5 px-3 py-2 rounded-xl hover:bg-white/[0.07] transition-all">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Alert banner */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/40 rounded-2xl px-5 py-4">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-red-300 text-sm">{criticalCount} High-Risk Exposure Group{criticalCount > 1 ? "s" : ""} Detected</div>
            <div className="text-xs text-red-500 mt-0.5">Multiple borrowers appear connected — review urgently to assess true risk exposure</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Connected Groups", value: groups.length,       color: "text-purple-400" },
          { label: "Total Exposure",   value: K(totalExposure),    color: "text-amber-400" },
          { label: "High Risk",        value: criticalCount,       color: "text-red-400" },
          { label: "Members Found",    value: groups.reduce((s,g) => s + g.members.length, 0), color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl w-fit flex-wrap">
        {(["ALL","PHONE","GUARANTOR","EMPLOYER","ADDRESS"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
            {f === "ALL" ? "All Groups" : TYPE_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {loading ? (
        <div className="py-16 text-center text-slate-600"><RefreshCw size={20} className="animate-spin mx-auto mb-2" /> Scanning for connections…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Shield size={32} className="text-emerald-700 mx-auto mb-3" />
          <div className="text-slate-500 font-semibold">No relationship exposure detected</div>
          <p className="text-slate-700 text-sm mt-1">No clients share the same phone, guarantor, employer, or address.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group, i) => {
            const key = `${group.type}-${i}`;
            const isOpen = expanded === key;
            const cfg = TYPE_CONFIG[group.type];
            return (
              <div key={key} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full text-left p-4 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 text-sm truncate">"{group.key}"</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {group.members.length} clients · {K(group.totalExposure)} total exposure · {group.activeLoans} active loan{group.activeLoans !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_COLOR[group.riskLevel]}`}>
                        {group.riskLevel}
                      </span>
                      {isOpen ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-4 py-4 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connected Clients</div>
                    <div className="space-y-2">
                      {group.members.map(m => (
                        <div key={m.accountId} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 text-sm">{m.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{m.clientNumber} · {m.email}</div>
                            {m.loanRef && <div className="text-xs text-amber-500 mt-0.5">{m.loanRef}</div>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {m.outstanding != null && (
                              <div className="text-sm font-bold text-amber-400">{K(m.outstanding)}</div>
                            )}
                            <div className="text-[10px] text-slate-600 mt-0.5">{m.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-start gap-2 bg-amber-900/10 border border-amber-800/20 rounded-xl p-3 text-xs text-amber-400">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                      <span>
                        {group.type === "PHONE" && "These clients share a phone number — may be the same person using multiple accounts."}
                        {group.type === "GUARANTOR" && "These loans share a guarantor — the guarantor's total exposure exceeds a single loan."}
                        {group.type === "EMPLOYER" && "These clients work at the same employer — employer risk affects all simultaneously."}
                        {group.type === "ADDRESS" && "These clients share an address — may be same household. Combined exposure: " + K(group.totalExposure) + "."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
