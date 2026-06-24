import { useState, useEffect, useCallback } from "react";
import {
  Mail, CheckCircle, XCircle, Clock, RefreshCw, Send,
  Search, Filter, RotateCcw, Users, TrendingUp, BarChart2,
  ChevronLeft, ChevronRight, Eye, AlertCircle, Megaphone,
} from "lucide-react";

const API = "/api";

function staffHeaders() {
  const token = localStorage.getItem("philix_staff_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const r = await fetch(`${API}${path}`, { headers: staffHeaders(), ...opts });
  if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || d.error || "Request failed"); }
  return r.json();
}

interface EmailLog {
  id: string; to: string; toName?: string; subject: string; template?: string;
  body?: string; status: string; error?: string; triggeredBy?: string;
  createdAt: string; resendId?: string;
}

interface Campaign {
  id: string; name: string; subject: string; targetGroup: string; status: string;
  sentAt?: string; totalSent: number; totalFailed: number; createdBy: string; createdAt: string;
}

interface Stats {
  total: number; sent: number; failed: number; last24h: number;
  byCategory: Array<{ template: string; _count: { id: number } }>;
}

const STATUS_ICON: Record<string, React.ElementType> = {
  SENT: CheckCircle, FAILED: XCircle, PENDING: Clock, DELIVERED: CheckCircle,
};
const STATUS_COLOR: Record<string, string> = {
  SENT: "#4ade80", FAILED: "#ef4444", PENDING: "#fbbf24", DELIVERED: "#60a5fa",
};
const TEMPLATE_COLOR: Record<string, string> = {
  WELCOME: "#6366f1", OTP: "#ec4899", LOAN_APPROVED: "#22c55e", LOAN_REJECTED: "#ef4444",
  LOAN_DISBURSED: "#3b82f6", PAYMENT_CONFIRMED: "#10b981", PAYMENT_REJECTED: "#f59e0b",
  PAYMENT_REMINDER: "#f97316", PAYMENT_OVERDUE: "#dc2626", LOAN_RENEWED: "#8b5cf6",
  CAMPAIGN: "#06b6d4", STATEMENT: "#64748b",
};

