import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, Users, TrendingUp, Lock } from "lucide-react";
import PhilixLogo from "../../components/ui/PhilixLogo";
import { useAuthStore } from "../../store/auth";
import { demoStaff } from "../../store/clientAuth";

const DEMO_CREDENTIALS = [
  { role: "CEO", email: "daliso@philixfinance.com", password: "philix@CEO2025", color: "text-amber-400" },
  { role: "Manager", email: "chileshe@philixfinance.com", password: "philix@Mgr2025", color: "text-blue-400" },
  { role: "Loan Officer", email: "patricia@philixfinance.com", password: "philix@LO2025", color: "text-emerald-400" },
  { role: "Collections", email: "inonge@philixfinance.com", password: "philix@Col2025", color: "text-orange-400" },
  { role: "Accountant", email: "chanda@philixfinance.com", password: "philix@Acc2025", color: "text-purple-400" },
];

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const staff = demoStaff.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (!staff) { setError("No account found with this email address."); setLoading(false); return; }

    const rolePasswords: Record<string, string> = {
      "staff-001": "philix@CEO2025",
      "staff-002": "philix@Mgr2025",
      "staff-003": "philix@LO2025",
      "staff-004": "philix@Col2025",
      "staff-005": "philix@Acc2025",
    };
    if (password !== rolePasswords[staff.id]) { setError("Incorrect password. Please try again."); setLoading(false); return; }

    setAuth({
      id: staff.id,
      employeeId: staff.employeeNumber,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role === "CEO" ? "SUPER_ADMIN" : staff.role === "MANAGER" ? "MANAGER" : staff.role === "LOAN_OFFICER" ? "LOAN_OFFICER" : staff.role === "COLLECTIONS_OFFICER" ? "COLLECTIONS_OFFICER" : "ACCOUNTANT",
      mfaEnabled: false,
      avatarUrl: null,
    }, "demo-token");
    navigate("/");
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #10b981 0%, transparent 40%)" }} />
        <div className="relative">
          <div className="mb-12">
            <PhilixLogo variant="full" size="lg" onDark />
            <div className="text-indigo-300 text-xs mt-2">Enterprise Lending System</div>
          </div>
          <h1 className="text-white text-4xl font-black leading-tight mb-4">
            Staff<br />Operations<br />Portal
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Secure access for authorised Philix Finance staff. Manage loans, clients, collections, and financial operations.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: Users, label: "Manage 200+ Active Clients" },
            { icon: TrendingUp, label: "Monitor Portfolio Performance" },
            { icon: Shield, label: "Role-Based Secure Access" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon size={16} className="text-indigo-400 flex-shrink-0" />
              <span className="text-slate-400 text-sm">{f.label}</span>
            </div>
          ))}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-slate-600 text-xs">© 2025 Philix Finance Ltd · Lusaka, Zambia · BoZ Licensed</p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <PhilixLogo variant="full" size="md" onDark />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Staff Access Only</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-1">Use your Philix Finance work email and password</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                placeholder="yourname@philixfinance.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Authenticating...</>
              ) : (
                <><Shield size={14} /> Sign In to Staff Portal</>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demo Credentials — Click to Fill</div>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map(cred => (
                <button key={cred.role} onClick={() => fillDemo(cred)}
                  className="w-full text-left flex items-center justify-between hover:bg-slate-800 rounded-lg px-3 py-2 transition-all group">
                  <div>
                    <span className={`text-xs font-bold ${cred.color}`}>{cred.role}</span>
                    <div className="text-xs text-slate-500">{cred.email}</div>
                  </div>
                  <span className="text-xs text-slate-700 group-hover:text-slate-500 font-mono">{cred.password}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link to="/staff/register" className="text-sm text-indigo-400 hover:text-indigo-300 block">
              Create a new staff account →
            </Link>
            <Link to="/portal" className="text-sm text-slate-500 hover:text-slate-400 block">
              Are you a client? Visit the Client Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
