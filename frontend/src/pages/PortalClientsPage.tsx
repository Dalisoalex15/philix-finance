import { useState, useEffect } from "react";
import {
  Users, Search, Eye, RefreshCw, ShieldCheck, ShieldOff, Lock,
  Mail, Phone, MapPin, Briefcase, BadgeCheck, AlertTriangle, X,
  Calendar, CreditCard, KeyRound, CheckCircle, ChevronDown, ChevronUp,
} from "lucide-react";

const API = "/api";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-900/40 text-emerald-400 border-emerald-800/50",
    PENDING_KYC: "bg-amber-900/40 text-amber-400 border-amber-800/50",
    SUSPENDED: "bg-red-900/40 text-red-400 border-red-800/50",
    BLACKLISTED: "bg-rose-900/60 text-rose-300 border-rose-800/60",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function kycBadge(kyc: string) {
  const map: Record<string, string> = {
    VERIFIED: "text-emerald-400",
    IN_REVIEW: "text-blue-400",
    SUBMITTED: "text-indigo-400",
    REJECTED: "text-red-400",
    NOT_STARTED: "text-slate-500",
  };
  return <span className={`text-xs font-semibold ${map[kyc] ?? "text-slate-400"}`}>{kyc.replace("_", " ")}</span>;
}

interface Account {
  id: string;
  clientNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  occupation: string | null;
  employer: string | null;
  monthlyIncome: number | null;
  nrcNumber: string | null;
  kycStatus: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  createdAt: string;
  _count: { loanApplications: number };
}

interface AccountDetail extends Account {
  loanApplications: {
    id: string; reference: string; productType: string;
    amountRequested: number; status: string; createdAt: string;
  }[];
  kycDocuments: { id: string; docType: string; uploadedAt: string }[];
  hasPassword: boolean;
}

