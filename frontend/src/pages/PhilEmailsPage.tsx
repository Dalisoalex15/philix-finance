import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Mail, Send, Users, Search, CheckSquare, Square, ChevronDown,
  ChevronUp, X, Loader2, CheckCircle, XCircle, AlertTriangle,
  Eye, MailCheck, RefreshCw, Zap, CreditCard, UserCheck,
  Bell, Gift, FileText, Star, MessageSquare, BarChart2, Megaphone,
} from "lucide-react";
import { staffApi, type PortalAccount } from "../lib/api";

// ── Template definitions ───────────────────────────────────────────────────────
const TEMPLATES = [
  { key: "welcome",                   label: "Welcome",              icon: Gift,         color: "emerald", desc: "Greet a new client with account details and portal access link." },
  { key: "loan_application_received", label: "App Received",         icon: FileText,     color: "blue",    desc: "Confirm you received their loan application — sets expectations." },
  { key: "loan_approved",             label: "Loan Approved",        icon: CheckCircle,  color: "emerald", desc: "Congratulate and share the full loan breakdown and first payment date." },
  { key: "loan_rejected",             label: "Loan Rejected",        icon: XCircle,      color: "red",     desc: "Decline with reason and invite them to reapply after 30 days." },
  { key: "payment_received",          label: "Payment Confirmed",    icon: MailCheck,    color: "emerald", desc: "Acknowledge a payment and show updated outstanding balance." },
  { key: "payment_reminder",          label: "Payment Reminder",     icon: Bell,         color: "amber",   desc: "Remind a client their payment is due soon — reduces defaults." },
  { key: "overdue_notice",            label: "Overdue Notice",       icon: AlertTriangle,color: "red",     desc: "Alert client their loan is overdue with penalty warning." },
  { key: "loan_repaid",               label: "Loan Cleared",         icon: Star,         color: "gold",    desc: "Celebrate full repayment and offer a next-loan growth CTA." },
  { key: "monthly_statement",         label: "Monthly Statement",    icon: BarChart2,    color: "indigo",  desc: "Send a full account summary — all loans, payments, outstanding." },
  { key: "custom",                    label: "Custom Email",         icon: MessageSquare,color: "purple",  desc: "Write your own subject and body. Full Philix branding applied." },
];

const COLOR: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-400", activeBg: "bg-emerald-500/20" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/25",    text: "text-blue-400",    activeBg: "bg-blue-500/20"    },
  red:     { bg: "bg-red-500/10",     border: "border-red-500/25",     text: "text-red-400",     activeBg: "bg-red-500/20"     },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",   text: "text-amber-400",   activeBg: "bg-amber-500/20"   },
  gold:    { bg: "bg-[#C9A227]/10",   border: "border-[#C9A227]/25",   text: "text-[#C9A227]",   activeBg: "bg-[#C9A227]/20"   },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/25",  text: "text-indigo-400",  activeBg: "bg-indigo-500/20"  },
  purple:  { bg: "bg-purple-500/10",  border: "border-purple-500/25",  text: "text-purple-400",  activeBg: "bg-purple-500/20"  },
};

const FILTERS = ["All Clients", "Active Loans", "Overdue", "KYC Pending", "No Loans"];

const avatarGrad = (id: string) => {
  const g = ["from-[#C9A227] to-amber-600","from-blue-500 to-blue-700","from-emerald-500 to-emerald-700","from-purple-500 to-purple-700","from-rose-500 to-rose-700","from-cyan-500 to-cyan-700"];
  return g[id.charCodeAt(0) % g.length];
};

interface Client extends PortalAccount {
  portalLoans?: { id: string; reference: string; status: string; amountRequested: number; productType: string }[];
}

