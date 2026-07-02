import { useState, useEffect, useCallback } from "react";
import {
  Phone, MapPin, MessageSquare, Mail, Zap, Scale, Plus, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp,
  User, Calendar, Filter, X, Edit3, Trash2, RotateCcw,
} from "lucide-react";

const API = "/api";
const K = (n: number) => `K${(n ?? 0).toLocaleString("en-ZM", { maximumFractionDigits: 0 })}`;
const token = () => localStorage.getItem("philix_staff_token") ?? "";
const auth  = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const TYPES = ["CALL","VISIT","SMS","EMAIL","WHATSAPP","LEGAL"] as const;
const PRIORITIES = ["LOW","MEDIUM","HIGH","URGENT"] as const;
const STATUSES = ["PENDING","IN_PROGRESS","COMPLETED","FAILED","RESCHEDULED"] as const;

const TYPE_ICON: Record<string, React.ReactNode> = {
  CALL:     <Phone size={12} />,
  VISIT:    <MapPin size={12} />,
  SMS:      <MessageSquare size={12} />,
  EMAIL:    <Mail size={12} />,
  WHATSAPP: <MessageSquare size={12} />,
  LEGAL:    <Scale size={12} />,
};
const TYPE_COLOR: Record<string, string> = {
  CALL:     "bg-blue-500/15 text-blue-400 border-blue-500/25",
  VISIT:    "bg-orange-500/15 text-orange-400 border-orange-500/25",
  SMS:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  EMAIL:    "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  WHATSAPP: "bg-green-500/15 text-green-400 border-green-500/25",
  LEGAL:    "bg-red-500/15 text-red-400 border-red-500/25",
};
const PRIO_COLOR: Record<string, string> = {
  LOW:    "bg-slate-700 text-slate-400",
  MEDIUM: "bg-amber-900/40 text-amber-400",
  HIGH:   "bg-orange-900/40 text-orange-400",
  URGENT: "bg-red-900/50 text-red-300 animate-pulse",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-amber-900/30 text-amber-400 border-amber-800/40",
  IN_PROGRESS: "bg-blue-900/30 text-blue-400 border-blue-800/40",
  COMPLETED:   "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
  FAILED:      "bg-red-900/30 text-red-400 border-red-800/40",
  RESCHEDULED: "bg-purple-900/30 text-purple-400 border-purple-800/40",
};

interface FollowUp {
  id: string;
  clientName: string; clientPhone?: string; loanRef?: string;
  amountDue?: number; daysOverdue?: number;
  assignedTo: string; assignedBy: string;
  followUpType: string; priority: string; status: string;
  notes?: string; outcome?: string;
  scheduledAt: string; completedAt?: string; nextFollowUpAt?: string;
  createdAt: string;
}

interface Stats { pending: number; overdue: number; todayCount: number; completedWeek: number; urgent: number; }

type Tab = "ALL" | "PENDING" | "MY" | "TODAY" | "OVERDUE" | "COMPLETED";

function CreateModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    clientName: "", clientPhone: "", loanRef: "", amountDue: "",
    daysOverdue: "", assignedTo: "", followUpType: "CALL",
    priority: "MEDIUM", notes: "",
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0,16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.assignedTo) { setError("Client name and assigned to are required"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/follow-ups`, {
        method: "POST", headers: auth(),
        body: JSON.stringify({
          ...form,
          amountDue: form.amountDue ? parseFloat(form.amountDue) : undefined,
          daysOverdue: form.daysOverdue ? parseInt(form.daysOverdue) : undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
      });
      if (!r.ok) { const d = await r.json(); setError(d.error || "Failed"); return; }
      onDone();
    } finally { setLoading(false); }
  }

  const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B1F3A] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-bold text-white text-lg">New Follow-Up Task</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Client Name *</label>
              <input className={inp} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="John Banda" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Client Phone</label>
              <input className={inp} value={form.clientPhone} onChange={e => set("clientPhone", e.target.value)} placeholder="0977 000 000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Loan Reference</label>
              <input className={inp} value={form.loanRef} onChange={e => set("loanRef", e.target.value)} placeholder="PHX-1234" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Amount Due (K)</label>
              <input type="number" className={inp} value={form.amountDue} onChange={e => set("amountDue", e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Days Overdue</label>
              <input type="number" className={inp} value={form.daysOverdue} onChange={e => set("daysOverdue", e.target.value)} placeholder="14" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Assign To *</label>
              <input className={inp} value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} placeholder="Staff name or email" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Type</label>
              <select className={inp} value={form.followUpType} onChange={e => set("followUpType", e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Priority</label>
              <select className={inp} value={form.priority} onChange={e => set("priority", e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-semibold">Scheduled For</label>
              <input type="datetime-local" className={inp} value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block font-semibold">Notes</label>
            <textarea rows={3} className={inp + " resize-none"} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Context, previous contact attempts, strategy…" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-white/10 text-slate-400 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all">
              {loading ? "Creating…" : "Create Follow-Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OutcomeModal({ fu, onClose, onDone }: { fu: FollowUp; onClose: () => void; onDone: () => void }) {
  const [status, setStatus] = useState<string>("COMPLETED");
  const [outcome, setOutcome] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch(`${API}/follow-ups/${fu.id}`, {
      method: "PATCH", headers: auth(),
      body: JSON.stringify({ status, outcome, nextFollowUpAt: nextDate ? new Date(nextDate).toISOString() : undefined }),
    });
    setLoading(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0B1F3A] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">Record Outcome</h3>
          <button onClick={onClose} className="text-slate-500"><X size={16} /></button>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-slate-200">{fu.clientName}</div>
          <div className="text-xs text-slate-500">{fu.followUpType} · {fu.loanRef}</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Result</label>
            <div className="grid grid-cols-2 gap-2">
              {(["COMPLETED","FAILED","RESCHEDULED","IN_PROGRESS"] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${status === s ? STATUS_COLOR[s] : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                  {s.replace("_"," ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Outcome Notes</label>
            <textarea rows={3} value={outcome} onChange={e => setOutcome(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="What happened? What was said? Next steps?" />
          </div>
          {(status === "RESCHEDULED" || status === "IN_PROGRESS") && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Next Follow-Up Date</label>
              <input type="datetime-local"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                value={nextDate} onChange={e => setNextDate(e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 text-slate-400 rounded-xl text-sm">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all">
            {loading ? "Saving…" : "Save Outcome"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, overdue: 0, todayCount: 0, completedWeek: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [outcomeTarget, setOutcomeTarget] = useState<FollowUp | null>(null);
  const [filterPrio, setFilterPrio] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API}/follow-ups`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/follow-ups/stats`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (itemsRes.ok) setItems(await itemsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteItem(id: string) {
    if (!confirm("Delete this follow-up?")) return;
    await fetch(`${API}/follow-ups/${id}`, { method: "DELETE", headers: auth() });
    load();
  }

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const filtered = items.filter(f => {
    const due = new Date(f.scheduledAt);
    const matchTab =
      tab === "ALL"       ? true :
      tab === "PENDING"   ? f.status === "PENDING" :
      tab === "MY"        ? (f.status !== "COMPLETED" && f.status !== "FAILED") :
      tab === "TODAY"     ? (due >= today && due < tomorrow) :
      tab === "OVERDUE"   ? (f.status === "PENDING" && due < today) :
      tab === "COMPLETED" ? (f.status === "COMPLETED" || f.status === "FAILED") : true;
    const matchPrio = filterPrio === "ALL" || f.priority === filterPrio;
    const matchType = filterType === "ALL" || f.followUpType === filterType;
    return matchTab && matchPrio && matchType;
  });

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "PENDING",   label: "Pending",   count: items.filter(f => f.status === "PENDING").length },
    { key: "OVERDUE",   label: "Overdue",   count: stats.overdue },
    { key: "TODAY",     label: "Today",     count: stats.todayCount },
    { key: "ALL",       label: "All",       count: items.length },
    { key: "COMPLETED", label: "Completed", count: stats.completedWeek },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Follow-Up Team</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track collection activities and client contact attempts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/5 px-3 py-2 rounded-xl hover:bg-white/[0.07] transition-all">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <Plus size={14} /> New Follow-Up
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Pending",        value: stats.pending,      color: "text-amber-400" },
          { label: "Overdue",        value: stats.overdue,      color: "text-red-400" },
          { label: "Due Today",      value: stats.todayCount,   color: "text-blue-400" },
          { label: "Urgent",         value: stats.urgent,       color: "text-orange-400" },
          { label: "Done This Week", value: stats.completedWeek,color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {t.label}
              {t.count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-white/5"}`}>{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)}
            className="text-xs bg-white/[0.04] border border-white/5 text-slate-400 rounded-xl px-3 py-1.5 focus:outline-none">
            <option value="ALL">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-xs bg-white/[0.04] border border-white/5 text-slate-400 rounded-xl px-3 py-1.5 focus:outline-none">
            <option value="ALL">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-600"><RefreshCw size={20} className="animate-spin mx-auto mb-2" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle size={32} className="text-emerald-700 mx-auto mb-3" />
          <div className="text-slate-500 font-semibold">No follow-ups in this view</div>
          <p className="text-slate-700 text-sm mt-1">All clear for now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(fu => {
            const isOpen = expanded === fu.id;
            const due = new Date(fu.scheduledAt);
            const isOverdue = fu.status === "PENDING" && due < new Date();
            const dueLabel = isOverdue
              ? `${Math.floor((Date.now() - due.getTime()) / 86400000)}d overdue`
              : due.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

            return (
              <div key={fu.id}
                className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${isOverdue ? "border-red-800/40" : "border-white/5"}`}>
                <button onClick={() => setExpanded(isOpen ? null : fu.id)}
                  className="w-full text-left p-4 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-3">
                    {/* Priority indicator */}
                    <div className={`w-2 h-8 rounded-full flex-shrink-0 ${fu.priority === "URGENT" ? "bg-red-500" : fu.priority === "HIGH" ? "bg-orange-500" : fu.priority === "MEDIUM" ? "bg-amber-500" : "bg-slate-600"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{fu.clientName}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLOR[fu.followUpType]}`}>
                          {TYPE_ICON[fu.followUpType]} {fu.followUpType}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIO_COLOR[fu.priority]}`}>
                          {fu.priority}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[fu.status]}`}>
                          {fu.status.replace("_"," ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        {fu.loanRef && <span className="font-mono">{fu.loanRef}</span>}
                        {fu.amountDue && <span className="text-amber-500 font-semibold">{K(fu.amountDue)}</span>}
                        {fu.daysOverdue && <span className="text-red-400">{fu.daysOverdue}d overdue</span>}
                        <span className="flex items-center gap-1">
                          <User size={9} /> {fu.assignedTo}
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400 font-semibold" : ""}`}>
                          <Calendar size={9} /> {dueLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {fu.status !== "COMPLETED" && fu.status !== "FAILED" && (
                        <button onClick={e => { e.stopPropagation(); setOutcomeTarget(fu); }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 rounded-xl hover:bg-emerald-600/30 transition-all font-semibold">
                          <CheckCircle size={11} /> Done
                        </button>
                      )}
                      {isOpen ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-4 py-4 space-y-3">
                    {fu.notes && (
                      <div className="bg-white/[0.02] rounded-xl p-3 text-xs text-slate-400">
                        <div className="font-semibold text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Notes</div>
                        {fu.notes}
                      </div>
                    )}
                    {fu.outcome && (
                      <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-xl p-3 text-xs text-emerald-300">
                        <div className="font-semibold mb-1 text-[10px] uppercase tracking-wider">Outcome</div>
                        {fu.outcome}
                      </div>
                    )}
                    {fu.nextFollowUpAt && (
                      <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-900/10 border border-purple-800/30 rounded-xl px-3 py-2">
                        <RotateCcw size={11} /> Next follow-up: {new Date(fu.nextFollowUpAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      Created by {fu.assignedBy} · {new Date(fu.createdAt).toLocaleDateString("en-GB")}
                      {fu.completedAt && ` · Completed ${new Date(fu.completedAt).toLocaleDateString("en-GB")}`}
                    </div>
                    <div className="flex gap-2">
                      {fu.clientPhone && (
                        <a href={`tel:${fu.clientPhone}`}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/20 transition-all">
                          <Phone size={11} /> Call
                        </a>
                      )}
                      <button onClick={() => deleteItem(fu.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-600/10 border border-red-600/20 text-red-400 rounded-xl hover:bg-red-600/20 transition-all ml-auto">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); }} />}
      {outcomeTarget && <OutcomeModal fu={outcomeTarget} onClose={() => setOutcomeTarget(null)} onDone={() => { setOutcomeTarget(null); load(); }} />}
    </div>
  );
}
