import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { mockUser } from "../lib/mock-data";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("daliso@philixfinance.com");
  const [password, setPassword] = useState("admin1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    if (email === "daliso@philixfinance.com" && password === "admin1234") {
      setAuth(mockUser as any, "demo-token-" + Date.now());
      navigate("/", { replace: true });
    } else {
      setError("Invalid email or password. Use demo credentials shown below.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-emerald-950/10 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-white font-black text-xl">PF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Philix Finance</h1>
          <p className="text-slate-400 text-sm mt-1">Creating a Future Together</p>
        </div>

        {/* Card */}
        <div className="philix-card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-100">Sign in</h2>
            <p className="text-sm text-slate-400 mt-1">Access the Loan Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="input-base pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@philixfinance.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-base pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-md p-3">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm font-semibold">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="text-xs font-semibold text-slate-400 mb-2">Demo Credentials</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-300 font-mono">daliso@philixfinance.com</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Password:</span>
                <span className="text-slate-300 font-mono">admin1234</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Role:</span>
                <span className="text-indigo-400">Super Admin (CEO)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-600">
          © 2025 Philix Finance · Lusaka, Zambia · All rights reserved
        </div>
      </div>
    </div>
  );
}
