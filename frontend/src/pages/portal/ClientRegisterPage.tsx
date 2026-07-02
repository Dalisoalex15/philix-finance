import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle, Eye, EyeOff, ArrowLeft, User, Phone,
  Briefcase, Lock, ShieldCheck, Mail, RefreshCw,
} from "lucide-react";
import PhilixLogo from "../../components/ui/PhilixLogo";
import { useClientAuthStore } from "../../store/clientAuth";
import { savePortalTokens, portalApi } from "../../lib/api";

// Steps: 0=Personal, 1=Identity, 2=Employment, 3=Security
const STEPS = ["Personal", "Identity", "Employment", "Security"];
const STEP_ICONS = [User, ShieldCheck, Briefcase, Lock];

export default function ClientRegisterPage() {
  const navigate   = useNavigate();
  const setClient  = useClientAuthStore(s => s.setClient);

  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState("");

  // ── Step 0: personal ────────────────────────────────────────────────────────
  const [email, setEmail]           = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [phone, setPhone]           = useState("");
  const [dob, setDob]               = useState("");
  const [gender, setGender]         = useState<"MALE" | "FEMALE" | "">("");
  const [address, setAddress]       = useState("");
  const [city, setCity]             = useState("");
  const [branchName, setBranchName] = useState("");

  // ── Step 1: identity ────────────────────────────────────────────────────────
  const [nrcNumber, setNrcNumber]     = useState("");
  const [referralCode, setReferralCode] = useState("");

  // ── Step 2: employment ──────────────────────────────────────────────────────
  const [occupation, setOccupation]     = useState("");
  const [employer, setEmployer]         = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  // ── Step 3: security ────────────────────────────────────────────────────────
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [agreed, setAgreed]       = useState(false);

  // ── Step 0 validation ────────────────────────────────────────────────────────
  function validatePersonal(): string | null {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email address is required.";
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim())  return "Last name is required.";
    if (!phone.trim() || phone.length < 9) return "A valid phone number is required.";
    return null;
  }

  // ── Final submit ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!password || password.length < 8) {
      setApiError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setApiError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setApiError("Please accept the terms to continue.");
      return;
    }
    setSubmitting(true);
    setApiError("");
    try {
      const result = await portalApi.register({
        email,
        firstName, lastName, phone,
        dateOfBirth: dob || undefined,
        gender: gender || undefined,
        address: address || undefined,
        city: city || undefined,
        branchName: branchName || undefined,
        nrcNumber: nrcNumber || undefined,
        referralCode: referralCode || undefined,
        occupation: occupation || undefined,
        employer: employer || undefined,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        password,
      });
      savePortalTokens(result.accessToken, result.refreshToken);
      setClient(result.account);
      navigate("/portal/dashboard", { replace: true });
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step navigation ──────────────────────────────────────────────────────────
  function goNext() {
    setApiError("");
    if (step === 0) {
      const err = validatePersonal();
      if (err) { setApiError(err); return; }
    }
    setStep(s => s + 1);
  }

  function goBack() {
    setApiError("");
    setStep(s => s - 1);
  }

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8">
        <PhilixLogo size="lg" />
      </div>

      <div className="w-full max-w-lg">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${done   ? "bg-amber-500 border-amber-500 text-slate-950"
                  : active ? "bg-slate-900 border-amber-500 text-amber-400"
                  :          "bg-slate-900 border-slate-700 text-slate-600"}`}>
                  {done ? <CheckCircle size={16} /> : <Icon size={14} />}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block
                  ${done ? "text-amber-400" : active ? "text-amber-400" : "text-slate-600"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800 rounded-full mb-8">
          <div
            className="h-1 bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* ── STEP 0: Personal info ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Create your account</h2>
                <p className="text-slate-400 text-sm mt-1">Enter your details to get started.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <Mail size={13} className="inline mr-1.5" />Email address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setApiError(""); }}
                  placeholder="you@example.com"
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">First name *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Daliso"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Last name *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Phiri"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <Phone size={13} className="inline mr-1.5" />Phone number *
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+260 97 1234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of birth</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value as "MALE" | "FEMALE" | "")}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Plot 12, Cairo Road"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Lusaka"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch</label>
                <select value={branchName} onChange={e => setBranchName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
                  <option value="">Select your nearest branch</option>
                  <option value="Lusaka Main">Lusaka — Main Branch</option>
                  <option value="Lusaka Kalingalinga">Lusaka — Kalingalinga</option>
                  <option value="Lusaka Matero">Lusaka — Matero</option>
                  <option value="Ndola">Ndola</option>
                  <option value="Kitwe">Kitwe</option>
                  <option value="Livingstone">Livingstone</option>
                  <option value="Kabwe">Kabwe</option>
                  <option value="Chipata">Chipata</option>
                  <option value="Solwezi">Solwezi</option>
                  <option value="Kasama">Kasama</option>
                  <option value="Mansa">Mansa</option>
                  <option value="Mongu">Mongu</option>
                </select>
              </div>

              {apiError && (
                <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{apiError}</p>
              )}
            </div>
          )}

          {/* ── STEP 1: Identity ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Identity details</h2>
                <p className="text-slate-400 text-sm mt-1">Provide your NRC and referral info (optional).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">NRC / National ID number</label>
                <input type="text" value={nrcNumber} onChange={e => setNrcNumber(e.target.value)}
                  placeholder="123456/78/1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
                <p className="text-slate-500 text-xs mt-1.5">You can also submit this later during KYC verification.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Referral code <span className="text-slate-500">(optional)</span></label>
                <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="PHX-XXXX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
            </div>
          )}

          {/* ── STEP 2: Employment ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Employment &amp; income</h2>
                <p className="text-slate-400 text-sm mt-1">Helps us assess your loan eligibility.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Occupation</label>
                <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
                  placeholder="Civil Servant, Trader, Teacher…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Employer / Business name</label>
                <input type="text" value={employer} onChange={e => setEmployer(e.target.value)}
                  placeholder="Ministry of Education"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Monthly income (ZMW)</label>
                <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)}
                  placeholder="5000"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
            </div>
          )}

          {/* ── STEP 3: Security ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create your password</h2>
                <p className="text-slate-400 text-sm mt-1">At least 8 characters. Choose something strong.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-400 text-xs mt-1.5">Passwords do not match.</p>
                )}
              </div>

              {password && (
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? "w-full bg-emerald-500" :
                        password.length >= 8 ? "w-2/3 bg-amber-500" : "w-1/3 bg-red-500"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                      ? "Strong password" : password.length >= 8 ? "Moderate — add numbers & capitals" : "Too short"}
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 accent-amber-500 cursor-pointer"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  I agree to the{" "}
                  <Link to="/portal/terms" className="text-amber-500 hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/portal/privacy" className="text-amber-500 hover:underline">Privacy Policy</Link>
                </span>
              </label>

              {apiError && (
                <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{apiError}</p>
              )}
            </div>
          )}

          {/* ── Navigation buttons ───────────────────────────────────────────── */}
          <div className={`mt-8 flex gap-3 ${step === 0 ? "justify-end" : "justify-between"}`}>
            {step > 0 && (
              <button
                onClick={goBack}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {step < 3 && (
              <button
                onClick={goNext}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={submitting || !agreed || !password || password !== confirm}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <><RefreshCw size={16} className="animate-spin" /> Creating account…</>
                ) : (
                  <><CheckCircle size={16} /> Create account</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/portal/login" className="text-amber-500 hover:text-amber-400 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
