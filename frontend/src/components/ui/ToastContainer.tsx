import { useToastStore } from "../../store/toastStore";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const STYLES = {
  success: { bar: "bg-emerald-500", icon: CheckCircle, text: "text-emerald-400", bg: "bg-slate-900 border-emerald-800/60" },
  error:   { bar: "bg-red-500",     icon: XCircle,     text: "text-red-400",     bg: "bg-slate-900 border-red-800/60" },
  info:    { bar: "bg-indigo-500",  icon: Info,        text: "text-indigo-400",  bg: "bg-slate-900 border-indigo-800/60" },
  warning: { bar: "bg-amber-500",   icon: AlertTriangle,text: "text-amber-400",  bg: "bg-slate-900 border-amber-800/60" },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const s = STYLES[t.type];
        const Icon = s.icon;
        return (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 w-80 rounded-xl border px-4 py-3 shadow-2xl shadow-black/40 animate-slide-in ${s.bg}`}>
            <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${s.bar}`} />
            <Icon size={15} className={`${s.text} mt-0.5 flex-shrink-0`} />
            <span className="text-sm text-slate-200 flex-1 leading-snug">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate-600 hover:text-slate-400 flex-shrink-0 mt-0.5">
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
