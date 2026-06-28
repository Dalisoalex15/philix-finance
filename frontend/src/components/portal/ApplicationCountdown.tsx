import { useState, useEffect } from "react";
import { Clock, CheckCircle, Eye, Zap } from "lucide-react";

interface Props {
  submittedAt: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "DISBURSED" | "REPAID";
  reference: string;
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

function getElapsed(from: string) {
  const ms = Math.max(0, Date.now() - new Date(from).getTime());
  const totalSecs = Math.floor(ms / 1000);
  const days    = Math.floor(totalSecs / 86400);
  const hours   = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { days, hours, minutes, seconds, totalSecs };
}

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted — Awaiting Review",
    icon: Clock,
    bg: "from-amber-950/60 to-orange-950/40",
    border: "border-amber-700/40",
    accent: "#F5A623",
    accentBg: "rgba(245,166,35,0.12)",
    badge: "bg-amber-900/60 text-amber-300 border-amber-700/50",
    badgeLabel: "QUEUED",
    showTimer: true,
    message: "Your application is in the queue. Our team reviews all applications within 24–48 hours.",
  },
  UNDER_REVIEW: {
    label: "Under Active Review",
    icon: Eye,
    bg: "from-blue-950/60 to-indigo-950/40",
    border: "border-blue-700/40",
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.12)",
    badge: "bg-blue-900/60 text-blue-300 border-blue-700/50",
    badgeLabel: "REVIEWING",
    showTimer: true,
    message: "A loan officer is actively reviewing your application right now. Decision expected soon.",
  },
  APPROVED: {
    label: "Application Approved",
    icon: CheckCircle,
    bg: "from-emerald-950/60 to-teal-950/40",
    border: "border-emerald-700/40",
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.12)",
    badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
    badgeLabel: "APPROVED",
    showTimer: false,
    message: "Congratulations! Your loan has been approved. Funds are being prepared for disbursement.",
  },
  DISBURSED: {
    label: "Funds Disbursed",
    icon: Zap,
    bg: "from-indigo-950/60 to-violet-950/40",
    border: "border-indigo-700/40",
    accent: "#818cf8",
    accentBg: "rgba(129,140,248,0.12)",
    badge: "bg-indigo-900/60 text-indigo-300 border-indigo-700/50",
    badgeLabel: "ACTIVE",
    showTimer: false,
    message: "Your loan is active. Keep track of your repayments in My Loans.",
  },
  REJECTED: {
    label: "Application Not Approved",
    icon: Clock,
    bg: "from-red-950/60 to-rose-950/40",
    border: "border-red-800/40",
    accent: "#f87171",
    accentBg: "rgba(248,113,113,0.10)",
    badge: "bg-red-900/60 text-red-300 border-red-800/50",
    badgeLabel: "NOT APPROVED",
    showTimer: false,
    message: "This application was not approved. You may re-apply after reviewing your profile.",
  },
  REPAID: {
    label: "Loan Fully Repaid",
    icon: CheckCircle,
    bg: "from-emerald-950/40 to-slate-950/40",
    border: "border-emerald-800/30",
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.08)",
    badge: "bg-emerald-900/40 text-emerald-400 border-emerald-800/40",
    badgeLabel: "REPAID",
    showTimer: false,
    message: "This loan has been fully repaid. Thank you for your commitment!",
  },
};

export default function ApplicationCountdown({ submittedAt, status, reference }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SUBMITTED;
  const [elapsed, setElapsed] = useState(() => getElapsed(submittedAt));

  useEffect(() => {
    if (!cfg.showTimer) return;
    const id = setInterval(() => setElapsed(getElapsed(submittedAt)), 1000);
    return () => clearInterval(id);
  }, [submittedAt, cfg.showTimer]);

  const submittedDate = new Date(submittedAt).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
  const submittedTime = new Date(submittedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${cfg.bg} ${cfg.border} overflow-hidden`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${cfg.accent}22` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: cfg.accentBg }}>
            <Icon size={14} style={{ color: cfg.accent }} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{cfg.label}</p>
            <p className="text-[10px] font-mono" style={{ color: cfg.accent + "aa" }}>{reference}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black tracking-[0.12em] px-2 py-1 rounded-full border ${cfg.badge}`}>
          {cfg.badgeLabel}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Live timer */}
        {cfg.showTimer && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
              Time since submission
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: elapsed.days,    label: "Days" },
                { val: elapsed.hours,   label: "Hours" },
                { val: elapsed.minutes, label: "Mins" },
                { val: elapsed.seconds, label: "Secs" },
              ].map(unit => (
                <div key={unit.label}
                  className="flex flex-col items-center py-3 rounded-xl"
                  style={{ background: cfg.accentBg, border: `1px solid ${cfg.accent}22` }}>
                  <span className="text-2xl font-black tabular-nums leading-none"
                    style={{ color: cfg.accent }}>
                    {pad(unit.val)}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Processing progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[9px] text-slate-600 mb-1">
                <span>Submitted</span>
                <span>Under Review</span>
                <span>Decision</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: status === "UNDER_REVIEW" ? "60%" : "25%",
                    background: `linear-gradient(90deg, ${cfg.accent}88, ${cfg.accent})`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: cfg.accent }}>✓ Done</span>
                <span className={`text-[9px] ${status === "UNDER_REVIEW" ? "" : "text-slate-600"}`}
                  style={status === "UNDER_REVIEW" ? { color: cfg.accent } : {}}>
                  {status === "UNDER_REVIEW" ? "✓ Done" : "Pending"}
                </span>
                <span className="text-[9px] text-slate-600">
                  {elapsed.days < 2 ? "Est. soon" : elapsed.days < 4 ? "In progress" : "Today"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="rounded-xl px-3 py-2.5"
          style={{ background: cfg.accentBg, border: `1px solid ${cfg.accent}20` }}>
          <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{cfg.message}</p>
        </div>

        {/* Submitted metadata */}
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>Submitted {submittedDate}</span>
          <span className="font-mono">{submittedTime}</span>
        </div>
      </div>
    </div>
  );
}
