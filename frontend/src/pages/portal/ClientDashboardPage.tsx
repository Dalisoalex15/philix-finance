import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useClientAuthStore } from "../../store/clientAuth";
import {
  FileText, Shield, ChevronRight, Clock, CheckCircle, Bell,
  Zap, Phone, Calculator, BadgeCheck, ListChecks, Gift, Star,
  AlertCircle, ArrowRight, Sparkles, ShieldCheck, Receipt,
  RefreshCw, Quote, TrendingUp, CreditCard, ArrowUpRight,
} from "lucide-react";
import { mockLoanProducts } from "../../lib/mock-data";

interface PortalApplication {
  id: string;
  reference: string;
  productType: string;
  amountRequested: number;
  termMonths: number;
  purpose?: string;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
}

const K = (n: number) =>
  `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  SUBMITTED:    { label: "Submitted",    color: "text-amber-400",   bg: "bg-amber-900/30 border-amber-700/40",     dot: "bg-amber-400" },
  UNDER_REVIEW: { label: "Under Review", color: "text-sky-400",     bg: "bg-sky-900/30 border-sky-700/40",         dot: "bg-sky-400 animate-pulse" },
  APPROVED:     { label: "Approved",     color: "text-emerald-400", bg: "bg-emerald-900/30 border-emerald-700/40", dot: "bg-emerald-400" },
  DISBURSED:    { label: "Active",       color: "text-indigo-400",  bg: "bg-indigo-900/30 border-indigo-700/40",   dot: "bg-indigo-400" },
  REJECTED:     { label: "Not Approved", color: "text-red-400",     bg: "bg-red-900/30 border-red-700/40",         dot: "bg-red-400" },
};

// ─── Credit Score calculation ─────────────────────────────────────────────
function calcCreditScore(apps: PortalApplication[], kycVerified: boolean, joinedAt: string): number {
  let score = 300;
  if (kycVerified) score += 150;
  const monthsOld = Math.floor((Date.now() - new Date(joinedAt).getTime()) / (30 * 86400000));
  score += Math.min(80, monthsOld * 8);
  const submitted = apps.length;
  score += Math.min(60, submitted * 20);
  const approved = apps.filter(a => a.status === "APPROVED" || a.status === "DISBURSED").length;
  score += Math.min(140, approved * 70);
  const disbursed = apps.filter(a => a.status === "DISBURSED").length;
  score += Math.min(80, disbursed * 80);
  const hasRejection = apps.some(a => a.status === "REJECTED");
  if (!hasRejection && apps.length > 0) score += 100;
  return Math.min(850, Math.max(300, score));
}

function scoreColor(s: number) {
  if (s >= 780) return "#10b981";
  if (s >= 720) return "#34d399";
  if (s >= 650) return "#F5A623";
  if (s >= 550) return "#f97316";
  return "#ef4444";
}
function scoreLabel(s: number) {
  if (s >= 780) return "Excellent";
  if (s >= 720) return "Very Good";
  if (s >= 650) return "Good";
  if (s >= 550) return "Fair";
  return "Building";
}

// ─── SVG Credit Score Gauge ────────────────────────────────────────────────
function CreditGauge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(300);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 300;
    const step = Math.ceil((score - 300) / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayed(score); clearInterval(timer); }
      else setDisplayed(start);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const cx = 160, cy = 148, r = 118;
  const pct = Math.max(0, Math.min(1, (displayed - 300) / 550));
  const arcLen = Math.PI * r; // semicircle
  const filled = pct * arcLen;
  const color = scoreColor(displayed);
  // needle angle: 0 = 180° (left), 1 = 0° (right) → maps to π → 0
  const needleAngle = Math.PI - pct * Math.PI;
  const needleLen = r - 24;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 320 165" width="100%" style={{ maxWidth: 320 }}>
        <defs>
          <linearGradient id="gauge-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#F5A623" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#F5A623" />
            <stop offset="80%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#gauge-bg)" strokeWidth="20" strokeLinecap="round"
        />
        {/* Filled arc */}
        {filled > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="url(#gauge-fill)" strokeWidth="20" strokeLinecap="round"
            strokeDasharray={`${filled} ${arcLen}`}
            style={{ transition: "stroke-dasharray 0.05s linear" }}
          />
        )}

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const a = Math.PI - p * Math.PI;
          const i1 = r - 30, i2 = r - 18;
          return (
            <line key={i}
              x1={cx + i1 * Math.cos(a)} y1={cy - i1 * Math.sin(a)}
              x2={cx + i2 * Math.cos(a)} y2={cy - i2 * Math.sin(a)}
              stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          );
        })}

        {/* Tick labels */}
        {[{p:0, label:"300"},{p:0.5, label:"575"},{p:1, label:"850"}].map(({p, label}, i) => {
          const a = Math.PI - p * Math.PI;
          const d = r + 16;
          return (
            <text key={i}
              x={cx + d * Math.cos(a)} y={cy - d * Math.sin(a)}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(148,163,184,0.6)" fontSize="9" fontWeight="600">
              {label}
            </text>
          );
        })}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke={color} strokeWidth="3" strokeLinecap="round"
          style={{ transition: "x2 0.05s linear, y2 0.05s linear" }} />
        <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.3" />
        <circle cx={cx} cy={cy} r="6" fill={color} />
        <circle cx={cx} cy={cy} r="3" fill="#0f172a" />

        {/* Score number */}
        <text x={cx} y={cy - 38} textAnchor="middle" fill="white"
          fontSize="46" fontWeight="900" fontFamily="system-ui"
          style={{ letterSpacing: "-2px" }}>
          {displayed}
        </text>
        <text x={cx} y={cy - 14} textAnchor="middle"
          fill={color} fontSize="11" fontWeight="800" letterSpacing="2">
          {scoreLabel(displayed).toUpperCase()}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle"
          fill="rgba(148,163,184,0.5)" fontSize="8" fontWeight="600">
          PHILIX CREDIT SCORE
        </text>
      </svg>

      {/* Score breakdown pills */}
      <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
        {[
          { label: "Poor", range: "300–549", active: score < 550 },
          { label: "Fair", range: "550–649", active: score >= 550 && score < 650 },
          { label: "Good", range: "650–719", active: score >= 650 && score < 720 },
          { label: "Great", range: "720–779", active: score >= 720 && score < 780 },
          { label: "Excellent", range: "780+", active: score >= 780 },
        ].map(t => (
          <div key={t.label}
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${t.active ? "text-white" : "text-slate-600"}`}
            style={{ background: t.active ? scoreColor(score) + "30" : "transparent", border: `1px solid ${t.active ? scoreColor(score) + "60" : "transparent"}` }}>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Virtual Loan Card ─────────────────────────────────────────────────────
