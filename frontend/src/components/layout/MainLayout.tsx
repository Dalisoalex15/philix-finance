import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ToastContainer from "../ui/ToastContainer";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, LogOut, Search, X, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { cn } from "../../lib/utils";

interface Alert {
  type: string; severity: string; title: string; detail: string; href: string; ts: string;
}

const SEVERITY_ICON = (s: string) => {
  if (s === "danger") return <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />;
  if (s === "warn")   return <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />;
  if (s === "success") return <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />;
  return <Info size={13} className="text-blue-400 flex-shrink-0" />;
};

const SEVERITY_DOT: Record<string, string> = {
  danger: "bg-red-500", warn: "bg-amber-500", success: "bg-emerald-500", info: "bg-blue-500",
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastReadRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const loadAlerts = useCallback(async () => {
    const token = localStorage.getItem("philix_staff_token");
    if (!token) return;
    try {
      const r = await fetch("/api/dashboard/alerts", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const data: Alert[] = await r.json();
      setAlerts(data);
      const lastTs = lastReadRef.current;
      const newCount = lastTs ? data.filter(a => a.ts > lastTs).length : data.filter(a => a.severity === "danger" || a.severity === "warn").length;
      setUnreadCount(newCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadAlerts(); const t = setInterval(loadAlerts, 60_000); return () => clearInterval(t); }, [loadAlerts]);

  const openBell = () => {
    setBellOpen(v => !v);
    setUserOpen(false);
    if (!bellOpen) {
      lastReadRef.current = new Date().toISOString();
      setUnreadCount(0);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleLabel = (r?: string) => ({ SUPER_ADMIN: "CEO / Admin", MANAGER: "Manager", LOAN_OFFICER: "Loan Officer", COLLECTIONS_OFFICER: "Collections", ACCOUNTANT: "Accountant" }[r ?? ""] ?? (r ?? ""));

  const now = new Date();

  return (
    <div className="flex h-screen overflow-hidden bg-[#060F1E]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-5 gap-4 flex-shrink-0 bg-[#060F1E]">
          {/* Search */}
          <button onClick={() => navigate("/search")}
            className="flex items-center gap-2 bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl px-3 py-1.5 text-sm text-white/25 hover:text-white/40 transition-all w-48">
            <Search size={13} />
            <span className="text-[12px]">Search…</span>
            <kbd className="ml-auto text-[10px] bg-white/5 border border-white/10 px-1 rounded font-mono text-white/20">⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* Date */}
          <div className="hidden lg:block text-right">
            <div className="text-[10px] text-white/20 font-medium">{now.toLocaleDateString("en-ZM", { weekday: "short", day: "numeric", month: "short" })}</div>
            <div className="text-[11px] font-mono text-white/35 font-semibold">{now.toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>

          <div className="w-px h-5 bg-white/5" />

          {/* Notification bell */}
          <div className="relative">
            <button onClick={openBell}
              className={cn("relative p-2 rounded-xl transition-all border", bellOpen ? "bg-white/10 border-white/10 text-white" : "text-white/25 hover:text-white/60 border-transparent hover:border-white/5 hover:bg-white/5")}>
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center border border-[#060F1E]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[#0B1F3A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Notifications</span>
                  <button onClick={() => setBellOpen(false)} className="text-white/20 hover:text-white/50"><X size={13} /></button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-white/25">All clear — no active alerts</div>
                  ) : alerts.map((a, i) => (
                    <button key={i} onClick={() => { navigate(a.href); setBellOpen(false); }}
                      className="flex items-start gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left">
                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", SEVERITY_DOT[a.severity] ?? "bg-blue-500")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1.5">
                          {SEVERITY_ICON(a.severity)}
                          <div className="text-[11px] font-semibold text-white/70 leading-snug">{a.title}</div>
                        </div>
                        <div className="text-[10px] text-white/35 mt-0.5 leading-snug line-clamp-2">{a.detail}</div>
                        <div className="text-[9px] text-white/20 mt-1">{timeAgo(a.ts)}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/5">
                  <button onClick={loadAlerts} className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors">
                    <Zap size={9} /> Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => { setUserOpen(v => !v); setBellOpen(false); }}
              className={cn("flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all", userOpen ? "bg-white/10 border-white/10" : "border-transparent hover:border-white/5 hover:bg-white/5")}>
              <div className="w-7 h-7 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center text-[10px] font-bold text-[#C9A227]">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-[11px] font-semibold text-white/70 leading-tight">{user?.firstName} {user?.lastName}</div>
                <div className="text-[9px] text-white/30 leading-tight">{roleLabel(user?.role)}</div>
              </div>
            </button>
            {userOpen && (
              <div className="absolute right-0 top-11 w-52 bg-[#0B1F3A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="text-[12px] font-semibold text-white/80">{user?.firstName} {user?.lastName}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{user?.email}</div>
                  <div className="text-[10px] font-bold text-[#C9A227] mt-1">{roleLabel(user?.role)}</div>
                </div>
                <div className="py-1.5 px-2">
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {(bellOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setBellOpen(false); setUserOpen(false); }} />
      )}
      <ToastContainer />
    </div>
  );
}
