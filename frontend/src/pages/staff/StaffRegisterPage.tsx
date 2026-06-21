import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, CheckCircle, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import PhilixLogo from "../../components/ui/PhilixLogo";

const ROLES = [
  { value: "CEO", label: "Chief Executive Officer", desc: "Full system access, all approvals", color: "text-amber-400" },
  { value: "MANAGER", label: "Branch Manager", desc: "Loan approvals, reports, staff oversight", color: "text-blue-400" },
  { value: "LOAN_OFFICER", label: "Loan Officer", desc: "Client management, loan processing", color: "text-emerald-400" },
  { value: "COLLECTIONS_OFFICER", label: "Collections Officer", desc: "Overdue loans, field visits, recovery", color: "text-orange-400" },
  { value: "ACCOUNTANT", label: "Accountant", desc: "Finance, expenses, reconciliation", color: "text-purple-400" },
];

const DEPARTMENTS = ["Executive", "Operations", "Credit", "Collections", "Finance", "Administration"];

export default function StaffRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    role: "", department: "", employeeNumber: "",
    password: "", confirmPassword: "",
    adminCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.email.includes("@philixfinance.com")) e.email = "Must be a @philixfinance.com email";
    if (!form.phone) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.role) e.role = "Select a role";
    if (!form.department) e.department = "Select a department";
    if (!form.employeeNumber) e.employeeNumber = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (form.adminCode !== "PHILIX2025") e.adminCode = "Invalid admin authorisation code";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) {
      setLoading(true);
      setApiError("");
      try {
        const r = await fetch('/api/auth/staff-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            role: form.role,
            employeeNumber: form.employeeNumber,
            password: form.password,
            adminCode: form.adminCode,
          }),
        });
        const data = await r.json();
        if (r.ok) {
          setDone(true);
        } else {
          setApiError(data.error || 'Registration failed. Please try again.');
        }
      } catch {
        setApiError('Network error — please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedRole = ROLES.find(r => r.value === form.role);

  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 mb-2">{form.firstName} {form.lastName} has been registered as a <span className="text-indigo-400 font-semibold">{selectedRole?.label}</span>.</p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-slate-500 mb-2">Login Credentials</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="text-slate-200 font-mono">{form.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Employee #:</span><span className="text-slate-200">{form.employeeNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Role:</span><span className={`font-semibold ${selectedRole?.color}`}>{selectedRole?.label}</span></div>
            </div>
          </div>
          <button onClick={() => navigate("/staff/login")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl">
            Go to Staff Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="mb-8">
          <PhilixLogo variant="full" size="md" onDark />
          <div className="text-indigo-400 text-xs mt-1.5">Staff Account Registration</div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Personal Info", "Role & Access", "Security"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full transition-all ${i + 1 <= step ? "bg-indigo-500" : "bg-slate-800"}`} />
              <div className={`text-xs mt-1 ${i + 1 === step ? "text-indigo-400 font-semibold" : i + 1 < step ? "text-slate-400" : "text-slate-700"}`}>{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "firstName", label: "First Name", placeholder: "e.g. Daliso" },
                  { key: "lastName", label: "Last Name", placeholder: "e.g. Phiri" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-400 mb-1 block">{f.label} *</label>
                    <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                      placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} />
                    {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Work Email Address *</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                  type="email" placeholder="yourname@philixfinance.com" value={form.email} onChange={e => set("email", e.target.value)} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Phone Number *</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                  placeholder="+260 97 XXX XXXX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Role & Access Level</h3>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Select Role *</label>
                <div className="space-y-2">
                  {ROLES.map(role => (
                    <button key={role.value} onClick={() => set("role", role.value)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${form.role === role.value ? "border-indigo-500 bg-indigo-600/10" : "border-slate-700 hover:border-slate-600"}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${form.role === role.value ? "bg-indigo-400" : "bg-slate-700"}`} />
                      <div>
                        <div className={`text-sm font-semibold ${form.role === role.value ? role.color : "text-slate-300"}`}>{role.label}</div>
                        <div className="text-xs text-slate-500">{role.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Department *</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.department} onChange={e => set("department", e.target.value)}>
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Employee Number *</label>
                  <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                    placeholder="e.g. EMP-006" value={form.employeeNumber} onChange={e => set("employeeNumber", e.target.value)} />
                  {errors.employeeNumber && <p className="text-red-400 text-xs mt-1">{errors.employeeNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Set Password & Authorise</h3>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Password *</label>
                <div className="relative">
                  <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                    type={showPass ? "text" : "password"} placeholder="Minimum 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Confirm Password *</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                  type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-3">
                <label className="text-xs text-amber-400 mb-1 block font-semibold">Admin Authorisation Code *</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-600 font-mono tracking-wider"
                  placeholder="Enter admin code" value={form.adminCode} onChange={e => set("adminCode", e.target.value)} />
                {errors.adminCode && <p className="text-red-400 text-xs mt-1">{errors.adminCode}</p>}
                <p className="text-xs text-slate-500 mt-1">Demo code: <span className="text-amber-400 font-mono">PHILIX2025</span></p>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-4 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 text-sm text-red-400">
              {apiError}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button onClick={handleNext} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
              {loading ? <>Creating Account…</> : step === 3 ? <><UserPlus size={14} /> Create Account</> : <>Continue →</>}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/staff/login" className="text-sm text-slate-500 hover:text-slate-400">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