export default function EmailManagementPage() {
  const [tab, setTab] = useState<"logs" | "campaigns" | "compose">("logs");
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EmailLog | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Compose state
  const [cName, setCName]     = useState("");
  const [cSubject, setCSubject] = useState("");
  const [cText, setCText]     = useState("");
  const [cTarget, setCTarget]  = useState("ALL");
  const [sending, setSending]  = useState(false);
  const [composeMsg, setComposeMsg] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (statusFilter)   params.set("status",   statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search)         params.set("search",   search);
      const data = await apiFetch(`/admin/email-logs?${params}`);
      setLogs(data.logs || []);
      setTotalPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, search]);

  const loadStats = useCallback(async () => {
    const s = await apiFetch("/admin/email-stats").catch(() => null);
    if (s) setStats(s);
  }, []);

  const loadCampaigns = useCallback(async () => {
    const data = await apiFetch("/admin/email-campaigns").catch(() => []);
    setCampaigns(data);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === "campaigns") loadCampaigns(); }, [tab, loadCampaigns]);

  async function resend(log: EmailLog) {
    setResendingId(log.id);
    try {
      await apiFetch(`/admin/email-logs/${log.id}/resend`, { method: "POST" });
      await loadLogs();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setResendingId(null);
    }
  }

  async function sendCampaign() {
    if (!cName || !cSubject || !cText) { setComposeMsg("Please fill in all fields."); return; }
    setSending(true); setComposeMsg("");
    try {
      const data = await apiFetch("/admin/email-campaigns", {
        method: "POST",
        body: JSON.stringify({ name: cName, subject: cSubject, text: cText, targetGroup: cTarget }),
      });
      setComposeMsg(`✅ Campaign "${data.name}" queued for ${data.totalRecipients} recipients.`);
      setCName(""); setCSubject(""); setCText(""); setCTarget("ALL");
      loadCampaigns();
      loadStats();
    } catch (e) {
      setComposeMsg(`❌ ${(e as Error).message}`);
    } finally {
      setSending(false);
    }
  }

  const statCards = [
    { label: "Total Sent", value: stats?.sent ?? "—",     icon: Send,      color: "#4ade80" },
    { label: "Failed",     value: stats?.failed ?? "—",   icon: XCircle,   color: "#ef4444" },
    { label: "Last 24h",   value: stats?.last24h ?? "—",  icon: TrendingUp,color: "#60a5fa" },
    { label: "Total Logs", value: stats?.total ?? "—",    icon: BarChart2,  color: "#C9A84C" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ color: "#f8fafc", fontSize: "22px", fontWeight: 800, margin: 0 }}>Email Management</h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>Monitor sends, manage campaigns, view delivery logs</p>
        </div>
        <button onClick={() => { loadLogs(); loadStats(); }}
          style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "10px", padding: "8px 16px", color: "#C9A84C", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{c.label}</span>
              <div style={{ background: `${c.color}18`, borderRadius: "8px", padding: "6px" }}>
                <c.icon size={16} color={c.color} />
              </div>
            </div>
            <div style={{ color: "#f8fafc", fontSize: "28px", fontWeight: 800 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#0B1F3A", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {[{ key: "logs", label: "Email Logs", icon: Mail },
          { key: "campaigns", label: "Campaigns", icon: Megaphone },
          { key: "compose", label: "Send Campaign", icon: Send }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            style={{ padding: "8px 18px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
              background: tab === t.key ? "#1e3a5f" : "transparent", color: tab === t.key ? "#C9A84C" : "#64748b" }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ── LOGS TAB ── */}
      {tab === "logs" && (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: "16px" }}>
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by email…"
                  style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", height: "38px", background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "9px", color: "#e2e8f0", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              {[
                { value: statusFilter, onChange: setStatusFilter, options: ["", "SENT", "FAILED", "PENDING"], label: "Status" },
                { value: categoryFilter, onChange: setCategoryFilter, options: ["", "WELCOME", "OTP", "LOAN_APPROVED", "LOAN_REJECTED", "LOAN_DISBURSED", "PAYMENT_CONFIRMED", "PAYMENT_REJECTED", "PAYMENT_REMINDER", "PAYMENT_OVERDUE", "CAMPAIGN", "STATEMENT"], label: "Category" },
              ].map(f => (
                <select key={f.label} value={f.value} onChange={e => { f.onChange(e.target.value); setPage(1); }}
                  style={{ height: "38px", padding: "0 10px", background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "9px", color: f.value ? "#C9A84C" : "#64748b", fontSize: "13px" }}>
                  <option value="">{f.label}</option>
                  {f.options.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              {(statusFilter || categoryFilter || search) && (
                <button onClick={() => { setStatusFilter(""); setCategoryFilter(""); setSearch(""); setPage(1); }}
                  style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "9px", padding: "0 12px", color: "#94a3b8", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <XCircle size={12} /> Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "14px", overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading…</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <Mail size={36} color="#1e3a5f" style={{ marginBottom: "12px" }} />
                  <p style={{ color: "#64748b", margin: 0 }}>No emails logged yet</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                      {["Status", "To", "Subject", "Category", "Date", ""].map(h => (
                        <th key={h} style={{ padding: "11px 14px", color: "#64748b", fontWeight: 600, textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const Icon = STATUS_ICON[log.status] || Clock;
                      const col  = STATUS_COLOR[log.status] || "#64748b";
                      const tCol = TEMPLATE_COLOR[log.template || ""] || "#334155";
                      return (
                        <tr key={log.id} onClick={() => setSelected(s => s?.id === log.id ? null : log)}
                          style={{ borderBottom: "1px solid #0d1b2a", cursor: "pointer", background: selected?.id === log.id ? "#0f2744" : "transparent" }}>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Icon size={14} color={col} />
                              <span style={{ color: col, fontSize: "11px", fontWeight: 600 }}>{log.status}</span>
                            </div>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ color: "#e2e8f0", fontWeight: 500 }}>{log.toName || log.to.split("@")[0]}</div>
                            <div style={{ color: "#64748b", fontSize: "11px" }}>{log.to}</div>
                          </td>
                          <td style={{ padding: "11px 14px", color: "#94a3b8", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.subject}</td>
                          <td style={{ padding: "11px 14px" }}>
                            {log.template && (
                              <span style={{ background: `${tCol}22`, color: tCol, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" }}>
                                {log.template}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "11px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                            {new Date(log.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            {log.status === "FAILED" && (
                              <button onClick={e => { e.stopPropagation(); resend(log); }}
                                disabled={resendingId === log.id}
                                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#C9A84C", cursor: "pointer", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                {resendingId === log.id ? <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={10} />}
                                Resend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "6px 12px", color: page === 1 ? "#334155" : "#94a3b8", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ color: "#64748b", fontSize: "13px" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "6px 12px", color: page === totalPages ? "#334155" : "#94a3b8", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Side panel */}
          {selected && (
            <div style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "24px", height: "fit-content", position: "sticky", top: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ color: "#f8fafc", fontWeight: 700, margin: 0, fontSize: "15px" }}>Email Detail</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Status",   value: selected.status, color: STATUS_COLOR[selected.status] || "#94a3b8" },
                  { label: "To",       value: `${selected.toName || ""} <${selected.to}>` },
                  { label: "Subject",  value: selected.subject },
                  { label: "Category", value: selected.template || "—" },
                  { label: "Sent at",  value: new Date(selected.createdAt).toLocaleString("en-GB") },
                  ...(selected.resendId ? [{ label: "Resend ID", value: selected.resendId }] : []),
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{f.label}</div>
                    <div style={{ color: (f as any).color || "#e2e8f0", fontSize: "13px", wordBreak: "break-all" }}>{f.value}</div>
                  </div>
                ))}
                {selected.body && (
                  <div>
                    <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Body</div>
                    <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px", color: "#94a3b8", fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>
                      {selected.body}
                    </div>
                  </div>
                )}
                {selected.error && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px", marginBottom: "4px" }}>ERROR</div>
                    <div style={{ color: "#fca5a5", fontSize: "12px" }}>{selected.error}</div>
                  </div>
                )}
                {selected.status === "FAILED" && (
                  <button onClick={() => resend(selected)}
                    disabled={resendingId === selected.id}
                    style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", border: "none", borderRadius: "10px", padding: "10px 16px", color: "#0A1F44", fontWeight: 700, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    {resendingId === selected.id ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={14} />}
                    Resend Email
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CAMPAIGNS TAB ── */}
      {tab === "campaigns" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "16px" }}>
            {campaigns.length === 0 ? (
              <div style={{ gridColumn: "1/-1", padding: "60px", textAlign: "center", color: "#64748b" }}>
                <Megaphone size={36} color="#1e3a5f" style={{ marginBottom: "12px" }} />
                <p style={{ margin: 0 }}>No campaigns sent yet</p>
                <button onClick={() => setTab("compose")} style={{ marginTop: "12px", background: "#C9A84C", color: "#0A1F44", border: "none", borderRadius: "9px", padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
                  Create First Campaign
                </button>
              </div>
            ) : campaigns.map(c => (
              <div key={c.id} style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "14px" }}>{c.name}</div>
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{c.subject}</div>
                  </div>
                  <span style={{ background: c.status === "SENT" ? "rgba(34,197,94,0.12)" : c.status === "FAILED" ? "rgba(239,68,68,0.12)" : "rgba(251,191,36,0.12)", color: c.status === "SENT" ? "#4ade80" : c.status === "FAILED" ? "#ef4444" : "#fbbf24", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  {[
                    { label: "Target",  value: c.targetGroup },
                    { label: "Sent",    value: c.totalSent.toString() },
                    { label: "Failed",  value: c.totalFailed.toString() },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#0f172a", borderRadius: "8px", padding: "8px 10px" }}>
                      <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>{s.label}</div>
                      <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 700 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ color: "#475569", fontSize: "11px" }}>
                  By {c.createdBy} · {c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-GB") : new Date(c.createdAt).toLocaleDateString("en-GB")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPOSE TAB ── */}
      {tab === "compose" && (
        <div style={{ maxWidth: "680px" }}>
          <div style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "16px", padding: "32px" }}>
            <h2 style={{ color: "#f8fafc", fontWeight: 800, fontSize: "17px", margin: "0 0 24px" }}>Send Email Campaign</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Campaign Name */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>CAMPAIGN NAME</label>
                <input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. June Payment Reminder"
                  style={{ width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", boxSizing: "border-box" }} />
              </div>

              {/* Target Group */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>TARGET GROUP</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                  {[
                    { key: "ALL",     label: "All Clients",   desc: "Everyone" },
                    { key: "ACTIVE",  label: "Active Loans",  desc: "DISBURSED" },
                    { key: "REPAID",  label: "Repaid",        desc: "Completed" },
                    { key: "PENDING", label: "Pending",       desc: "Awaiting" },
                  ].map(g => (
                    <button key={g.key} onClick={() => setCTarget(g.key)}
                      style={{ background: cTarget === g.key ? "rgba(201,168,76,0.15)" : "#0f172a", border: `1px solid ${cTarget === g.key ? "#C9A84C" : "#1e3a5f"}`, borderRadius: "10px", padding: "10px 8px", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ color: cTarget === g.key ? "#C9A84C" : "#94a3b8", fontWeight: 700, fontSize: "12px" }}>{g.label}</div>
                      <div style={{ color: "#475569", fontSize: "10px" }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>EMAIL SUBJECT</label>
                <input value={cSubject} onChange={e => setCSubject(e.target.value)} placeholder="e.g. Important: Your upcoming payment"
                  style={{ width: "100%", padding: "10px 14px", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", boxSizing: "border-box" }} />
              </div>

              {/* Message */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>MESSAGE BODY</label>
                <textarea value={cText} onChange={e => setCText(e.target.value)} rows={8} placeholder="Write your email message here…"
                  style={{ width: "100%", padding: "12px 14px", background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>

              {composeMsg && (
                <div style={{ background: composeMsg.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${composeMsg.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "10px", padding: "12px 16px", color: composeMsg.startsWith("✅") ? "#4ade80" : "#fca5a5", fontSize: "13px" }}>
                  {composeMsg}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={sendCampaign} disabled={sending}
                  style={{ flex: 1, height: "46px", background: "linear-gradient(135deg,#C9A84C,#E8C96A)", border: "none", borderRadius: "11px", color: "#0A1F44", fontWeight: 700, fontSize: "14px", cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: sending ? 0.7 : 1 }}>
                  {sending ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
                  {sending ? "Sending Campaign…" : "Send to " + cTarget}
                </button>
                <button onClick={() => { setCName(""); setCSubject(""); setCText(""); setCTarget("ALL"); setComposeMsg(""); }}
                  style={{ height: "46px", padding: "0 18px", background: "#1e293b", border: "1px solid #334155", borderRadius: "11px", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Info boxes */}
          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { icon: Users, label: "Smart targeting", desc: "Filter recipients by loan status — active, repaid, or pending." },
              { icon: Mail, label: "Branded emails", desc: "All campaigns are sent using the Philix Finance HTML template." },
            ].map(i => (
              <div key={i.label} style={{ background: "#0B1F3A", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px" }}>
                <div style={{ background: "rgba(201,168,76,0.1)", borderRadius: "8px", padding: "8px", height: "fit-content" }}>
                  <i.icon size={16} color="#C9A84C" />
                </div>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>{i.label}</div>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>{i.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        tr:hover td { background: rgba(201,168,76,0.04); }
      `}</style>
    </div>
  );
}
