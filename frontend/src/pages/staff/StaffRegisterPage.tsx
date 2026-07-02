import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, CheckCircle, Eye, EyeOff, AlertCircle, ArrowLeft, Briefcase, Shield, Users, DollarSign, FileText } from "lucide-react";
import PhilixLogo from "../../components/ui/PhilixLogo";

const ROLES = [
  { value: "CEO",                label: "Chief Executive Officer", desc: "Full system access, all approvals", icon: Shield,    color: "#C9A227" },
  { value: "MANAGER",            label: "Branch Manager",          desc: "Loan approvals, reports, staff oversight", icon: Users, color: "#6366f1" },
  { value: "LOAN_OFFICER",       label: "Loan Officer",            desc: "Client management, loan processing", icon: FileText, color: "#10b981" },
  { value: "COLLECTIONS_OFFICER",label: "Collections Officer",     desc: "Overdue loans, field visits, recovery", icon: Briefcase, color: "#f97316" },
  { value: "ACCOUNTANT",         label: "Accountant",              desc: "Finance, expenses, reconciliation", icon: DollarSign, color: "#8b5cf6" },
];

const DEPARTMENTS = ["Executive", "Operations", "Credit", "Collections", "Finance", "Administration"];

const inp = "w-full border border-gray-300 text-gray-900 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400";
const lbl = "text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide";

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
    if (!form.email.includes("@")) e.email = "Valid email required";
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
            role: form.role === "CEO" ? "SUPER_ADMIN" : form.role,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 mb-2">{form.firstName} {form.lastName} has been registered as a <span className="text-indigo-600 font-semibold">{selectedRole?.label}</span>.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-left">
            <div className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Login Credentials</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-800 font-mono font-semibold text-xs">{form.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Employee #</span>
                <span className="text-gray-800">{form.employeeNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Role</span>
                <span className="font-semibold" style={{ color: selectedRole?.color }}>{selectedRole?.label}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/login")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all">
            Go to Staff Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 bg-[#0B1F3A] p-8 flex-shrink-0">
        <div>
          <PhilixLogo variant="full" size="md" onDark />
          <div className="text-indigo-300 text-xs mt-2">Staff Account Registration</div>
          <div className="mt-10 space-y-4">
            {["Personal Information", "Role & Access Level", "Password & Security"].map((label, i) => (
              <div key={label} className={`flex items-center gap-3 transition-all ${step > i + 1 ? "opacity-60" : step === i + 1 ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-[#C9A227] text-[#0B1F3A]" : "bg-white/10 text-white/30"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium ${step === i + 1 ? "text-white" : "text-white/40"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-white/20 leading-relaxed">
          New staff accounts are saved directly to the database. The admin authorisation code is required to prevent unauthorised signups.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <PhilixLogo variant="full" size="md" />
            <div className="text-gray-500 text-xs mt-1">Staff Account Registration</div>
            <div className="flex gap-1 mt-4">
              {[1,2,3].map(n => (
                <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-indigo-500" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-500 text-sm mt-1">Enter the staff member's basic details</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "firstName", label: "First Name", placeholder: "e.g. Daliso" },
                    { key: "lastName",  label: "Last Name",  placeholder: "e.g. Phiri" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className={lbl}>{f.label} *</label>
                      <input className={inp + (errors[f.key] ? " border-red-400 ring-1 ring-red-400" : "")}
                        placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} />
                      {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  <label className={lbl}>Work Email Address *</label>
                  <input className={inp + (errors.email ? " border-red-400 ring-1 ring-red-400" : "")}
                    type="email" placeholder="yourname@philixfinance.com" value={form.email} onChange={e => set("email", e.target.value)} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-400 mt-1">Any email address is accepted</p>
                </div>
                <div>
                  <label className={lbl}>Phone Number *</label>
                  <input className={inp + (errors.phone ? " border-red-400 ring-1 ring-red-400" : "")}
                    placeholder="+260 97 XXX XXXX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Role & Access Level</h3>
                  <p className="text-gray-500 text-sm mt-1">Select the role that matches this staff member's responsibilities</p>
                </div>
                <div>
                  <label className={lbl}>Select Role *</label>
                  <div className="space-y-2">
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      return (
                        <button key={role.value} type="button" onClick={() => set("role", role.value)}
                          className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${form.role === role.value ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: form.role === role.value ? `${role.color}20` : "#f3f4f6" }}>
                            <Icon size={16} style={{ color: form.role === role.value ? role.color : "#6b7280" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold ${form.role === role.value ? "text-indigo-700" : "text-gray-800"}`}>{role.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{role.desc}</div>
                          </div>
                          {form.role === role.value && <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Department *</label>
                    <select className={inp + (errors.department ? " border-red-400" : "")}
                      value={form.department} onChange={e => set("department", e.target.value)}>
                      <option value="">Select department…</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                  </div>
                  <div>
                    <label className={lbl}>Employee Number *</label>
                    <input className={inp + (errors.employeeNumber ? " border-red-400" : "")}
                      placeholder="e.g. EMP-006" value={form.employeeNumber} onChange={e => set("employeeNumber", e.target.value)} />
                    {errors.employeeNumber && <p className="text-red-500 text-xs mt-1">{errors.employeeNumber}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Password & Security</h3>
                  <p className="text-gray-500 text-sm mt-1">Set a strong password and enter the admin authorisation code</p>
                </div>
                <div>
                  <label className={lbl}>Password *</label>
                  <div className="relative">
                    <input className={inp + (errors.password ? " border-red-400 ring-1 ring-red-400" : "") + " pr-10"}
                      type={showPass ? "text" : "password"} placeholder="Minimum 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className={lbl}>Confirm Password *</label>
                  <input className={inp + (errors.confirmPassword ? " border-red-400 ring-1 ring-red-400" : "")}
                    type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <label className="text-xs text-amber-700 mb-1.5 block font-bold uppercase tracking-wide">Admin Authorisation Code *</label>
                  <input className="w-full border border-amber-300 bg-white text-gray-900 rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                    placeholder="Enter admin code" value={form.adminCode} onChange={e => set("adminCode", e.target.value)} />
                  {errors.adminCode && <p className="text-red-500 text-xs mt-1">{errors.adminCode}</p>}
                  <p className="text-xs text-amber-600 mt-1.5">Contact your CEO or system administrator for this code</p>
                </div>
              </div>
            )}

            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mt-4">
                <AlertCircle size={15} className="flex-shrink-0" /> {apiError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-xl hover:border-gray-400 transition-all">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <button type="button" onClick={handleNext} disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
                {loading ? "Creating Account…" : step === 3 ? <><UserPlus size={14} /> Create Account</> : "Continue →"}
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