interface SendResult { clientId: string; name: string; ok: boolean; }

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PhilEmailsPage() {
  // data
  const [clients, setClients]               = useState<Client[]>([]);
  const [loading, setLoading]               = useState(true);
  // selection
  const [selected, setSelected]             = useState<Set<string>>(new Set());
  const [search, setSearch]                 = useState("");
  const [clientFilter, setClientFilter]     = useState("All Clients");
  // template
  const [templateKey, setTemplateKey]       = useState("payment_reminder");
  const [customSubject, setCustomSubject]   = useState("");
  const [customBody, setCustomBody]         = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  // send state
  const [sending, setSending]               = useState(false);
  const [progress, setProgress]             = useState(0);
  const [results, setResults]               = useState<SendResult[]>([]);
  const [showResults, setShowResults]       = useState(false);
  // preview
  const [preview, setPreview]               = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await staffApi.getPortalAccounts() as Client[];
      // also fetch loan counts per client from search endpoint
      setClients(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // load preview when template changes
  useEffect(() => {
    if (!templateKey || templateKey === "custom") { setPreview(null); return; }
    setPreviewLoading(true);
    const token = localStorage.getItem("philix_staff_token") ?? "";
    fetch(`/api/emails/preview/${templateKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.text() : null)
      .then(html => { setPreview(html); setPreviewLoading(false); })
      .catch(() => setPreviewLoading(false));
  }, [templateKey]);

  // filtered client list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c => {
      const matchSearch = !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.clientNumber.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q);

      const hasLoans = (c._count?.loanApplications ?? 0) > 0;
      const matchFilter =
        clientFilter === "All Clients"  ? true :
        clientFilter === "Active Loans" ? hasLoans :
        clientFilter === "Overdue"      ? hasLoans :   // would need loan status — show all with loans
        clientFilter === "KYC Pending"  ? c.kycStatus !== "VERIFIED" :
        clientFilter === "No Loans"     ? !hasLoans : true;

      return matchSearch && matchFilter;
    });
  }, [clients, search, clientFilter]);

  const allSelected  = filtered.length > 0 && filtered.every(c => selected.has(c.id));
  const someSelected = selected.size > 0;
  const tpl          = TEMPLATES.find(t => t.key === templateKey)!;
  const col          = COLOR[tpl.color] ?? COLOR.amber;

  const toggleClient = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(c => n.delete(c.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(c => n.add(c.id)); return n; });
    }
  };

  const sendEmails = async (targets: Client[]) => {
    if (!targets.length) return;
    setSending(true); setShowResults(false); setResults([]); setProgress(0);
    const token = localStorage.getItem("philix_staff_token") ?? "";
    const out: SendResult[] = [];

    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      const body: Record<string, string> = { templateKey, accountId: c.id };
      if (templateKey === "custom") { body.customSubject = customSubject; body.customBody = customBody; }

      try {
        const r = await fetch("/api/emails/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        out.push({ clientId: c.id, name: `${c.firstName} ${c.lastName}`, ok: r.ok });
      } catch {
        out.push({ clientId: c.id, name: `${c.firstName} ${c.lastName}`, ok: false });
      }
      setProgress(Math.round(((i + 1) / targets.length) * 100));
    }

    setResults(out);
    setSending(false);
    setShowResults(true);
  };

  const sendToSelected = () => {
    const targets = clients.filter(c => selected.has(c.id));
    sendEmails(targets);
  };

  const sendToAll = () => sendEmails(filtered);

  const succeeded = results.filter(r => r.ok).length;
  const failed    = results.filter(r => !r.ok).length;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Mail size={22} className="text-[#C9A227]" />
            Phil Emails
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full tracking-wide">NEW</span>
          </h1>
          <p className="text-sm text-white/35 mt-0.5">Select clients → choose a template → send branded emails instantly.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Resend
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 gap-3 px-6 pb-4 flex-shrink-0">
        {[
          { label: "Total Clients",  value: clients.length,  color: "text-white/60" },
          { label: "Selected",       value: selected.size,   color: "text-[#C9A227]" },
          { label: "Emails Sent",    value: results.filter(r => r.ok).length,   color: "text-emerald-400" },
          { label: "Failed",         value: results.filter(r => !r.ok).length,  color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-white/30">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 gap-0 min-h-0 px-6 pb-6">

        {/* ─── LEFT: Client list ─── */}
        <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#0B1F3A] border border-white/5 rounded-2xl mr-4 overflow-hidden">
          {/* Search + controls */}
          <div className="p-4 border-b border-white/5 space-y-2 flex-shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#C9A227]/40"
              />
            </div>
            {/* Filter pills */}
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setClientFilter(f)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${clientFilter === f ? "bg-[#C9A227] text-[#0B1F3A]" : "bg-white/5 text-white/35 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
            {/* Select all */}
            <div className="flex items-center justify-between">
              <button onClick={toggleAll} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white transition-colors">
                {allSelected
                  ? <CheckSquare size={13} className="text-[#C9A227]" />
                  : <Square size={13} />}
                {allSelected ? "Deselect all" : `Select all (${filtered.length})`}
              </button>
              {someSelected && (
                <span className="text-[10px] font-bold text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/20 px-2 py-0.5 rounded-full">
                  {selected.size} selected
                </span>
              )}
            </div>
          </div>

          {/* Client rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[#C9A227]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-white/25 text-sm">No clients found</div>
            ) : filtered.map(c => {
              const isSelected = selected.has(c.id);
              const isExpanded = expandedClient === c.id;
              const loanCount  = c._count?.loanApplications ?? 0;
              return (
                <div key={c.id}
                  className={`transition-colors ${isSelected ? "bg-[#C9A227]/5" : "hover:bg-white/[0.02]"}`}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggleClient(c.id)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-[#C9A227] border-[#C9A227]" : "border-white/20"}`}>
                      {isSelected && <CheckSquare size={11} className="text-[#0B1F3A]" />}
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGrad(c.id)} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-white truncate">{c.firstName} {c.lastName}</div>
                      <div className="text-[10px] text-white/35 truncate">{c.clientNumber} · {c.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#C9A227] font-semibold">{loanCount} loan{loanCount !== 1 ? "s" : ""}</span>
                      <button onClick={e => { e.stopPropagation(); setExpandedClient(isExpanded ? null : c.id); }}
                        className="text-white/20 hover:text-white/60">
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-1">
                      <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1.5">Account Details</div>
                      {[
                        { l: "Phone",      v: c.phone || "—" },
                        { l: "KYC",        v: c.kycStatus.replace("_", " ") },
                        { l: "Status",     v: c.status },
                        { l: "Loans",      v: `${loanCount} application${loanCount !== 1 ? "s" : ""}` },
                        { l: "Joined",     v: new Date(c.createdAt).toLocaleDateString("en-GB") },
                      ].map(row => (
                        <div key={row.l} className="flex justify-between text-[11px]">
                          <span className="text-white/30">{row.l}</span>
                          <span className="text-white/60 font-medium">{row.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── MIDDLE: Template picker ─── */}
        <div className="w-[280px] flex-shrink-0 flex flex-col mr-4">
          <div className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">Choose Email Type</div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {TEMPLATES.map(t => {
              const c  = COLOR[t.color] ?? COLOR.amber;
              const active = templateKey === t.key;
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTemplateKey(t.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    active
                      ? `${c.activeBg} ${c.border} ring-1 ring-inset ${c.border}`
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                  }`}>
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={14} className={c.text} />
                  </div>
                  <div>
                    <div className={`text-[12px] font-bold ${active ? c.text : "text-white/70"}`}>{t.label}</div>
                    <div className="text-[10px] text-white/30 leading-snug mt-0.5">{t.desc}</div>
                  </div>
                  {active && <div className={`ml-auto w-1.5 h-1.5 rounded-full mt-1 ${c.text} flex-shrink-0`} style={{ background: "currentColor" }} />}
                </button>
              );
            })}
          </div>

          {/* Custom fields */}
          {templateKey === "custom" && (
            <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
              <input value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                placeholder="Email subject…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#C9A227]/40" />
              <textarea value={customBody} onChange={e => setCustomBody(e.target.value)}
                rows={5} placeholder="Write your message here…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#C9A227]/40 resize-none" />
            </div>
          )}
        </div>

        {/* ─── RIGHT: Send controls + preview ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">Send Controls</div>

          {/* Selected chips */}
          {selected.size > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 max-h-20 overflow-y-auto">
              {Array.from(selected).slice(0, 12).map(id => {
                const c = clients.find(x => x.id === id);
                if (!c) return null;
                return (
                  <span key={id} className="flex items-center gap-1 bg-[#C9A227]/10 border border-[#C9A227]/20 text-[#C9A227] text-[11px] font-medium px-2 py-0.5 rounded-full">
                    {c.firstName} {c.lastName}
                    <button onClick={() => toggleClient(id)}><X size={10} /></button>
                  </span>
                );
              })}
              {selected.size > 12 && (
                <span className="text-[11px] text-white/30 px-2 py-0.5">+{selected.size - 12} more</span>
              )}
            </div>
          )}

          {/* Send buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={sendToSelected}
              disabled={sending || selected.size === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#d4a82a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B1F3A] font-black text-[13px] py-3 rounded-xl transition-all shadow-lg shadow-[#C9A227]/20">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sending ? "Sending…" : `Send to Selected  ${selected.size > 0 ? `(${selected.size})` : ""}`}
            </button>

            <button
              onClick={sendToAll}
              disabled={sending || filtered.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold text-[13px] py-3 rounded-xl transition-all">
              <Users size={15} />
              Send to ALL {filtered.length} Clients
            </button>

            <button onClick={() => {
              if (!templateKey || templateKey === "custom") return;
              setPreviewLoading(true);
              const token = localStorage.getItem("philix_staff_token") ?? "";
              fetch(`/api/emails/preview/${templateKey}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.text() : null)
                .then(html => { setPreview(html); setPreviewLoading(false); })
                .catch(() => setPreviewLoading(false));
            }}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-white/40 hover:text-white/70 text-[12px] py-2 rounded-xl transition-all">
              {previewLoading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Preview Email
            </button>
          </div>

          {/* Progress bar */}
          {sending && (
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>Sending emails…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-2 bg-[#C9A227] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && !sending && (
            <div className="mb-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-bold text-white/60">Send Results</div>
                <button onClick={() => setShowResults(false)} className="text-white/25 hover:text-white/60"><X size={13} /></button>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-black text-emerald-400">{succeeded}</div>
                  <div className="text-[10px] text-white/30">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-red-400">{failed}</div>
                  <div className="text-[10px] text-white/30">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-white/60">{results.length}</div>
                  <div className="text-[10px] text-white/30">Total</div>
                </div>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    {r.ok
                      ? <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                      : <XCircle    size={11} className="text-red-400 flex-shrink-0" />}
                    <span className={r.ok ? "text-white/60" : "text-white/30"}>{r.name}</span>
                    <span className={`ml-auto text-[10px] ${r.ok ? "text-emerald-400" : "text-red-400"}`}>{r.ok ? "Sent" : "Failed"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email preview pane */}
          <div className="flex-1 bg-[#0B1F3A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <Eye size={12} />
                <span>Email Preview — <span className="text-[#C9A227]">{tpl?.label}</span></span>
              </div>
              <button onClick={load} className="text-white/20 hover:text-white/50 transition-colors">
                <RefreshCw size={12} />
              </button>
            </div>
            <div className="overflow-auto h-full max-h-[420px]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={20} className="animate-spin text-[#C9A227]" />
                </div>
              ) : preview ? (
                <iframe srcDoc={preview} className="w-full h-[420px] border-0" title="Email preview" />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-white/20 text-sm gap-2">
                  <Mail size={24} className="opacity-30" />
                  <span>Click "Preview Email" to see the template</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