function VirtualCard({ app, monthlyPayment, daysToNext, nextPaymentDate }: {
  app: PortalApplication; monthlyPayment: number; daysToNext: number; nextPaymentDate: string;
}) {
  const overdue = daysToNext < 0;
  const nearDue = !overdue && daysToNext <= 3;
  const ref = app.reference;
  const masked = `${ref}  ••••  ••••  PHILIX`;

  return (
    <div className="relative overflow-hidden rounded-2xl select-none"
      style={{
        background: "linear-gradient(135deg, #1e0a6e 0%, #0d1559 35%, #0B1F3A 70%, #0a2440 100%)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        minHeight: 192,
      }}>
      {/* Shimmer blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)" }} />
      </div>

      <div className="relative p-5 flex flex-col h-full" style={{ minHeight: 192 }}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-auto">
          <div>
            <p className="text-[9px] font-bold tracking-[3px] uppercase mb-1" style={{ color: "rgba(245,166,35,0.7)" }}>
              Philix Finance
            </p>
            <p className="text-[10px] text-slate-500 font-mono">{ref}</p>
          </div>
          {/* Chip */}
          <div className="w-9 h-7 rounded-md" style={{ background: "linear-gradient(135deg, #d4a843, #f5c842)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)" }}>
            <div className="w-full h-full rounded-md" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)" }} />
          </div>
        </div>

        {/* Amount */}
        <div className="my-3">
          <p className="text-[9px] text-slate-500 mb-0.5 uppercase tracking-wide">Loan Amount</p>
          <p className="text-3xl font-black text-white" style={{ letterSpacing: "-1px" }}>{K(app.amountRequested)}</p>
        </div>

        {/* Card number style */}
        <p className="text-slate-500 font-mono text-[10px] mb-3 tracking-widest">{masked}</p>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] text-slate-600 uppercase tracking-wide">Monthly</p>
            <p className="text-base font-bold text-white">{K(monthlyPayment)}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-slate-600 uppercase tracking-wide">Product</p>
            <p className="text-[10px] font-semibold text-slate-300">
              {app.productType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-600 uppercase tracking-wide">Next Due</p>
            <p className={`text-xs font-bold ${overdue ? "text-red-400" : nearDue ? "text-amber-400" : "text-emerald-400"}`}>
              {nextPaymentDate
                ? new Date(nextPaymentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : "—"}
            </p>
            <p className="text-[8px] text-slate-600">
              {overdue ? `${Math.abs(daysToNext)}d overdue` : daysToNext === 0 ? "today" : `in ${daysToNext}d`}
            </p>
          </div>
        </div>
      </div>

      {overdue && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 20px rgba(239,68,68,0.15)" }} />
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function ClientDashboardPage() {
  const client = useClientAuthStore(s => s.client);
  const accessToken = useClientAuthStore(s => s.accessToken);
  const [apps, setApps] = useState<PortalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<{ id: string; subject: string; body: string; createdAt: string }[]>([]);
  const [annIdx, setAnnIdx] = useState(0);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    const h = { Authorization: `Bearer ${accessToken}` };
    Promise.all([
      fetch("/api/portal/applications", { headers: h }).then(r => r.ok ? r.json() : []),
      fetch("/api/portal/notifications/announcements", { headers: h }).then(r => r.ok ? r.json() : []),
    ])
      .then(([a, n]) => { setApps(Array.isArray(a) ? a : []); setAnnouncements(Array.isArray(n) ? n : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!client) return null;

  const initials = `${client.firstName?.[0] ?? ""}${client.lastName?.[0] ?? ""}`.toUpperCase();
  const kycVerified = client.kycStatus === "VERIFIED";
  const activeLoan = apps.find(a => a.status === "DISBURSED" || a.status === "APPROVED");
  const pendingApps = apps.filter(a => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW");
  const unread = apps.filter(a => a.status !== "SUBMITTED").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const creditScore = calcCreditScore(apps, kycVerified, client.joinedAt ?? new Date().toISOString());

  const termMonths = activeLoan?.termMonths ?? 3;
  const subMs = activeLoan ? (new Date(activeLoan.createdAt).getTime() || 0) : 0;
  const monthsElapsed = subMs > 0
    ? Math.min(termMonths, Math.floor((Date.now() - subMs) / (30 * 86400000))) : 0;
  const pct = termMonths > 0 ? Math.round((monthsElapsed / termMonths) * 100) : 0;
  const nextMs = subMs > 0 ? subMs + (monthsElapsed + 1) * 30 * 86400000 : 0;
  const nextDate = nextMs > 0 ? new Date(nextMs).toISOString().slice(0, 10) : "";
  const daysToNext = nextDate
    ? Math.ceil((new Date(nextDate).getTime() - Date.now()) / 86400000) : 0;
  const monthlyPayment = activeLoan
    ? Math.round((activeLoan.amountRequested * 1.04 * termMonths) / Math.max(termMonths, 1)) : 0;

  const onboardingSteps = [
    { label: "Create your account", done: true },
    { label: "Verify your identity (KYC)", done: kycVerified, href: "/portal/kyc" },
    { label: "Apply for your first loan", done: apps.length > 0, href: "/portal/apply" },
    { label: "Receive disbursement", done: apps.some(a => a.status === "DISBURSED") },
  ];
  const obDone = onboardingSteps.filter(s => s.done).length;

  return (
    <div className="max-w-2xl mx-auto pb-12" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl mb-4"
        style={{ background: "linear-gradient(135deg, #05102a 0%, #0b1f3a 50%, #130a3d 100%)" }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 60%)" }} />
          <div style={{ position:"absolute", bottom:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)" }} />
        </div>

        <div className="relative px-5 pt-5 pb-1">
          {/* Top greeting row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 8px 24px rgba(79,70,229,0.4)" }}>
                {initials}
              </div>
              {kycVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ background: "#10b981", borderColor: "#05102a" }}>
                  <BadgeCheck size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">{greeting},</p>
              <h1 className="text-lg font-black text-white leading-tight">{client.firstName} {client.lastName}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{client.clientNumber}</span>
                {kycVerified
                  ? <span className="text-[9px] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-0.5"><BadgeCheck size={7}/> Verified</span>
                  : <Link to="/portal/kyc" className="text-[9px] font-bold text-amber-400 bg-amber-900/30 border border-amber-700/40 px-2 py-0.5 rounded-full">Verify ID →</Link>
                }
              </div>
            </div>
            <Link to="/portal/apply"
              className="hidden sm:flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex-shrink-0"
              style={{ background: "#F5A623", color: "#0B1F3A", boxShadow: "0 4px 16px rgba(245,166,35,0.4)" }}>
              <Zap size={12} /> Apply
            </Link>
          </div>

          {/* ── CREDIT SCORE GAUGE ── */}
          <div className="mb-2">
            <CreditGauge score={creditScore} />
          </div>

          {/* Score factors strip */}
          <div className="grid grid-cols-3 gap-2 pb-5">
            {[
              { label: "KYC Status",  value: kycVerified ? "Verified" : "Pending", ok: kycVerified },
              { label: "Loans",       value: `${apps.filter(a=>a.status==="DISBURSED").length} active`, ok: true },
              { label: "Repayments",  value: daysToNext >= 0 ? "On Track" : "Overdue", ok: daysToNext >= 0 },
            ].map(f => (
              <div key={f.label} className="rounded-xl px-3 py-2 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className={`text-xs font-bold ${f.ok ? "text-emerald-400" : "text-red-400"}`}>{f.value}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ KYC ALERT ═══════════════════════════════════════════════════════ */}
      {!kycVerified && (
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4"
          style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(120,53,15,0.08))", border: "1px solid rgba(245,166,35,0.25)" }}>
          <Shield size={18} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-300">Identity verification required</p>
            <p className="text-xs text-slate-500 mt-0.5">Verify to boost your credit score and unlock higher loan amounts</p>
          </div>
          <Link to="/portal/kyc" className="text-xs font-black px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: "#F5A623", color: "#0B1F3A" }}>Verify</Link>
        </div>
      )}

      {/* ══ PENDING BADGE ═══════════════════════════════════════════════════ */}
      {pendingApps.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
          style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-sky-300 flex-1 font-medium">
            <strong>{pendingApps.length}</strong> application{pendingApps.length > 1 ? "s" : ""} currently being reviewed
          </p>
          <Link to="/portal/loans" className="text-xs font-bold text-sky-400 hover:text-sky-300">
            Track <ArrowRight size={10} className="inline" />
          </Link>
        </div>
      )}

      {/* ══ ACTIVE LOAN CARD ════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-600 mb-4">
          <RefreshCw size={18} className="animate-spin mr-2" />Loading…
        </div>
      ) : activeLoan ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Loan</p>
            <Link to="/portal/loans" className="text-xs text-indigo-400 flex items-center gap-0.5">
              Manage <ChevronRight size={10}/>
            </Link>
          </div>
          <VirtualCard app={activeLoan} monthlyPayment={monthlyPayment} daysToNext={daysToNext} nextPaymentDate={nextDate} />

          {/* Term progress */}
          <div className="mt-3 rounded-2xl p-4"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,1)" }}>
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{monthsElapsed} of {termMonths} months elapsed</span>
              <span className="font-bold text-indigo-400">{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,1)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4f46e5, #818cf8)", transition: "width 1s ease" }} />
            </div>
            <div className="flex gap-3 mt-3">
              <Link to="/portal/loans"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Receipt size={12} /> Submit Payment
              </Link>
              <Link to="/portal/loans"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <FileText size={12} /> Download Agreement
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl p-8 text-center"
          style={{ background: "rgba(15,23,42,0.6)", border: "2px dashed rgba(79,70,229,0.3)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.1))" }}>
            <CreditCard size={26} className="text-indigo-400" />
          </div>
          <p className="font-bold text-slate-300 mb-1">No active loan</p>
          <p className="text-xs text-slate-600 mb-5 max-w-xs mx-auto">Apply today and track everything right here</p>
          <Link to="/portal/apply"
            className="inline-flex items-center gap-2 text-sm font-black px-6 py-3 rounded-xl"
            style={{ background: "#F5A623", color: "#0B1F3A", boxShadow: "0 4px 16px rgba(245,166,35,0.35)" }}>
            <FileText size={14} /> Apply for a Loan
          </Link>
        </div>
      )}

      {/* ══ QUICK ACTIONS ═══════════════════════════════════════════════════ */}
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { to:"/portal/apply",      icon:FileText,    label:"Apply",      g:"135deg, #4f46e5, #7c3aed", sh:"rgba(79,70,229,0.35)" },
            { to:"/portal/loans",      icon:CreditCard,  label:"My Loans",   g:"135deg, #059669, #0d9488", sh:"rgba(5,150,105,0.35)" },
            { to:"/portal/calculator", icon:Calculator,  label:"Calculator", g:"135deg, #d97706, #b45309", sh:"rgba(217,119,6,0.35)" },
            { to:"/portal/kyc",        icon:ShieldCheck, label:"KYC",        g:"135deg, #be185d, #9f1239", sh:"rgba(190,24,93,0.35)" },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center gap-2 p-3.5 rounded-2xl text-center transition-all hover:scale-105"
              style={{ background: `linear-gradient(${a.g})`, boxShadow: `0 6px 20px ${a.sh}` }}>
              <a.icon size={22} className="text-white/90" />
              <span className="text-[10px] font-bold text-white leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══ APPLICATIONS TIMELINE ══════════════════════════════════════════ */}
      {apps.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Applications</p>
            <Link to="/portal/loans" className="text-xs text-indigo-400 flex items-center gap-0.5">
              View all <ChevronRight size={10}/>
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(30,41,59,1)" }}>
            {apps.slice(0, 4).map((app, i) => {
              const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.SUBMITTED;
              return (
                <Link key={app.id} to="/portal/loans"
                  className={`flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/3 ${i > 0 ? "border-t border-slate-800/60" : ""}`}
                  style={{ background: i === 0 ? "rgba(15,23,42,0.9)" : "rgba(10,17,35,0.8)" }}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    {i < apps.slice(0,4).length - 1 && <div className="w-px h-6 bg-slate-800" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {app.productType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">{app.reference} · {new Date(app.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-200">{K(app.amountRequested)}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ANNOUNCEMENTS ═══════════════════════════════════════════════════ */}
      {announcements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">From Philix Finance</p>
          <div className="relative overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #100e38 100%)", border: "1px solid rgba(245,166,35,0.2)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: "radial-gradient(circle at 90% 10%, rgba(245,166,35,0.15) 0%, transparent 70%)" }} />
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,166,35,0.15)" }}>
                  <Sparkles size={13} style={{ color: "#F5A623" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] uppercase tracking-widest text-slate-600">Philix Finance</p>
                  <p className="text-xs font-bold text-white">{announcements[annIdx].subject}</p>
                </div>
                <p className="text-[9px] text-slate-700">
                  {new Date(announcements[annIdx].createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                </p>
              </div>
              <div className="flex gap-2 mb-4">
                <Quote size={16} className="flex-shrink-0 mt-0.5 opacity-20" style={{ color: "#F5A623" }} />
                <p className="text-sm text-slate-300 leading-relaxed italic">{announcements[annIdx].body}</p>
              </div>
              {announcements.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {announcements.map((_, i) => (
                    <button key={i} onClick={() => setAnnIdx(i)}
                      className="rounded-full transition-all"
                      style={{ width: i === annIdx ? 18 : 5, height: 5, background: i === annIdx ? "#F5A623" : "rgba(255,255,255,0.12)" }} />
                  ))}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => setAnnIdx(i => Math.max(0, i-1))} disabled={annIdx===0}
                      className="w-6 h-6 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 text-sm"
                      style={{ background:"rgba(255,255,255,0.06)" }}>‹</button>
                    <button onClick={() => setAnnIdx(i => Math.min(announcements.length-1, i+1))} disabled={annIdx===announcements.length-1}
                      className="w-6 h-6 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 text-sm"
                      style={{ background:"rgba(255,255,255,0.06)" }}>›</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ ONBOARDING (new clients) ════════════════════════════════════════ */}
      {!activeLoan && obDone < 4 && (
        <div className="mb-4 rounded-2xl p-5"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,1)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks size={14} className="text-indigo-400" />
              <span className="text-sm font-bold text-slate-300">Getting Started</span>
            </div>
            <span className="text-xs font-black" style={{ color: "#F5A623" }}>{obDone}/4 complete</span>
          </div>
          <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(30,41,59,1)" }}>
            <div className="h-full rounded-full" style={{ width:`${(obDone/4)*100}%`, background:"linear-gradient(90deg, #4f46e5, #F5A623)", transition:"width 0.8s ease" }} />
          </div>
          <div className="space-y-2">
            {onboardingSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold border ${s.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-700 text-slate-600"}`}>
                  {s.done ? <CheckCircle size={11}/> : i+1}
                </div>
                <span className={`text-sm flex-1 ${s.done ? "line-through text-slate-600" : "text-slate-300"}`}>{s.label}</span>
                {!s.done && s.href && (
                  <Link to={s.href} className="text-[10px] font-bold flex items-center gap-0.5" style={{ color:"#F5A623" }}>
                    Start <ChevronRight size={9}/>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ LOAN PRODUCTS ════════════════════════════════════════════════════ */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Our Products</p>
          <Link to="/portal/apply" className="text-xs text-indigo-400 flex items-center gap-0.5">Apply <ChevronRight size={10}/></Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockLoanProducts.filter(p => p.isActive).map((prod, i) => {
            const grads = [
              "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
              "linear-gradient(135deg, #451a03 0%, #92400e 100%)",
              "linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)",
            ];
            const accents = ["#818cf8","#34d399","#fbbf24","#c084fc"];
            const lowestRate = Math.min(...prod.rates.map(r => r.interestRate));
            return (
              <div key={prod.id} className="relative overflow-hidden rounded-2xl p-4"
                style={{ background: grads[i%grads.length], border:"1px solid rgba(255,255,255,0.05)" }}>
                <div className="absolute right-2 top-2 opacity-5"><TrendingUp size={56}/></div>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color:accents[i%accents.length] }}>
                  {prod.productType.replace(/_/g," ")}
                </p>
                <p className="text-xl font-black text-white mb-0.5">K{prod.maxAmount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mb-3">Up to · from {lowestRate}%/mo</p>
                <Link to="/portal/apply"
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.12)", color:"white" }}>
                  Apply <ArrowUpRight size={9}/>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ NOTIFICATIONS + LOYALTY ══════════════════════════════════════════ */}
      <div className="space-y-3">
        <Link to="/portal/notifications"
          className="flex items-center gap-4 rounded-2xl px-4 py-4 transition-all group"
          style={{ background:"rgba(15,23,42,0.8)", border:"1px solid rgba(30,41,59,1)" }}>
          <div className="relative w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Bell size={16} className="text-indigo-400"/>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-300">Notifications</p>
            <p className="text-xs text-slate-600">{unread > 0 ? `${unread} update${unread>1?"s":""} on your account` : "No new notifications"}</p>
          </div>
          <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400"/>
        </Link>

        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{ background:"linear-gradient(135deg, rgba(120,53,15,0.25), rgba(180,83,9,0.12))", border:"1px solid rgba(245,166,35,0.18)" }}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-[0.07] pointer-events-none">★</div>
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:"rgba(245,166,35,0.12)" }}>
              {activeLoan ? <Star size={18} style={{color:"#F5A623"}}/> : <Gift size={18} style={{color:"#F5A623"}}/>}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color:"#F5A623" }}>
                {activeLoan ? "Loyal Client Benefit" : "First-Time Borrower Offer"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeLoan
                  ? "Repay on time to unlock lower rates and higher limits on your next loan."
                  : "New clients enjoy reduced fees on their first loan. Apply today!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE CTA ═══════════════════════════════════════════════════════ */}
      <div className="sm:hidden space-y-2.5 mt-4">
        <Link to="/portal/apply"
          className="w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl text-sm"
          style={{ background:"#F5A623", color:"#0B1F3A", boxShadow:"0 6px 20px rgba(245,166,35,0.4)" }}>
          <Zap size={15}/> Apply for a New Loan
        </Link>
        <a href="tel:+260777158901"
          className="w-full flex items-center justify-center gap-2 text-slate-400 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background:"rgba(15,23,42,0.8)", border:"1px solid rgba(30,41,59,1)" }}>
          <Phone size={14}/> +260 777 158 901
        </a>
      </div>
    </div>
  );
}
