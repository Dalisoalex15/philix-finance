import { Bell, Menu, Search, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { cn } from "../../lib/utils";

interface HeaderProps { onMenuToggle: () => void; }

export default function Header({ onMenuToggle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-ZM", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const notifications = [
    { id: 1, title: "Overdue loan: PHX-L-2024-0012", message: "Bwalya Mutale — 23 days late", time: "2h ago", type: "warning" },
    { id: 2, title: "Payment received", message: "K2,450 from Mwansa Tembo", time: "4h ago", type: "success" },
    { id: 3, title: "New client registered", message: "Mwila Chileshe added by Patricia", time: "5h ago", type: "info" },
    { id: 4, title: "Loan approved", message: "PHX-L-2024-0034 approved by Manager", time: "6h ago", type: "success" },
  ];

  const roleLabel = (role?: string) => {
    const map: Record<string, string> = {
      SUPER_ADMIN: "CEO / Super Admin",
      MANAGER: "Manager",
      LOAN_OFFICER: "Loan Officer",
      COLLECTIONS_OFFICER: "Collections Officer",
      ACCOUNTANT: "Accountant",
    };
    return role ? (map[role] ?? role.replace(/_/g, " ")) : "";
  };

  return (
    <header className="h-16 border-b border-warm-200 bg-white flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-navy-500 hover:text-navy-900 transition-colors p-1.5 rounded-lg hover:bg-warm-100"
        >
          <Menu size={20} />
        </button>

        {/* Quick search */}
        <div className="hidden md:flex items-center gap-2 bg-warm-100 border border-warm-200 hover:border-gold-400 rounded-lg px-3 py-1.5 w-64 cursor-pointer transition-colors"
          onClick={() => navigate("/search")}>
          <Search size={14} className="text-navy-400" />
          <span className="text-navy-400 text-sm">Search clients, loans...</span>
          <kbd className="ml-auto text-xs text-navy-300 bg-white border border-warm-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Center: date/time */}
      <div className="hidden lg:flex items-center gap-2 text-center">
        <div>
          <div className="text-xs text-navy-400 font-medium">{dateStr}</div>
          <div className="text-sm font-mono text-navy-700 font-semibold">{timeStr}</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-navy-500 hover:text-navy-900 hover:bg-warm-100 rounded-lg transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-warm-200 rounded-xl shadow-xl z-50 animate-fade-in">
              <div className="p-3 border-b border-warm-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-navy-900" style={{ fontFamily: "Fraunces, serif" }}>Notifications</span>
                <button className="text-xs text-gold-600 hover:text-gold-700 font-medium">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-warm-50 cursor-pointer">
                    <div className="flex gap-2.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-navy-400"
                      )} />
                      <div>
                        <div className="text-xs font-semibold text-navy-800">{n.title}</div>
                        <div className="text-xs text-navy-500 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-navy-300 mt-1">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-warm-100">
                <button className="text-xs text-gold-600 hover:text-gold-700 font-medium" onClick={() => setNotifOpen(false)}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-warm-200" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-warm-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 text-xs font-bold border-2 border-gold-500/30">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-navy-900">{user?.firstName} {user?.lastName}</div>
              <div className="text-[10px] text-navy-400">{roleLabel(user?.role)}</div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white border border-warm-200 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="p-3 border-b border-warm-100 bg-warm-50">
                <div className="text-xs font-semibold text-navy-900">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{user?.email}</div>
                <div className="text-[10px] font-semibold text-gold-600 mt-1">{roleLabel(user?.role)}</div>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-navy-700 hover:bg-warm-50 transition-colors">
                  <User size={14} className="text-navy-400" /> Profile Settings
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(dropdownOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setNotifOpen(false); }} />
      )}
    </header>
  );
}