export default function PortalClientsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetResult, setResetResult] = useState("");
  const [resetError, setResetError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("personal");

  const token = localStorage.getItem("philix_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  async function loadAccounts() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/portal-accounts`, { headers });
      if (r.ok) setAccounts(await r.json());
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    setDetailLoading(true);
    try {
      const r = await fetch(`${API}/admin/portal-accounts/${id}`, { headers });
      if (r.ok) setSelected(await r.json());
    } finally {
      setDetailLoading(false);
    }
  }

  async function resetPassword() {
    if (!selected || !newPassword) return;
    setResetResult("");
    setResetError("");
    const r = await fetch(`${API}/admin/portal-accounts/${selected.id}/reset-password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ newPassword }),
    });
    const data = await r.json();
    if (r.ok) {
      setResetResult(`Password successfully set to: ${newPassword}`);
      setNewPassword("");
    } else {
      setResetError(data.error || "Failed to reset password");
    }
  }

  async function changeStatus(status: string) {
    if (!selected) return;
    setStatusLoading(true);
    try {
      const r = await fetch(`${API}/admin/portal-accounts/${selected.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        await loadDetail(selected.id);
        await loadAccounts();
      }
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => { loadAccounts(); }, []);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.clientNumber.toLowerCase().includes(q) ||
      (a.phone || "").includes(q)
    );
  });

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Portal Clients</h1>
          <p className="page-subtitle">All registered client portal accounts — credentials, details & status management</p>
        </div>
        <button onClick={loadAccounts} className="btn-secondary py-2 px-3">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Registered", value: accounts.length, color: "text-indigo-400" },
          { label: "Active Accounts", value: accounts.filter(a => a.status === "ACTIVE").length, color: "text-emerald-400" },
          { label: "Pending KYC", value: accounts.filter(a => a.kycStatus !== "VERIFIED").length, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="philix-card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, client number…"
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} accounts</span>
      </div>

      <div className="philix-card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading portal accounts…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No accounts found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>KYC</th>
                <th>Applications</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="table-row-hover cursor-pointer" onClick={() => loadDetail(a.id)}>
                  <td>
                    <div className="font-semibold text-slate-200">{a.firstName} {a.lastName}</div>
                    <div className="text-xs font-mono text-indigo-400">{a.clientNumber}</div>
                  </td>
                  <td className="text-sm text-slate-400">{a.email}</td>
                  <td className="text-sm text-slate-400">{a.phone}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td>{kycBadge(a.kycStatus)}</td>
                  <td className="text-center text-sm text-slate-300">{a._count.loanApplications}</td>
                  <td className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="text-indigo-400 hover:text-indigo-300 p-1" onClick={e => { e.stopPropagation(); loadDetail(a.id); }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setSelected(null); setResetModal(false); setResetResult(""); }} />
          <div className="relative ml-auto w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <div>
                {selected ? (
                  <>
                    <h2 className="font-bold text-slate-100 text-lg">{selected.firstName} {selected.lastName}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-indigo-400">{selected.clientNumber}</span>
                      {statusBadge(selected.status)}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm">Loading…</div>
                )}
              </div>
              <button onClick={() => { setSelected(null); setResetModal(false); setResetResult(""); }}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            {detailLoading && !selected ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">Loading account details…</div>
            ) : selected ? (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

                {/* Portal Credentials — always expanded first */}
                <div className="philix-card overflow-hidden border border-indigo-800/40">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-indigo-900/20" onClick={() => toggleSection("creds")}>
                    <div className="flex items-center gap-2 font-semibold text-indigo-300 text-sm">
                      <KeyRound size={15} /> Portal Credentials
                    </div>
                    {expandedSection === "creds" ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {(expandedSection === "creds" || expandedSection === null) && (
                    <div className="px-4 py-4 space-y-3 border-t border-indigo-800/30">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Login Email</div>
                          <div className="font-mono text-sm text-slate-200 bg-slate-800 rounded-lg px-3 py-2 break-all">{selected.email}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Password</div>
                          <div className="font-mono text-sm text-slate-400 bg-slate-800 rounded-lg px-3 py-2">
                            {selected.hasPassword ? "••••••••••••" : <span className="text-red-400">Not set</span>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {selected.emailVerified
                            ? <><CheckCircle size={11} className="text-emerald-400" /> Email verified</>
                            : <><AlertTriangle size={11} className="text-amber-400" /> Email not verified</>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {selected.lockedUntil && new Date(selected.lockedUntil) > new Date()
                            ? <><Lock size={11} className="text-red-400" /> Account locked</>
                            : <><CheckCircle size={11} className="text-emerald-400" /> Not locked</>}
                        </div>
                      </div>

                      {/* Reset password */}
                      {!resetModal ? (
                        <button onClick={() => { setResetModal(true); setResetResult(""); setResetError(""); }}
                          className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-900/20 border border-amber-800/40 px-3 py-2 rounded-xl transition-all">
                          <KeyRound size={12} /> Reset Client Password
                        </button>
                      ) : (
                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
                          <div className="text-xs text-slate-400 font-semibold">Set new password for {selected.firstName}:</div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showNewPass ? "text" : "password"}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="New password (min 6 chars)"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                              />
                              <button type="button" onClick={() => setShowNewPass(p => !p)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showNewPass ? "🙈" : "👁"}
                              </button>
                            </div>
                            <button onClick={resetPassword}
                              disabled={newPassword.length < 6}
                              className="btn-primary text-xs py-2 px-3 disabled:opacity-50">
                              Set
                            </button>
                            <button onClick={() => { setResetModal(false); setNewPassword(""); setResetResult(""); setResetError(""); }}
                              className="btn-secondary text-xs py-2 px-3">
                              Cancel
                            </button>
                          </div>
                          {resetResult && (
                            <div className="text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 rounded-lg px-3 py-2 font-mono">
                              ✓ {resetResult}
                            </div>
                          )}
                          {resetError && (
                            <div className="text-xs text-red-400">{resetError}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Personal Details */}
                <div className="philix-card overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => toggleSection("personal")}>
                    <div className="flex items-center gap-2 font-semibold text-slate-300 text-sm">
                      <Users size={14} /> Personal Details
                    </div>
                    {expandedSection === "personal" ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {expandedSection === "personal" && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 grid grid-cols-2 gap-3 text-sm">
                      {[
                        { icon: Mail, label: "Email", value: selected.email },
                        { icon: Phone, label: "Phone", value: selected.phone },
                        { icon: MapPin, label: "City", value: selected.city },
                        { icon: MapPin, label: "Address", value: selected.address },
                        { icon: Calendar, label: "Date of Birth", value: selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : "—" },
                        { icon: Users, label: "Gender", value: selected.gender ?? "—" },
                        { icon: BadgeCheck, label: "NRC Number", value: selected.nrcNumber ?? "—" },
                      ].map(r => (
                        <div key={r.label} className="flex items-start gap-2">
                          <r.icon size={13} className="text-slate-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-500">{r.label}</div>
                            <div className="text-slate-300">{r.value || "—"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Employment */}
                <div className="philix-card overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => toggleSection("employ")}>
                    <div className="flex items-center gap-2 font-semibold text-slate-300 text-sm">
                      <Briefcase size={14} /> Employment & Income
                    </div>
                    {expandedSection === "employ" ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {expandedSection === "employ" && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: "Occupation", value: selected.occupation },
                        { label: "Employer", value: selected.employer },
                        { label: "Monthly Income", value: selected.monthlyIncome ? `K${selected.monthlyIncome.toLocaleString()}` : "—" },
                      ].map(r => (
                        <div key={r.label}>
                          <div className="text-[10px] text-slate-500">{r.label}</div>
                          <div className="text-slate-300">{r.value || "—"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Status */}
                <div className="philix-card overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => toggleSection("status")}>
                    <div className="flex items-center gap-2 font-semibold text-slate-300 text-sm">
                      <ShieldCheck size={14} /> Account Status & Access
                    </div>
                    {expandedSection === "status" ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {expandedSection === "status" && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-[10px] text-slate-500 mb-1">Account Status</div>
                          {statusBadge(selected.status)}
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 mb-1">KYC Status</div>
                          {kycBadge(selected.kycStatus)}
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Last Login</div>
                          <div className="text-slate-300 text-xs">{selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleString() : "Never"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Failed Logins</div>
                          <div className={`text-sm font-bold ${selected.failedLoginCount > 2 ? "text-red-400" : "text-slate-300"}`}>{selected.failedLoginCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Registered</div>
                          <div className="text-slate-300 text-xs">{new Date(selected.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {selected.status !== "ACTIVE" && (
                          <button onClick={() => changeStatus("ACTIVE")} disabled={statusLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 border border-emerald-800/40 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                            <ShieldCheck size={11} /> Activate
                          </button>
                        )}
                        {selected.status !== "SUSPENDED" && (
                          <button onClick={() => changeStatus("SUSPENDED")} disabled={statusLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-900/20 border border-amber-800/40 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                            <ShieldOff size={11} /> Suspend
                          </button>
                        )}
                        {selected.status !== "BLACKLISTED" && (
                          <button onClick={() => changeStatus("BLACKLISTED")} disabled={statusLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-900/20 border border-red-800/40 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                            <Lock size={11} /> Blacklist
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loan Applications */}
                <div className="philix-card overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => toggleSection("loans")}>
                    <div className="flex items-center gap-2 font-semibold text-slate-300 text-sm">
                      <CreditCard size={14} /> Loan Applications ({selected.loanApplications.length})
                    </div>
                    {expandedSection === "loans" ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>
                  {expandedSection === "loans" && (
                    <div className="border-t border-slate-800">
                      {selected.loanApplications.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-sm">No applications yet</div>
                      ) : (
                        <table className="data-table text-xs">
                          <thead>
                            <tr><th>Reference</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {selected.loanApplications.map(app => (
                              <tr key={app.id}>
                                <td className="font-mono text-indigo-400">{app.reference}</td>
                                <td>{app.productType.replace(/_/g, " ")}</td>
                                <td>K{app.amountRequested.toLocaleString()}</td>
                                <td>
                                  <span className={`font-semibold ${
                                    app.status === "APPROVED" || app.status === "DISBURSED" ? "text-emerald-400"
                                    : app.status === "REJECTED" ? "text-red-400"
                                    : app.status === "UNDER_REVIEW" ? "text-blue-400"
                                    : "text-amber-400"
                                  }`}>{app.status}</span>
                                </td>
                                <td className="text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
